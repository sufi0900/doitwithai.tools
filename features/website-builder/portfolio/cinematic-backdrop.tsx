export function CinematicBackdrop({ variant = "orbit" }: { variant?: "orbit" | "grid" | "portal" }) {
  return <div className={`cinematic-backdrop cinematic-${variant}`} aria-hidden="true"><span /><span /><span /><i /></div>;
}
