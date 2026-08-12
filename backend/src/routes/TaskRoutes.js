import express from "express";
import authMiddleware from "../middleware/AuthMiddleware.js";

export default function createTaskRoutes(taskController) {
    const router = express.Router();

    router.get("/", authMiddleware, taskController.getAllTasks.bind(taskController));

    router.post("/", authMiddleware, taskController.createTask.bind(taskController));

    router.get("/:id", authMiddleware, taskController.getTaskById.bind(taskController));

    router.patch("/:id", authMiddleware, taskController.updateTask.bind(taskController));

    router.delete("/:id", authMiddleware, taskController.deleteTask.bind(taskController));

    return router;
}
