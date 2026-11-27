import { createResearchHandler } from "@/features/writer-workspace/research.server";
import {
  checkStudioRateLimit,
  executeStudioGroundedSearch,
  getStudioGeminiClient,
  isStudioAiConfigured,
} from "@/lib/studio/studio-llm-gateway.server";

export const maxDuration = 45;

export const POST = createResearchHandler({
  generate: getStudioGeminiClient,
  configured: isStudioAiConfigured,
  limit: checkStudioRateLimit,
  groundedSearch: executeStudioGroundedSearch,
});
