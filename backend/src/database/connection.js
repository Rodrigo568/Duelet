import "dotenv/config";
import mysql from "mysql2/promise";
import fs from "node:fs";

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true, // we need this to execute schema.sql correctly...
});

export async function testConnection() {
    try {
        const connection = await db.getConnection();
        connection.release();

        console.log("Database connection successful.");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        console.log(
            "Please check your database configuration in the .env file. Closing application...",
        );
        process.exit(1);
    }
}

export async function initializeDatabase() {
    // we get the schema file
    const sqlSchema = fs.readFileSync("src/database/schema.sql", "utf8");
    // execute the schema (test connection already executed on app.js)
    await db.query(sqlSchema);

    console.log("Database initialized successfully.");
}

export default db;
