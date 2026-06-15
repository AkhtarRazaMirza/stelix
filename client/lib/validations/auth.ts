// lib/validations/auth.ts

import { z } from "zod";

export const registerSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterInput =
    z.infer<typeof registerSchema>;

// lib/validations/auth.ts

export const loginSchema = z.object({
    email: z.email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput =
    z.infer<typeof loginSchema>;