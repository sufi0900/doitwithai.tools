import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export function getMetaTitleModel() {
  return process.env.OPENAI_META_TITLE_MODEL || "gpt-5.6-luna";
}

export function getSlugGeneratorModel() {
  return (
    process.env.OPENAI_SLUG_GENERATOR_MODEL ||
    process.env.OPENAI_META_TITLE_MODEL ||
    "gpt-5.6-luna"
  );
}

export function getSchemaAnalyzerModel() {
  return (
    process.env.OPENAI_SCHEMA_ANALYZER_MODEL ||
    process.env.OPENAI_SLUG_GENERATOR_MODEL ||
    process.env.OPENAI_META_TITLE_MODEL ||
    "gpt-5.6-luna"
  );
}

export function getSiteAssistantModel() {
  return process.env.OPENAI_SITE_ASSISTANT_MODEL || "gpt-5.6-luna";
}
