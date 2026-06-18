import { corsair } from "../corsair.js";
import { env } from "../env.js";
import { logger } from "./logger.js";
import { INTEGRATION_PROVIDERS } from "../types/integration.types.js";

let bootstrapped = false;

export async function bootstrapCorsairCredentials() {
  if (bootstrapped) {
    return;
  }

  const keys = corsair.keys as Record<string, any>;

  for (const provider of INTEGRATION_PROVIDERS) {
    const pluginKeys = keys[provider];

    if (!pluginKeys) {
      throw new Error(`Corsair plugin keys missing for provider: ${provider}`);
    }

    await pluginKeys.set_client_id(env.GOOGLE_OAUTH_CLIENT_ID);
    await pluginKeys.set_client_secret(env.GOOGLE_OAUTH_CLIENT_SECRET);
    await pluginKeys.set_redirect_url(env.CORSAIR_OAUTH_REDIRECT_URI);

    logger.info("Corsair integration credentials configured", { provider });
  }

  bootstrapped = true;
}
