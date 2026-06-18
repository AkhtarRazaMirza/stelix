import { serverConfig } from "./config/server.js"
import dotenv from "dotenv"
import { db } from "./config/db.js";
import { sql } from "drizzle-orm";
import { env } from "./env.js";
import { bootstrapCorsairCredentials } from "./config/corsair.bootstrap.js";
dotenv.config();

async function startServer() {
    console.log("Starting server...");
    const app = serverConfig();
    try {
        await bootstrapCorsairCredentials();
        app.listen(env.PORT, () => {
            console.log(`Server started on port ${env.PORT}...`);
        });
        await db.execute(sql`select 1`);
        console.log("database is connect successfully..");
    } catch (error) {
        console.error("Error starting server:", error);
    }
}

startServer();