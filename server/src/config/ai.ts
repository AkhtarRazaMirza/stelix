import { Groq } from "groq-sdk";
import { env } from "../env.js";

let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
  if (!groqClient) {
    if (!env.GROQ_API_KEY) {
      throw new Error("GROQ API key is not set in environment variables.");
    }
    groqClient = new Groq({ apiKey: env.GROQ_API_KEY });
  }
  return groqClient;
}
