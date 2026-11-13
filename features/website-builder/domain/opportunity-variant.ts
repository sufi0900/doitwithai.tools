import { normalizePublishingSlug } from "./commands";
import {
  siteDocumentSchema,
  type OpportunityType,
  type SiteDocument,
} from "./site-document";

export type CreateOpportunityVariantInput = {
  /** The id of the canonical Voxfolio project this variant is derived from. */
  variantOfProjectId: string;
  name: string;
  opportunityType: OpportunityType;
  audience?: string;
  objective?: string;
  deadline?: string | null;
  confidentiality?: "private" | "public" | "shared";
  /** A candidate slug; made unique against `existingSlugs` if provided. */
  slug?: string;
  existingSlugs?: Iterable<string>;
};

/**
 * Creates a new opportunity-variant SiteDocument from an approved canonical portfolio.
 *
 * This is the "variant.create" operation from the Voxfolio roadmap. It never mutates
 * the canonical document: it returns a fresh, independent SiteDocument that starts as
 * a deep copy of the canonical content, with its own revision counter and an
 * `opportunity` brief attached. The caller is responsible for persisting the result as
 * its own project row (its own `projectId`), so the canonical portfolio can never be
 * silently overwritten by edits made to the variant.
 */
export function createOpportunityVariant(canonical: SiteDocument, input: CreateOpportunityVariantInput): SiteDocument {
  if (canonical.opportunity.status !== "canonical") throw new Error("Variants cannot be nested.");
  if (!input.name.trim()) throw new Error("A variant needs a name.");
  const cloned = structuredClone(canonical);
  const slugSource = input.slug?.trim() || input.name;
  const slug = uniqueSlug(normalizePublishingSlug(slugSource) || "opportunity", input.existingSlugs);

  const draft: SiteDocument = {
    ...cloned,
    projectId: crypto.randomUUID(),
    revision: 0,
    updatedAt: new Date().toISOString(),
    // Content is copied into this independent project, including its pages/posts.
    opportunity: {
      ...cloned.opportunity,
      canonicalProjectId: input.variantOfProjectId,
      variantOfProjectId: input.variantOfProjectId,
      sourceRevision: canonical.revision,
      slug,
      name: input.name.trim(),
      type: input.opportunityType,
      audience: input.audience?.trim() ?? "",
      objective: input.objective?.trim() ?? "",
      deadline: input.deadline ?? null,
      confidentiality: input.confidentiality ?? "private",
      visibility: input.confidentiality ?? "private",
      status: "draft",
      heroOverride: "",
      projectOrder: cloned.content.projects.map((project) => project.id),
      title: input.name.trim(),
      brief: input.objective?.trim() || `Tailor this portfolio for ${input.name.trim()}.`,
      includedProjectIds: cloned.content.projects.map((project) => project.id),
      sourceSnapshot: {
        name: canonical.identity.name, role: canonical.identity.role, intro: canonical.identity.intro,
        aboutHeading: canonical.content.about.heading, aboutBody: canonical.content.about.body,
        projectIds: canonical.content.projects.map((project) => project.id),
      },
    },
  };

  return siteDocumentSchema.parse(draft);
}

/** True when the canonical portfolio has changed since this variant was created or last refreshed. */
export function isCanonicalDriftDetected(variant: SiteDocument, canonicalRevision: number): boolean {
  return variant.opportunity.status !== "canonical" && canonicalRevision > (variant.opportunity.sourceRevision ?? 0);
}

/**
 * Re-bases an opportunity variant onto the latest canonical content.
 *
 * This never runs automatically. The owner must explicitly request a refresh
 * (`variant.refreshFromCanonical`) after being shown that the canonical portfolio has
 * moved ahead. Content is replaced wholesale from canonical; the variant's own
 * opportunity brief, hero override, confidentiality, and status are preserved. Any
 * project-order or hidden-project overrides that reference project ids no longer
 * present on the canonical portfolio are dropped rather than silently kept, since a
 * stale id pointing at nothing would be worse than resetting to canonical order.
 */
export function refreshVariantFromCanonical(variant: SiteDocument, canonical: SiteDocument): SiteDocument {
  if (!variant.opportunity || variant.opportunity.status === "canonical") throw new Error("This portfolio is not an opportunity variant.");
  if (canonical.opportunity.status !== "canonical" || variant.opportunity.canonicalProjectId !== canonical.projectId) throw new Error("The selected canonical source does not match this variant.");

  const validIds = new Set(canonical.content.projects.map((project) => project.id));
  const preservedOrder = variant.opportunity.projectOrder.filter((id) => validIds.has(id));
  const missingIds = canonical.content.projects.map((project) => project.id).filter((id) => !preservedOrder.includes(id));

  const refreshed: SiteDocument = {
    ...structuredClone(canonical),
    revision: variant.revision + 1,
    updatedAt: new Date().toISOString(),
    projectId: variant.projectId,
    publishing: variant.publishing,
    opportunity: {
      ...variant.opportunity,
      sourceRevision: canonical.revision,
      projectOrder: [...preservedOrder, ...missingIds],
      includedProjectIds: variant.opportunity.includedProjectIds.filter((id) => validIds.has(id)),
      sourceSnapshot: {
        name: canonical.identity.name, role: canonical.identity.role, intro: canonical.identity.intro,
        aboutHeading: canonical.content.about.heading, aboutBody: canonical.content.about.body,
        projectIds: canonical.content.projects.map((project) => project.id),
      },
    },
  };

  return siteDocumentSchema.parse(refreshed);
}

function uniqueSlug(base: string, existing?: Iterable<string>): string {
  const taken = new Set(existing ?? []);
  if (!taken.has(base)) return base;
  let suffix = 2;
  let candidate = `${base}-${suffix}`;
  while (taken.has(candidate)) candidate = `${base}-${++suffix}`;
  return candidate;
}
