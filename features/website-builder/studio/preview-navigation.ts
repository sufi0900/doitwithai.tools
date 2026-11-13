import type { PortfolioSection } from "@/features/website-builder/domain/site-document";
import type { PreviewTarget } from "./manual-controls";

const homeSections = new Set(["about", "experience", "education", "skills", "projects", "contact"]);

export function previewSectionId(target: PreviewTarget): PortfolioSection | "hero" | undefined {
  if (target.section === "hero") return "hero";
  if (target.section === "education") return "experience";
  return homeSections.has(target.section) ? target.section as PortfolioSection : undefined;
}

export function scrollPreviewContainer(container: HTMLElement, target: PreviewTarget, behavior: ScrollBehavior = "smooth") {
  const section = previewSectionId(target);
  if (!section || section === "hero") {
    container.scrollTo({ top: 0, behavior });
    return;
  }
  const destination = container.querySelector<HTMLElement>(`#${section}`);
  if (!destination) return;
  const containerTop = container.getBoundingClientRect().top;
  const destinationTop = destination.getBoundingClientRect().top;
  container.scrollTo({ top: Math.max(0, container.scrollTop + destinationTop - containerTop - 44), behavior });
}
