/** Shared tool branding. Keep these colors aligned with the Meta Title hero. */
export const toolHeroSurface = "bg-[#182235]";
export const toolHeroHeading =
  "bg-gradient-to-r from-[#5271FF] to-[#9AABFF] bg-clip-text text-transparent";

export function ToolHeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute -left-36 top-0 h-96 w-96 rounded-full bg-[#5271FF]/30 blur-3xl" />
      <div className="absolute -right-28 top-40 h-80 w-80 rounded-full bg-[#5271FF]/15 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(82,113,255,0.14)_1px,transparent_0)] bg-[size:28px_28px] [mask-image:linear-gradient(to_bottom,white,transparent_82%)]" />
    </div>
  );
}
