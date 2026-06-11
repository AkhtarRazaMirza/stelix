import { Groq } from "groq-sdk";
import { env } from "../env.js"

export const apiKeyChecker = () => {
  const GROQ_API_KEY = env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    throw new Error("GROQ API key is not set in environment variables.");
  }
  console.log("GROQ API key is set.");
  return GROQ_API_KEY;
};

export const checkGROQAi = async () => {
  const GROQ_API_KEY = apiKeyChecker();
  const client = new Groq({
        apiKey: GROQ_API_KEY
      });
      if (!client) {
        throw new Error("Failed to initialize GROQ AI client.");
    }
    console.log("GROQ AI client initialized successfully.");
    return client
};