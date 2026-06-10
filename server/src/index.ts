import { serverConfig } from "./config/server.js"
import dotenv from "dotenv"
import { db } from "./config/db.js";
import { sql } from "drizzle-orm";
dotenv.config();

async function startServer() {
    console.log("Starting server...");
    const PORT = process.env.PORT || 8000;
    const app = serverConfig();
    try {
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}...`);
        });
        await db.execute(sql`select 1`);
        console.log("database is connect successfully..");
    } catch (error) {
        console.error("Error starting server:", error);
    }
}

startServer();