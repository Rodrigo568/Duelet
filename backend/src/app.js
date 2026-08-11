import "dotenv/config";
import express from "express";
import cors from "cors";
import { testConnection, initializeDatabase } from "./database/connection.js";
import createUserRoutes from "./routes/UserRoutes.js";
import { userController, authController } from "./dependencies.js";
import errorMiddleware from "./middleware/ErrorMiddleware.js";
import createAuthRoutes from "./routes/AuthRoutes.js";

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

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

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
