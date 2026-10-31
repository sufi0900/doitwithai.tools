// Keep the generated shape, types, enums and required fields in Gemini's
// decoder. Move range/pattern constraints into guidance to reduce its grammar
// complexity. The original Zod parser remains the final authority.
export function compactOutputSchema(
  schema: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const notes: string[] = [];
  const guidance: Record<string, string> = {
    minItems: "Minimum item count",
    maxItems: "Maximum item count",
    minLength: "Minimum string length",
    maxLength: "Maximum string length",
    pattern: "Required string pattern",
  };
  for (const [key, value] of Object.entries(schema)) {
    if (key in guidance) {
      notes.push(`${guidance[key]}: ${String(value)}.`);
    } else if (
      key === "properties" ||
      key === "$defs" ||
      key === "definitions"
    ) {
      result[key] = Object.fromEntries(
        Object.entries(value as Record<string, Record<string, unknown>>).map(
          ([name, child]) => [name, compactOutputSchema(child)],
        ),
      );
    } else if (
      ["items", "additionalProperties"].includes(key) &&
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      result[key] = compactOutputSchema(value as Record<string, unknown>);
    } else if (
      ["anyOf", "oneOf", "allOf", "prefixItems"].includes(key) &&
      Array.isArray(value)
    ) {
      result[key] = value.map((child) => compactOutputSchema(child));
    } else {
      result[key] = value;
    }
  }
  if (notes.length)
    result.description = [schema.description, ...notes]
      .filter(Boolean)
      .join(" ");
  return result;
}
