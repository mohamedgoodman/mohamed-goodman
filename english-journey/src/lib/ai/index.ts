import "server-only";
import { MockAIProvider } from "./mock-provider";
import { OpenAIProvider } from "./openai-provider";
import type { AIProvider } from "./types";

let cached: AIProvider | null = null;

/**
 * Resolve the configured provider.
 *
 * AI_PROVIDER=openai plus AI_API_KEY switches the language work to a real
 * model; anything else (including a missing key) uses the offline engine, so
 * the app always runs.
 */
export function getAIProvider(): AIProvider {
  if (cached) return cached;
  const provider = (process.env.AI_PROVIDER ?? "mock").toLowerCase();
  const apiKey = process.env.AI_API_KEY;

  if (provider === "openai" && apiKey) {
    cached = new OpenAIProvider(apiKey);
  } else {
    cached = new MockAIProvider();
  }
  return cached;
}

export type { AIProvider } from "./types";
