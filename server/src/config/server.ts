import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";


export function serverConfig() {
    const app = express();
    app.use(express.json());
    app.use(cookieParser())
    app.use(
        cors({
            origin: "http://localhost:3000",
            credentials: true,
        }),
    );
    app.get("/api/health", (req, res) => {
        res.send({
            success: true,
            stafus: 200,
            massege: "server is up and running"
        })
    })

    return app
}