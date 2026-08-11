import express from "express";

export default function createUserRoutes(userController) {
    const router = express.Router();

    router.post("/", userController.create.bind(userController));

    router.get("/:id", userController.getById.bind(userController));

    router.get("/email/:email", userController.getByEmail.bind(userController));

    router.patch("/:id", userController.update.bind(userController));

    router.delete("/:id", userController.delete.bind(userController));

    return router;
}
