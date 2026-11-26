import { createGenerationHandler } from "@/features/writer-workspace/generation.server";
import {
  checkStudioRateLimit,
  getStudioGeminiClient,
  isStudioAiConfigured,
} from "@/lib/studio/studio-llm-gateway.server";

export const maxDuration = 60;

export const POST = createGenerationHandler({
  generate: getStudioGeminiClient,
  configured: isStudioAiConfigured,
  limit: checkStudioRateLimit,
});
