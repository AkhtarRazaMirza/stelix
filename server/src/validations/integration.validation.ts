import { z } from "zod";

import { INTEGRATION_PROVIDERS } from "../types/integration.types.js";

export const connectIntegrationSchema = z.object({
  provider: z.enum(INTEGRATION_PROVIDERS),
});

export const connectProviderParamSchema = z.object({
  provider: z.enum(INTEGRATION_PROVIDERS),
});

export const oauthCallbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

export const integrationIdParamSchema = z.object({
  id: z.string().uuid(),
});
