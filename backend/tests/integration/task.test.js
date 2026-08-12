import { beforeAll, beforeEach, describe, expect, test } from "bun:test";
import request from "supertest";

import app from "../../src/app.js";
import db, { initializeDatabase, testConnection } from "../../src/database/connection.js";

describe("Tasks API", () => {
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
        await db.execute("DELETE FROM tasks");
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

    async function createSubject(accessToken, name = "Math") {
        const response = await request(app).post("/api/subjects").set("Authorization", `Bearer ${accessToken}`).send({
            name,
            color: "#FF0000",
        });

        expect(response.status).toBe(201);

        return response.body.data;
    }

    async function createTask(
        accessToken,
        {
            subjectId = null,
            title = "Finish homework",
            description = "Complete the math exercises.",
            type = "assignment",
            deadline = "2026-08-30 23:59:59",
            estimatedEffortMinutes = 120,
            priority = 3,
        } = {},
    ) {
        const response = await request(app).post("/api/tasks").set("Authorization", `Bearer ${accessToken}`).send({
            subjectId,
            title,
            description,
            type,
            deadline,
            estimatedEffortMinutes,
            priority,
        });

        return response;
    }

    describe("POST /api/tasks", () => {
        test("creates a new task with a subject", async () => {
            const { user, accessToken } = await registerUser();

            const subject = await createSubject(accessToken);

            const response = await createTask(accessToken, {
                subjectId: subject.id,
            });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);

            expect(response.body.data.id).toBeDefined();
            expect(response.body.data.userId).toBe(user.id);
            expect(response.body.data.subjectId).toBe(subject.id);

            expect(response.body.data.title).toBe("Finish homework");

            expect(response.body.data.description).toBe("Complete the math exercises.");

            expect(response.body.data.type).toBe("assignment");

            expect(response.body.data.estimatedEffortMinutes).toBe(120);

            expect(response.body.data.estimationMethod).toBe("manual");

            expect(response.body.data.estimationMetadata).toBeNull();

            expect(response.body.data.priority).toBe(3);
            expect(response.body.data.status).toBe("pending");
        });

        test("creates a task without a subject", async () => {
            const { user, accessToken } = await registerUser();

            const response = await createTask(accessToken, {
                subjectId: null,
                title: "General study",
                type: "study",
            });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);

            expect(response.body.data.userId).toBe(user.id);
            expect(response.body.data.subjectId).toBeNull();
            expect(response.body.data.title).toBe("General study");
        });

        test("returns 401 without authentication", async () => {
            const response = await request(app).post("/api/tasks").send({
                title: "Finish homework",
                type: "assignment",
                deadline: "2026-08-30 23:59:59",
                estimatedEffortMinutes: 120,
            });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        test("returns 400 when estimated effort is negative", async () => {
            const { accessToken } = await registerUser();

            const response = await createTask(accessToken, {
                estimatedEffortMinutes: -60,
            });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);

            expect(response.body.message).toBe("Estimated effort must be a positive number.");
        });

        test("returns 404 when subject does not exist", async () => {
            const { accessToken } = await registerUser();

            const response = await createTask(accessToken, {
                subjectId: 999999,
            });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Subject not found.");
        });

        test("does not allow using another user's subject", async () => {
            const userA = await registerUser("user-a@test.com");

            const userB = await registerUser("user-b@test.com");

            const subjectA = await createSubject(userA.accessToken, "User A Math");

            const response = await createTask(userB.accessToken, {
                subjectId: subjectA.id,
            });

            expect(response.status).toBe(404);

            expect(response.body.message).toBe("Subject not found.");
        });
    });

    describe("GET /api/tasks/:id", () => {
        test("returns an existing task", async () => {
            const { accessToken } = await registerUser();

            const subject = await createSubject(accessToken);

            const createResponse = await createTask(accessToken, {
                subjectId: subject.id,
            });

            expect(createResponse.status).toBe(201);

            const taskId = createResponse.body.data.id;

            const response = await request(app)
                .get(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            expect(response.body.data.id).toBe(taskId);
            expect(response.body.data.subjectId).toBe(subject.id);

            expect(response.body.data.title).toBe("Finish homework");
        });

        test("returns 404 when task does not exist", async () => {
            const { accessToken } = await registerUser();

            const response = await request(app).get("/api/tasks/999999").set("Authorization", `Bearer ${accessToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Task not found.");
        });

        test("does not allow another user to access the task", async () => {
            const userA = await registerUser("user-a@test.com");

            const userB = await registerUser("user-b@test.com");

            const createResponse = await createTask(userA.accessToken);

            const taskId = createResponse.body.data.id;

            const response = await request(app)
                .get(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${userB.accessToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Task not found.");
        });
    });

    describe("GET /api/tasks", () => {
        test("returns all tasks for the authenticated user", async () => {
            const { accessToken } = await registerUser();

            await createTask(accessToken, {
                title: "Task A",
            });

            await createTask(accessToken, {
                title: "Task B",
            });

            const response = await request(app).get("/api/tasks").set("Authorization", `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            expect(response.body.data).toHaveLength(2);

            expect(response.body.data[0].userId).toBeDefined();
            expect(response.body.data[1].userId).toBeDefined();
        });

        test("returns only tasks belonging to the authenticated user", async () => {
            const userA = await registerUser("user-a@test.com");

            const userB = await registerUser("user-b@test.com");

            await createTask(userA.accessToken, {
                title: "User A task",
            });

            await createTask(userB.accessToken, {
                title: "User B task",
            });

            const response = await request(app).get("/api/tasks").set("Authorization", `Bearer ${userA.accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(1);

            expect(response.body.data[0].title).toBe("User A task");

            expect(response.body.data[0].userId).toBe(userA.user.id);
        });
    });

    describe("PATCH /api/tasks/:id", () => {
        test("updates an existing task", async () => {
            const { accessToken } = await registerUser();

            const createResponse = await createTask(accessToken);

            const taskId = createResponse.body.data.id;

            const response = await request(app)
                .patch(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    title: "Updated homework",
                    estimatedEffortMinutes: 180,
                    priority: 5,
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            expect(response.body.data.title).toBe("Updated homework");

            expect(response.body.data.estimatedEffortMinutes).toBe(180);

            expect(response.body.data.estimationMethod).toBe("manual");

            expect(response.body.data.estimationMetadata).toBeNull();

            expect(response.body.data.priority).toBe(5);
        });

        test("can assign a subject to an existing task", async () => {
            const { accessToken } = await registerUser();

            const subject = await createSubject(accessToken);

            const createResponse = await createTask(accessToken, {
                subjectId: null,
            });

            const taskId = createResponse.body.data.id;

            const response = await request(app)
                .patch(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    subjectId: subject.id,
                });

            expect(response.status).toBe(200);
            expect(response.body.data.subjectId).toBe(subject.id);
        });

        test("can remove the subject from a task", async () => {
            const { accessToken } = await registerUser();

            const subject = await createSubject(accessToken);

            const createResponse = await createTask(accessToken, {
                subjectId: subject.id,
            });

            const taskId = createResponse.body.data.id;

            const response = await request(app)
                .patch(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    subjectId: null,
                });

            expect(response.status).toBe(200);
            expect(response.body.data.subjectId).toBeNull();
        });

        test("does not allow assigning another user's subject", async () => {
            const userA = await registerUser("user-a@test.com");

            const userB = await registerUser("user-b@test.com");

            const subjectB = await createSubject(userB.accessToken);

            const createResponse = await createTask(userA.accessToken);

            const taskId = createResponse.body.data.id;

            const response = await request(app)
                .patch(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${userA.accessToken}`)
                .send({
                    subjectId: subjectB.id,
                });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Subject not found.");
        });

        test("does not allow another user to update the task", async () => {
            const userA = await registerUser("user-a@test.com");

            const userB = await registerUser("user-b@test.com");

            const createResponse = await createTask(userA.accessToken);

            const taskId = createResponse.body.data.id;

            const response = await request(app)
                .patch(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${userB.accessToken}`)
                .send({
                    title: "Hacked title",
                });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Task not found.");
        });
    });

    describe("DELETE /api/tasks/:id", () => {
        test("deletes an existing task", async () => {
            const { accessToken } = await registerUser();

            const createResponse = await createTask(accessToken);

            const taskId = createResponse.body.data.id;

            const deleteResponse = await request(app)
                .delete(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(deleteResponse.status).toBe(204);

            const [rows] = await db.execute(
                `
                    SELECT *
                    FROM tasks
                    WHERE id = ?
                `,
                [taskId],
            );

            expect(rows.length).toBe(0);
        });

        test("does not allow another user to delete the task", async () => {
            const userA = await registerUser("user-a@test.com");

            const userB = await registerUser("user-b@test.com");

            const createResponse = await createTask(userA.accessToken);

            const taskId = createResponse.body.data.id;

            const response = await request(app)
                .delete(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${userB.accessToken}`);

            expect(response.status).toBe(404);

            const [rows] = await db.execute(
                `
                    SELECT *
                    FROM tasks
                    WHERE id = ?
                `,
                [taskId],
            );

            expect(rows.length).toBe(1);
        });

        test("returns 401 without authentication", async () => {
            const response = await request(app).delete("/api/tasks/1");

            expect(response.status).toBe(401);
        });
    });
});
