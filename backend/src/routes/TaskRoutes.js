import express from "express";
import authMiddleware from "../middleware/AuthMiddleware.js";

export default function createTaskRoutes(taskController) {
    const router = express.Router();

    router.get("/", authMiddleware, taskController.getAll.bind(taskController));

    router.post("/", authMiddleware, taskController.create.bind(taskController));

    router.get("/:id", authMiddleware, taskController.getById.bind(taskController));

    router.patch("/:id", authMiddleware, taskController.update.bind(taskController));

    router.delete("/:id", authMiddleware, taskController.delete.bind(taskController));

    return router;
}
