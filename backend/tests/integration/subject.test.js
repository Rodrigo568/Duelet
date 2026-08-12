import { beforeAll, beforeEach, describe, expect, test } from "bun:test";
import request from "supertest";

import app from "../../src/app.js";
import db, { initializeDatabase, testConnection } from "../../src/database/connection.js";

describe("Subjects API", () => {
    beforeAll(async () => {
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
        await db.execute("DELETE FROM subjects");
        await db.execute("DELETE FROM users");
    });

    async function registerUser(email = "rodrigo@test.com") {
        const response = await request(app).post("/api/auth/register").send({
            name: "Rodrigo",
            email,
            password: "password123",
            timezone: "America/Montevideo",
        });

        expect(response.status).toBe(201);

        return {
            user: response.body.data.user,
            accessToken: response.body.data.accessToken,
        };
    }

    describe("POST /api/subjects", () => {
        test("creates a new subject", async () => {
            const { user, accessToken } = await registerUser();

            const response = await request(app)
                .post("/api/subjects")
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    name: "Math",
                    color: "#FF0000",
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);

            expect(response.body.data.userId).toBe(user.id);
            expect(response.body.data.name).toBe("Math");
            expect(response.body.data.color).toBe("#FF0000");
        });

        test("returns 401 without authentication", async () => {
            const response = await request(app).post("/api/subjects").send({
                name: "Math",
                color: "#FF0000",
            });

            expect(response.status).toBe(401);
        });
    });

    describe("GET /api/subjects/:id", () => {
        test("returns an existing subject", async () => {
            const { user, accessToken } = await registerUser();

            const createResponse = await request(app)
                .post("/api/subjects")
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    name: "Math",
                    color: "#FF0000",
                });

            expect(createResponse.status).toBe(201);

            const subjectId = createResponse.body.data.id;

            const response = await request(app)
                .get(`/api/subjects/${subjectId}`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            expect(response.body.data.id).toBe(subjectId);
            expect(response.body.data.userId).toBe(user.id);
            expect(response.body.data.name).toBe("Math");
            expect(response.body.data.color).toBe("#FF0000");
        });
    });

    describe("GET /api/subjects", () => {
        test("returns all subjects for the authenticated user", async () => {
            const { accessToken } = await registerUser();

            await request(app).post("/api/subjects").set("Authorization", `Bearer ${accessToken}`).send({
                name: "Math",
                color: "#FF0000",
            });

            await request(app).post("/api/subjects").set("Authorization", `Bearer ${accessToken}`).send({
                name: "Science",
                color: "#00FF00",
            });

            const response = await request(app).get("/api/subjects").set("Authorization", `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(2);
        });
    });

    describe("PATCH /api/subjects/:id", () => {
        test("updates an existing subject", async () => {
            const { accessToken } = await registerUser();

            const createResponse = await request(app)
                .post("/api/subjects")
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    name: "Math",
                    color: "#FF0000",
                });

            expect(createResponse.status).toBe(201);

            const subjectId = createResponse.body.data.id;

            const response = await request(app)
                .patch(`/api/subjects/${subjectId}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    name: "Mathematics",
                    color: "#0000FF",
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            expect(response.body.data.name).toBe("Mathematics");
            expect(response.body.data.color).toBe("#0000FF");
        });
    });

    describe("DELETE /api/subjects/:id", () => {
        test("deletes an existing subject", async () => {
            const { accessToken } = await registerUser();

            const createResponse = await request(app)
                .post("/api/subjects")
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    name: "Math",
                    color: "#FF0000",
                });

            expect(createResponse.status).toBe(201);

            const subjectId = createResponse.body.data.id;

            const deleteResponse = await request(app)
                .delete(`/api/subjects/${subjectId}`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(deleteResponse.status).toBe(204);

            const getResponse = await request(app)
                .get(`/api/subjects/${subjectId}`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(getResponse.status).toBe(404);
        });
    });
});
