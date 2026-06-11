import { OAuth2Client } from "google-auth-library";
import { env } from "../env.js";

export const googleOAuth2Client = new OAuth2Client(
    env.GOOGLE_OAUTH_CLIENT_ID,
    env.GOOGLE_OAUTH_CLIENT_SECRET,
    env.GOOGLE_OAUTH_REDIRECT_URI
  );
