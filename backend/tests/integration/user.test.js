import { beforeAll, beforeEach, describe, expect, test } from "bun:test";
import request from "supertest";

import app from "../../src/app.js";
import db, { initializeDatabase, testConnection } from "../../src/database/connection.js";

describe("Users API", () => {
    beforeAll(async () => {
        // we check if we are in the test environment and using a test database.
        if (process.env.NODE_ENV !== "test") {
            throw new Error("NODE_ENV must be test.");
        }

        if (!process.env.DB_NAME?.endsWith("_test")) {
            throw new Error(`Refusing to use non-test database: ${process.env.DB_NAME}`);
        }

        await testConnection();

        await initializeDatabase();

        console.log("Integration database ready.");
    });

    beforeEach(async () => {
        await db.execute("DELETE FROM users");
    });

    describe("POST /api/users", () => {
        test("creates a new user", async () => {
            const response = await request(app).post("/api/users").send({
                name: "Rodrigo",
                email: "rodrigo@test.com",
                password: "password123",
                timezone: "America/Montevideo",
            });

            expect(response.status).toBe(201);

            expect(response.body.success).toBe(true);

            expect(response.body.data.name).toBe("Rodrigo");
            expect(response.body.data.email).toBe("rodrigo@test.com");
            expect(response.body.data.timezone).toBe("America/Montevideo");

            expect(response.body.data.password).toBeUndefined();
            expect(response.body.data.passwordHash).toBeUndefined();
        });
    });

    describe("GET /api/users/:id", () => {
        test("returns an existing user", async () => {
            const createResponse = await request(app).post("/api/users").send({
                name: "Rodrigo",
                email: "rodrigo@test.com",
                password: "password123",
                timezone: "America/Montevideo",
            });

            const userId = createResponse.body.data.id;

            const response = await request(app).get(`/api/users/${userId}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            expect(response.body.data.id).toBe(userId);
            expect(response.body.data.name).toBe("Rodrigo");
            expect(response.body.data.email).toBe("rodrigo@test.com");
        });
    });

    describe("GET /api/users/email/:email", () => {
        test("returns an existing user by email", async () => {
            await request(app).post("/api/users").send({
                name: "Rodrigo",
                email: "rodrigo@test.com",
                password: "password123",
                timezone: "America/Montevideo",
            });

            const response = await request(app).get("/api/users/email/rodrigo@test.com");

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            expect(response.body.data.email).toBe("rodrigo@test.com");
        });
    });

    describe("DELETE /api/users/:id", () => {
        test("deletes an existing user", async () => {
            const createResponse = await request(app).post("/api/users").send({
                name: "Rodrigo",
                email: "rodrigo@test.com",
                password: "password123",
                timezone: "America/Montevideo",
            });

            const userId = createResponse.body.data.id;

            const deleteResponse = await request(app).delete(`/api/users/${userId}`);

            expect(deleteResponse.status).toBe(204);

            const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [userId]);

            expect(rows.length).toBe(0);
        });
    });
});
