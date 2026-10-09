import { loadEnvConfig } from "@next/env";
import { getGeminiModel, isGeminiConfigured } from "../lib/ai-tools/gemini";
import { buildKnowledgeDocuments } from "../features/site-assistant/server/knowledge";
import { syncKnowledgeDocuments } from "../features/site-assistant/server/vector-store";

loadEnvConfig(process.cwd());

async function main() {
  if (isGeminiConfigured(getGeminiModel("SITE_ASSISTANT"))) {
    console.log(
      "Gemini assistant reads published Sanity content on each request. No vector synchronization is needed. Tool changes are included after deployment.",
    );
    return;
  }
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is required to synchronize the knowledge base.",
    );
  }

  const documents = await buildKnowledgeDocuments();
  const result = await syncKnowledgeDocuments(documents);

  console.log("\nDo It With AI Tools knowledge synchronization completed.");
  console.log(`Indexed documents: ${result.documents}`);
  console.log(`Replaced previous files: ${result.removedFiles}`);
  console.log(`Vector store ID: ${result.vectorStoreId}`);
  console.log("\nAdd this server-only value to .env.local and Vercel:");
  console.log(`OPENAI_SITE_ASSISTANT_VECTOR_STORE_ID=${result.vectorStoreId}`);
}

main().catch((error) => {
  console.error(
    "Knowledge synchronization failed:",
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
});
