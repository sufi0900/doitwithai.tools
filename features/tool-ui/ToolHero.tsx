/** Shared tool hero tokens aligned with the matte charcoal Ahrefs-style tool header. */
export const toolHeroSurface = "bg-[#14171D]";
export const toolHeroHeading = "text-white";

/**
 * Legacy decorative background hook retained as a no-op so existing tool routes
 * drop neon blur orbs immediately without breaking imports during migration.
 */
export function ToolHeroBackground() {
  return null;
}
