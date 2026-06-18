import { z } from "zod";

export const emailIdParamSchema = z.object({
  id: z.string().min(1),
});

export const emailSearchQuerySchema = z.object({
  q: z.string().trim().min(1).max(500),
});
