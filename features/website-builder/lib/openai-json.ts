type OpenAIJsonOptions = { system: string; prompt: string; maxOutputTokens?: number; timeoutMs?: number };

export async function generateJsonWithOpenAI({ system, prompt, maxOutputTokens = 2200, timeoutMs = 30_000 }: OpenAIJsonOptions) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");
  const model = process.env.OPENAI_CONTENT_MODEL || process.env.OPENAI_CV_MODEL || "gpt-5-mini";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST", signal: controller.signal,
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model, store: false,
        reasoning: /^(gpt-5|gpt-6|o\d)/i.test(model) ? { effort: "low" } : undefined,
        input: [
          { role: "system", content: [{ type: "input_text", text: system }] },
          { role: "user", content: [{ type: "input_text", text: prompt }] },
        ],
        max_output_tokens: maxOutputTokens,
        text: { verbosity: "low", format: { type: "json_object" } },
      }),
    });
    if (!response.ok) throw new Error(`OpenAI fallback failed with status ${response.status}.`);
    const text = outputText(await response.json());
    if (!text) throw new Error("OpenAI fallback returned no usable content.");
    return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw new Error("OpenAI fallback timed out.");
    throw error;
  } finally { clearTimeout(timeout); }
}

function outputText(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  if (typeof (payload as { output_text?: unknown }).output_text === "string") return (payload as { output_text: string }).output_text;
  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) return null;
  for (const item of output) if (item && typeof item === "object" && Array.isArray((item as { content?: unknown }).content)) {
    for (const content of (item as { content: unknown[] }).content) if (content && typeof content === "object" && typeof (content as { text?: unknown }).text === "string") return (content as { text: string }).text;
  }
  return null;
}
