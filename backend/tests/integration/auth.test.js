import { beforeAll, beforeEach, describe, expect, test } from "bun:test";
import request from "supertest";

import app from "../../src/app.js";
import db, { initializeDatabase, testConnection } from "../../src/database/connection.js";

describe("Auth API", () => {
    beforeAll(async () => {
        if (process.env.NODE_ENV !== "test") {
            throw new Error("NODE_ENV must be test.");
        }

        if (!process.env.DB_NAME?.endsWith("_test")) {
            throw new Error(`Refusing to use non-test database: ${process.env.DB_NAME}`);
        }

        await testConnection();
        await initializeDatabase();
    });

    beforeEach(async () => {
        await db.execute("DELETE FROM users");
    });

    describe("POST /api/auth/register", () => {
        test("registers a new user and returns an access token", async () => {
            const response = await request(app).post("/api/auth/register").send({
                name: "Rodrigo",
                email: "rodrigo@test.com",
                password: "password123",
                timezone: "America/Montevideo",
            });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);

            expect(response.body.data.user.id).toBeDefined();
            expect(response.body.data.user.name).toBe("Rodrigo");
            expect(response.body.data.user.email).toBe("rodrigo@test.com");

            expect(response.body.data.accessToken).toBeDefined();
            expect(typeof response.body.data.accessToken).toBe("string");

            expect(response.body.data.user.passwordHash).toBeUndefined();

            expect(response.body.data.user.password).toBeUndefined();
        });

        test("returns 409 when email is already registered", async () => {
            const userData = {
                name: "Rodrigo",
                email: "rodrigo@test.com",
                password: "password123",
                timezone: "America/Montevideo",
            };

            await request(app).post("/api/auth/register").send(userData);

            const response = await request(app).post("/api/auth/register").send(userData);

            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("A user with this email already exists.");
        });
    });

    describe("POST /api/auth/login", () => {
        test("logs in with valid credentials", async () => {
            await request(app).post("/api/auth/register").send({
                name: "Rodrigo",
                email: "rodrigo@test.com",
                password: "password123",
                timezone: "America/Montevideo",
            });

            const response = await request(app).post("/api/auth/login").send({
                email: "rodrigo@test.com",
                password: "password123",
            });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            expect(response.body.data.user.email).toBe("rodrigo@test.com");

            expect(response.body.data.accessToken).toBeDefined();

            expect(response.body.data.user.passwordHash).toBeUndefined();
        });

        test("returns 401 when password is incorrect", async () => {
            await request(app).post("/api/auth/register").send({
                name: "Rodrigo",
                email: "rodrigo@test.com",
                password: "password123",
            });

            const response = await request(app).post("/api/auth/login").send({
                email: "rodrigo@test.com",
                password: "wrong-password",
            });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);

            expect(response.body.message).toBe("Invalid email or password.");
        });

        test("returns 401 when user does not exist", async () => {
            const response = await request(app).post("/api/auth/login").send({
                email: "missing@test.com",
                password: "password123",
            });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe("Invalid email or password.");
        });
    });

    describe("GET /api/users/me", () => {
        test("returns the authenticated user", async () => {
            const registerResponse = await request(app).post("/api/auth/register").send({
                name: "Rodrigo",
                email: "rodrigo@test.com",
                password: "password123",
                timezone: "America/Montevideo",
            });

            const accessToken = registerResponse.body.data.accessToken;

            const userId = registerResponse.body.data.user.id;

            const response = await request(app).get("/api/users/me").set("Authorization", `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            expect(response.body.data.id).toBe(userId);
            expect(response.body.data.name).toBe("Rodrigo");
            expect(response.body.data.email).toBe("rodrigo@test.com");

            expect(response.body.data.passwordHash).toBeUndefined();
        });

        test("returns 401 without an access token", async () => {
            const response = await request(app).get("/api/users/me");

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);

            expect(response.body.message).toBe("Access token is required.");
        });

        test("returns 401 with an invalid access token", async () => {
            const response = await request(app)
                .get("/api/users/me")
                .set("Authorization", "Bearer definitely-not-a-jwt");

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);

            expect(response.body.message).toBe("Invalid or expired access token.");
        });
    });

    describe("DELETE /api/users/me", () => {
        test("deletes the authenticated user", async () => {
            const registerResponse = await request(app).post("/api/auth/register").send({
                name: "Rodrigo",
                email: "rodrigo@test.com",
                password: "password123",
            });

            expect(registerResponse.status).toBe(201);
            expect(registerResponse.body.success).toBe(true);

            const accessToken = registerResponse.body.data.accessToken;

            const userId = registerResponse.body.data.user.id;

            const response = await request(app).delete("/api/users/me").set("Authorization", `Bearer ${accessToken}`);

            expect(response.status).toBe(204);

            const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [userId]);

            expect(rows.length).toBe(0);
        });

        test("returns 401 without an access token", async () => {
            const response = await request(app).delete("/api/users/me");

            expect(response.status).toBe(401);
        });
    });
});
