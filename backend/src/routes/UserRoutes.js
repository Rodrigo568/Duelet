import express from "express";
import authMiddleware from "../middleware/AuthMiddleware.js";

export default function createUserRoutes(userController) {
    const router = express.Router();

    router.get("/me", authMiddleware, userController.getMe.bind(userController));

    router.delete("/me", authMiddleware, userController.deleteMe.bind(userController));

    router.post("/", userController.create.bind(userController));

    router.get("/:id", userController.getById.bind(userController));

    router.get("/email/:email", userController.getByEmail.bind(userController));

    router.patch("/:id", userController.update.bind(userController));

    router.delete("/:id", userController.delete.bind(userController));

    return router;
}
