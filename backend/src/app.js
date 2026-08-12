import "dotenv/config";
import express from "express";
import cors from "cors";
import { testConnection, initializeDatabase } from "./database/connection.js";
import createAuthRoutes from "./routes/AuthRoutes.js";
import createUserRoutes from "./routes/UserRoutes.js";
import createSubjectRoutes from "./routes/SubjectRoutes.js";
import createTaskRoutes from "./routes/TaskRoutes.js";
import { userController, authController, subjectController, taskController } from "./dependencies.js";
import errorMiddleware from "./middleware/ErrorMiddleware.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Duelet API is running!",
    });
});

// register routes
const authRoutes = createAuthRoutes(authController);
const userRoutes = createUserRoutes(userController);
const subjectRoutes = createSubjectRoutes(subjectController);
const taskRoutes = createTaskRoutes(taskController);

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/subjects", subjectRoutes);

app.use("/api/tasks", taskRoutes);

app.use(errorMiddleware);

export default app;

async function startApp() {
    try {
        // are we connected to the database?
        await testConnection();
        // initialize the database se we are sure that all tables are created.
        await initializeDatabase();

        // start the server
        app.listen(PORT, () => {
            console.log(`Duelet API running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error starting the application:", error);
        process.exit(1);
    }
}

if (import.meta.main) {
    await startApp();
}
