import Task from "../models/Task.js";

import ValidationError from "../errors/ValidationError.js";
import NotFoundError from "../errors/NotFoundError.js";

class TaskService {
    constructor(taskRepository, subjectRepository) {
        this.taskRepository = taskRepository;
        this.subjectRepository = subjectRepository;
    }

    async createTask(userId, taskData) {
        if (!userId || !taskData.title || !taskData.type || !taskData.deadline || !taskData.estimatedEffortMinutes) {
            throw new ValidationError("User ID, title, type, deadline and estimated effortare required.");
        }

        if (!Number.isInteger(taskData.estimatedEffortMinutes) || taskData.estimatedEffortMinutes < 0) {
            throw new ValidationError("Estimated effort must be a positive number.");
        }

        if (taskData.subjectId !== undefined && taskData.subjectId !== null) {
            const subject = await this.subjectRepository.findById(taskData.subjectId, userId);

            if (!subject) {
                throw new NotFoundError("Subject not found.");
            }
        }

        const task = new Task({
            userId,
            subjectId: taskData.subjectId ?? null,
            title: taskData.title,
            description: taskData.description ?? null,
            type: taskData.type,
            deadline: taskData.deadline,
            estimatedEffortMinutes: taskData.estimatedEffortMinutes,
            estimationMethod: "manual",
            estimationMetadata: null,
            priority: taskData.priority ?? 3,
            status: "pending",
        });

        return await this.taskRepository.create(task);
    }

    async getTaskById(id, userId) {
        if (!id || !userId) {
            throw new ValidationError("Task ID and user ID are required.");
        }

        const task = await this.taskRepository.findById(id, userId);

        if (!task) {
            throw new NotFoundError("Task not found.");
        }

        return task;
    }

    async getAllTasksByUserId(userId) {
        if (!userId) {
            throw new ValidationError("User ID is required.");
        }

        return await this.taskRepository.findAllByUserId(userId);
    }

    async updateTask(id, userId, taskData) {
        if (!id || !userId) {
            throw new ValidationError("Task ID and user ID are required.");
        }

        const task = await this.taskRepository.findById(id, userId);

        if (!task) {
            throw new NotFoundError("Task not found.");
        }

        if (taskData.subjectId !== undefined) {
            if (taskData.subjectId === null) {
                task.subjectId = null;
            } else {
                const subject = await this.subjectRepository.findById(taskData.subjectId, userId);

                if (!subject) {
                    throw new NotFoundError("Subject not found.");
                }

                task.subjectId = taskData.subjectId;
            }
        }

        if (taskData.title !== undefined) {
            task.title = taskData.title;
        }
        if (taskData.description !== undefined) {
            task.description = taskData.description;
        }
        if (taskData.type !== undefined) {
            task.type = taskData.type;
        }
        if (taskData.deadline !== undefined) {
            task.deadline = taskData.deadline;
        }
        if (taskData.estimatedEffortMinutes !== undefined) {
            task.estimatedEffortMinutes = taskData.estimatedEffortMinutes;
        }
        if (taskData.estimatedEffortMethod !== undefined) {
            task.estimatedEffortMethod = taskData.estimatedEffortMethod;
        }
        if (taskData.estimatedMetadata !== undefined) {
            task.estimatedMetadata = taskData.estimatedMetadata;
        }
        if (taskData.priority !== undefined) {
            task.priority = taskData.priority;
        }
        if (taskData.status !== undefined) {
            task.status = taskData.status;
        }

        return await this.taskRepository.update(task);
    }

    async deleteTask(id, userId) {
        if (!id || !userId) {
            throw new ValidationError("Task ID and user ID are required.");
        }

        const task = await this.taskRepository.findById(id, userId);

        if (!task) {
            throw new NotFoundError("Task not found.");
        }

        return await this.taskRepository.deleteById(id, userId);
    }
}

export default TaskService;
