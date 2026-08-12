import express from "express";
import authMiddleware from "../middleware/AuthMiddleware.js";

export default function createAvailabilityRoutes(availabilityController) {
    const router = express.Router();

    router.get("/", authMiddleware, availabilityController.getAll.bind(availabilityController));

    router.post("/", authMiddleware, availabilityController.create.bind(availabilityController));

    //router.get("/:id", authMiddleware, availabilityController.getById.bind(availabilityController));

    router.patch("/:id", authMiddleware, availabilityController.update.bind(availabilityController));

    router.delete("/:id", authMiddleware, availabilityController.delete.bind(availabilityController));

    return router;
}
