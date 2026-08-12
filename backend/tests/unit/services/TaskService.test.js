import { describe, expect, mock, test } from "bun:test";

import TaskService from "../../../src/services/TaskService.js";

describe("TaskService", () => {
    describe("createTask", () => {
        test("creates a task when the subject exists", async () => {
            const taskRepository = {
                findById: mock(async () => null),
                create: mock(async (task) => ({
                    ...task,
                    id: 1,
                })),
            };

            const subjectRepository = {
                findById: mock(async () => ({
                    id: 1,
                    userId: 1,
                    name: "Math",
                })),
            };

            const taskService = new TaskService(taskRepository, subjectRepository);

            const userId = 1;

            const taskData = {
                subjectId: 1,
                title: "Complete homework",
                description: "Finish the math exercises",
                type: "homework",
                deadline: new Date("2024-06-30T23:59:59Z"),
                estimatedEffortMinutes: 60,
                priority: 4,
            };

            const task = await taskService.createTask(userId, taskData);

            expect(task.id).toBe(1);
            expect(task.userId).toBe(1);
            expect(task.subjectId).toBe(1);
            expect(task.title).toBe("Complete homework");
            expect(task.description).toBe("Finish the math exercises");
            expect(task.type).toBe("homework");
            expect(task.deadline.toISOString()).toBe("2024-06-30T23:59:59.000Z");
            expect(task.estimatedEffortMinutes).toBe(60);
            expect(task.estimationMethod).toBe("manual");
            expect(task.estimationMetadata).toBeNull();
            expect(task.priority).toBe(4);
            expect(task.status).toBe("pending");

            expect(subjectRepository.findById).toHaveBeenCalledWith(1, 1);
            expect(taskRepository.create).toHaveBeenCalledTimes(1);
        });

        test("throws when the subject does not exist", async () => {
            const taskRepository = {
                findById: mock(async () => null),
                create: mock(async () => null),
            };

            const subjectRepository = {
                findById: mock(async () => null),
            };

            const taskService = new TaskService(taskRepository, subjectRepository);

            const userId = 1;

            const taskData = {
                subjectId: 999,
                title: "Complete homework",
                description: "Finish the math exercises",
                type: "homework",
                deadline: new Date("2024-06-30T23:59:59Z"),
                estimatedEffortMinutes: 60,
                priority: 4,
            };

            await expect(taskService.createTask(userId, taskData)).rejects.toThrow("Subject not found.");

            expect(subjectRepository.findById).toHaveBeenCalledWith(999, 1);
            expect(taskRepository.create).not.toHaveBeenCalled();
        });

        test("creates a task without a subject", async () => {
            const taskRepository = {
                create: mock(async (task) => ({
                    ...task,
                    id: 1,
                })),
            };

            const subjectRepository = {
                findById: mock(async () => null),
            };

            const taskService = new TaskService(taskRepository, subjectRepository);

            const userId = 1;

            const taskData = {
                title: "Study general concepts",
                description: "Review notes",
                type: "study",
                deadline: new Date("2024-06-30T23:59:59Z"),
                estimatedEffortMinutes: 60,
                priority: 3,
            };

            const task = await taskService.createTask(userId, taskData);

            expect(task.id).toBe(1);
            expect(task.subjectId).toBeNull();

            expect(subjectRepository.findById).not.toHaveBeenCalled();
            expect(taskRepository.create).toHaveBeenCalledTimes(1);
        });

        test("throws when estimatedEffortMinutes is negative", async () => {
            const taskRepository = {
                findById: mock(async () => null),
                create: mock(async () => null),
            };

            const subjectRepository = {
                findById: mock(async () => ({
                    id: 1,
                    userId: 1,
                    name: "Math",
                })),
            };

            const taskService = new TaskService(taskRepository, subjectRepository);

            const userId = 1;

            const taskData = {
                subjectId: 1,
                title: "Complete homework",
                description: "Finish the math exercises",
                type: "homework",
                deadline: new Date("2024-06-30T23:59:59Z"),
                estimatedEffortMinutes: -10,
                priority: 4,
            };

            await expect(taskService.createTask(userId, taskData)).rejects.toThrow(
                "Estimated effort must be a positive number.",
            );

            expect(subjectRepository.findById).not.toHaveBeenCalled();
            expect(taskRepository.create).not.toHaveBeenCalled();
        });
    });

    describe("getTaskById", () => {
        test("returns the task with the specified ID", async () => {
            const taskRepository = {
                findById: mock(async () => ({
                    id: 1,
                    userId: 1,
                    subjectId: 1,
                    title: "Complete homework",
                    description: "Finish the math exercises",
                    type: "homework",
                    deadline: new Date("2024-06-30T23:59:59Z"),
                    estimatedEffortMinutes: 60,
                    estimationMethod: "manual",
                    estimationMetadata: null,
                    priority: 4,
                    status: "pending",
                })),
            };

            const subjectRepository = {
                findById: mock(async () => null),
            };

            const taskService = new TaskService(taskRepository, subjectRepository);

            const task = await taskService.getTaskById(1, 1);

            expect(task.id).toBe(1);
            expect(task.userId).toBe(1);
            expect(task.subjectId).toBe(1);
            expect(task.title).toBe("Complete homework");
            expect(task.description).toBe("Finish the math exercises");
            expect(task.type).toBe("homework");
            expect(task.deadline.toISOString()).toBe("2024-06-30T23:59:59.000Z");
            expect(task.estimatedEffortMinutes).toBe(60);
            expect(task.estimationMethod).toBe("manual");
            expect(task.estimationMetadata).toBeNull();
            expect(task.priority).toBe(4);
            expect(task.status).toBe("pending");

            expect(taskRepository.findById).toHaveBeenCalledWith(1, 1);
        });

        test("throws when the task does not exist", async () => {
            const taskRepository = {
                findById: mock(async () => null),
            };

            const subjectRepository = {
                findById: mock(async () => null),
            };

            const taskService = new TaskService(taskRepository, subjectRepository);

            await expect(taskService.getTaskById(999, 1)).rejects.toThrow("Task not found.");

            expect(taskRepository.findById).toHaveBeenCalledWith(999, 1);
        });

        test("throws when the ID is missing", async () => {
            const taskRepository = {
                findById: mock(async () => null),
            };

            const subjectRepository = {
                findById: mock(async () => null),
            };

            const taskService = new TaskService(taskRepository, subjectRepository);

            await expect(taskService.getTaskById(null, 1)).rejects.toThrow("Task ID and user ID are required.");

            expect(taskRepository.findById).not.toHaveBeenCalled();
        });
    });

    describe("getAllTasksByUserId", () => {
        test("returns all tasks for the specified user", async () => {
            const taskRepository = {
                findAllByUserId: mock(async () => [
                    {
                        id: 1,
                        userId: 1,
                        subjectId: 1,
                        title: "Complete homework",
                        description: "Finish the math exercises",
                        type: "homework",
                        deadline: new Date("2024-06-30T23:59:59Z"),
                        estimatedEffortMinutes: 60,
                        estimationMethod: "manual",
                        estimationMetadata: null,
                        priority: 4,
                        status: "pending",
                    },
                    {
                        id: 2,
                        userId: 1,
                        subjectId: 2,
                        title: "Read book",
                        description: "Read the assigned chapters",
                        type: "reading",
                        deadline: new Date("2024-07-05T23:59:59Z"),
                        estimatedEffortMinutes: 120,
                        estimationMethod: "manual",
                        estimationMetadata: null,
                        priority: 3,
                        status: "pending",
                    },
                ]),
            };

            const subjectRepository = {
                findById: mock(async () => null),
            };

            const taskService = new TaskService(taskRepository, subjectRepository);

            const tasks = await taskService.getAllTasksByUserId(1);

            expect(tasks).toHaveLength(2);
            expect(tasks[0].id).toBe(1);
            expect(tasks[1].id).toBe(2);

            expect(taskRepository.findAllByUserId).toHaveBeenCalledWith(1);
        });
    });
    describe("deleteTask", () => {
        test("deletes the task with the specified ID", async () => {
            const taskRepository = {
                findById: mock(async () => ({
                    id: 1,
                    userId: 1,
                    subjectId: 1,
                    title: "Complete homework",
                    description: "Finish the math exercises",
                    type: "homework",
                    deadline: new Date("2024-06-30T23:59:59Z"),
                    estimatedEffortMinutes: 60,
                    estimationMethod: "manual",
                    estimationMetadata: null,
                    priority: 4,
                    status: "pending",
                })),
                deleteById: mock(async () => true),
            };

            const subjectRepository = {
                findById: mock(async () => null),
            };

            const taskService = new TaskService(taskRepository, subjectRepository);

            const result = await taskService.deleteTask(1, 1);

            expect(result).toBe(true);

            expect(taskRepository.findById).toHaveBeenCalledWith(1, 1);
            expect(taskRepository.deleteById).toHaveBeenCalledWith(1, 1);

            expect(taskRepository.findById).toHaveBeenCalledTimes(1);
            expect(taskRepository.deleteById).toHaveBeenCalledTimes(1);
        });

        test("throws when the task does not exist", async () => {
            const taskRepository = {
                findById: mock(async () => null),
                deleteById: mock(async () => true),
            };

            const subjectRepository = {
                findById: mock(async () => null),
            };
            const taskService = new TaskService(taskRepository, subjectRepository);

            await expect(taskService.deleteTask(999, 1)).rejects.toThrow("Task not found.");
            expect(taskRepository.findById).toHaveBeenCalledWith(999, 1);
            expect(taskRepository.deleteById).not.toHaveBeenCalled();
        });
    });
});
