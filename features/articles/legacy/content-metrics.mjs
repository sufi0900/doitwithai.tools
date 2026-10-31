export function articleMetrics(content) {
  const text = (Array.isArray(content) ? content : []).filter((block) => block._type === "block")
    .map((block) => (block.children || []).map((span) => span.text || "").join("")).join(" ");
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  return { wordCount, estimatedReadingTime: Math.max(1, Math.ceil(wordCount / 250)) };
}
