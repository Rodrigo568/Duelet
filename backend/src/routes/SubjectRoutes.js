import express from "express";
import authMiddleware from "../middleware/AuthMiddleware.js";

export default function createSubjectRoutes(subjectController) {
    const router = express.Router();

    router.get("/", authMiddleware, subjectController.getAll.bind(subjectController));

    router.post("/", authMiddleware, subjectController.create.bind(subjectController));

    router.get("/:id", authMiddleware, subjectController.getById.bind(subjectController));

    router.patch("/:id", authMiddleware, subjectController.update.bind(subjectController));

    router.delete("/:id", authMiddleware, subjectController.delete.bind(subjectController));

    return router;
}
