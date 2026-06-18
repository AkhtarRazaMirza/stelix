import type { Request, Response, NextFunction } from "express";
import { TooManyRequestsError } from "../errors/app.errors.js";
import type { AuthRequest } from "./auth.middleware.js";

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

function cleanup() {
    const now = Date.now();
    for (const [key, entry] of store) {
        if (now > entry.resetAt) {
            store.delete(key);
        }
    }
}

setInterval(cleanup, 60_000);

export function rateLimit(options: {
    windowMs?: number;
    maxRequests?: number;
} = {}) {
    const windowMs = options.windowMs ?? 60_000;
    const maxRequests = options.maxRequests ?? 100;

    return (req: Request, _res: Response, next: NextFunction) => {
        const authReq = req as AuthRequest;
        const key = authReq.userId ?? req.ip ?? "unknown";

        const now = Date.now();
        const entry = store.get(key);

        if (!entry || now > entry.resetAt) {
            store.set(key, { count: 1, resetAt: now + windowMs });
            next();
            return;
        }

        if (entry.count >= maxRequests) {
            next(new TooManyRequestsError());
            return;
        }

        entry.count++;
        next();
    };
}
