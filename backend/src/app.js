import "dotenv/config";
import express from "express";
import cors from "cors";
import { testConnection, initializeDatabase } from "./database/connection.js";
import createUserRoutes from "./routes/UserRoutes.js";
import { userController } from "./dependencies.js";

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

// are we connected to the database?
testConnection();

// initialize the database se we are sure that all tables are created.
await initializeDatabase();

const userRoutes = createUserRoutes(userController);

app.use("/api/users", userRoutes);

app.listen(PORT, () => {
    console.log(`Duelet API running on http://localhost:${PORT}`);
});
