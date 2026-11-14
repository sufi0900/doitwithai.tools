import type { TemplateId } from "@/features/website-builder/domain/template-contracts";

/**
 * Templates that receive the section-level cinematic system. Velocity Atelier uses its own automotive scene set.
 * Kinetic Gallery keeps its bespoke art direction.
 */
export const CINEMATIC_TEMPLATES: readonly TemplateId[] = ["cinematic-orbit", "architectural-grid", "editorial-depth", "velocity-atelier"];

export function isCinematicTemplate(template: string): boolean {
  return (CINEMATIC_TEMPLATES as readonly string[]).includes(template);
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * 0 when the section's top edge enters the bottom of the viewport frame,
 * 1 when the section's bottom edge leaves the top of the frame.
 */
export function sectionProgress(frameTop: number, frameHeight: number, sectionTop: number, sectionHeight: number): number {
  const travel = frameHeight + sectionHeight;
  if (travel <= 0) return 0.5;
  return clamp((frameTop + frameHeight - sectionTop) / travel, 0, 1);
}

/** Maps 0..1 progress to -1..1 (0 = section centred in the frame). */
export const toSigned = (progress: number) => clamp(progress, 0, 1) * 2 - 1;

/** Frame-rate independent exponential smoothing. */
export function damp(current: number, target: number, deltaSeconds: number, lambda = 6): number {
  return current + (target - current) * (1 - Math.exp(-lambda * deltaSeconds));
}

/** Converts a pointer position inside a box (0..1 on each axis) into tilt degrees and glare percentages. */
export function tiltFromPointer(nx: number, ny: number, maxDegrees: number) {
  const x = clamp(nx, 0, 1);
  const y = clamp(ny, 0, 1);
  return { tx: (x - 0.5) * 2 * maxDegrees, ty: (0.5 - y) * 2 * maxDegrees, gx: x * 100, gy: y * 100 };
}
