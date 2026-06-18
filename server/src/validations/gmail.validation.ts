import { z } from "zod";

export const sendEmailSchema = z.object({
  to: z.string().trim().email(),
  subject: z.string().trim().min(1).max(255),
  body: z.string().min(1).max(50_000),
});

export const gmailSearchQuerySchema = z.object({
  q: z.string().trim().min(1).max(500),
});

export const inboxQuerySchema = z.object({
  pageToken: z.string().min(1).max(2048).optional(),
});

export const emailIdParamSchema = z.object({
  emailId: z.string().trim().min(1).max(256),
});
