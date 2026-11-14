import { richNodeSchema } from "./rich-document";
import { structuredBlockSchema } from "./site-document";
import { z } from "zod";
import {
  accentOptions,
  alignmentOptions,
  backgroundOptions,
  motionOptions,
  portfolioSectionOptions,
  scenePresetOptions,
  sceneFamilyOptions,
  socialPlatformOptions,
  opportunityStatusOptions,
  opportunityVisibilityOptions,
  templateOptions,
  siteDocumentSchema,
  type SiteDocument,
} from "./site-document";
import { applyTemplatePresentation } from "./template-contracts";
import { getTemplateDefaultDocument, isUsingDefaultTemplateIdentity } from "./template-defaults";
import { legacyRichDocument } from "./legacy-rich-document";
import { reviewOpportunity } from "./opportunity-review";
import { previewSiteWideReplace } from "./site-wide-replace";
import {
  applyUpsertFromWriterStudioCommand,
  describeWriterPublishingCommand,
  upsertFromWriterStudioCommandSchema,
} from "./writer-publishing-commands";

export const siteCommandSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("voice.replaceText"), from: z.string().min(1).max(160), to: z.string().min(1).max(160), expectedRevision: z.number().int().nonnegative() }),
  z.object({ type: z.literal("identity.set"), field: z.enum(["name", "role", "intro", "availability"]), value: z.string() }),
  z.object({ type: z.literal("visitor.enable"), enabled: z.boolean() }),
  z.object({ type: z.literal("visitor.addFact"), text: z.string().trim().min(10).max(900), source: z.string().trim().min(1).max(120) }),
  z.object({ type: z.literal("visitor.removeFact"), id: z.string().uuid() }),
  z.object({ type: z.literal("design.setAccent"), value: z.enum(accentOptions) }),
  z.object({ type: z.literal("design.setBackground"), value: z.enum(backgroundOptions) }),
  z.object({ type: z.literal("design.setHeroAlignment"), value: z.enum(alignmentOptions) }),
  z.object({ type: z.literal("design.setTemplate"), value: z.enum(templateOptions) }),
  z.object({ type: z.literal("design.applyTemplateDefaults"), value: z.enum(templateOptions) }),
  z.object({
    type: z.literal("project.installCatalogTool"),
    slug: z.string().trim().min(1).max(80),
    title: z.string().trim().min(1).max(100),
    summary: z.string().trim().max(500),
    technologies: z.array(z.string().trim().min(1).max(32)).max(8).default([]),
    link: z.union([z.literal(""), z.string().url()]).default(""),
    role: z.string().trim().max(100).default("Interactive AI Web Utility"),
    period: z.string().trim().max(80).default("Live on DoItWithAI · Free Utility"),
    challenge: z.string().trim().max(1200).default(""),
    approach: z.string().trim().max(1800).default(""),
    outcome: z.string().trim().max(1200).default(""),
    includeCompanionPost: z.boolean().default(true),
  }),
  z.object({ type: z.literal("scene.setFamily"), value: z.enum(sceneFamilyOptions) }),
  z.object({ type: z.literal("scene.setPreset"), value: z.enum(scenePresetOptions) }),
  z.object({ type: z.literal("scene.setMotion"), value: z.enum(motionOptions) }),
  z.object({ type: z.literal("scene.setIntensity"), value: z.number().min(0.4).max(1.4) }),
  z.object({ type: z.literal("scene.focusSkill"), skillId: z.string().nullable() }),
  z.object({ type: z.literal("skill.add"), label: z.string().trim().min(1).max(32) }),
  z.object({ type: z.literal("skill.update"), skillId: z.string().min(1), label: z.string().trim().min(1).max(32).optional(), level: z.number().int().min(1).max(5).optional() }).refine((value) => value.label !== undefined || value.level !== undefined),
  z.object({ type: z.literal("skill.remove"), skillId: z.string().min(1) }),
  z.object({ type: z.literal("content.setAbout"), field: z.enum(["heading", "body"]), value: z.string() }),
  z.object({ type: z.literal("content.setContact"), field: z.enum(["heading", "email", "location", "cta"]), value: z.string() }),
  z.object({ type: z.literal("social.add"), platform: z.enum(socialPlatformOptions), url: z.string().url() }),
  z.object({ type: z.literal("social.update"), itemId: z.string().min(1), platform: z.enum(socialPlatformOptions).optional(), url: z.string().url().optional() }).refine((value) => value.platform !== undefined || value.url !== undefined),
  z.object({ type: z.literal("social.remove"), itemId: z.string().min(1) }),
  z.object({ type: z.literal("opportunity.set"), field: z.enum(["title", "brief", "audience", "approvalNotes"]), value: z.string() }),
  z.object({ type: z.literal("opportunity.setStatus"), status: z.enum(opportunityStatusOptions) }),
  z.object({ type: z.literal("opportunity.setVisibility"), visibility: z.enum(opportunityVisibilityOptions) }),
  z.object({ type: z.literal("opportunity.setIncludedProjects"), projectIds: z.array(z.string().min(1)).max(8) }),
  z.object({ type: z.literal("section.setVisible"), section: z.enum(portfolioSectionOptions), value: z.boolean() }),
  z.object({ type: z.literal("section.move"), section: z.enum(portfolioSectionOptions), direction: z.enum(["up", "down"]) }),
  z.object({ type: z.literal("section.moveTo"), section: z.enum(portfolioSectionOptions), targetIndex: z.number().int().nonnegative() }),
  z.object({ type: z.literal("experience.add"), role: z.string().trim().min(1).max(100).optional(), organization: z.string().trim().max(100).optional(), period: z.string().trim().max(80).optional(), summary: z.string().trim().max(500).optional() }),
  z.object({ type: z.literal("experience.update"), itemId: z.string().min(1), field: z.enum(["role", "organization", "period", "summary"]), value: z.string() }),
  z.object({ type: z.literal("experience.remove"), itemId: z.string().min(1) }),
  z.object({ type: z.literal("education.add"), credential: z.string().trim().min(1).max(140).optional(), institution: z.string().trim().max(120).optional(), period: z.string().trim().max(80).optional(), summary: z.string().trim().max(500).optional() }),
  z.object({ type: z.literal("education.update"), itemId: z.string().min(1), field: z.enum(["credential", "institution", "period", "summary"]), value: z.string() }),
  z.object({ type: z.literal("education.remove"), itemId: z.string().min(1) }),
  z.object({ type: z.literal("project.add"), title: z.string().trim().min(1).max(100).optional(), summary: z.string().trim().max(500).optional(), technologies: z.array(z.string().trim().min(1).max(32)).max(8).optional(), link: z.union([z.literal(""), z.string().url()]).optional() }),
  z.object({ type: z.literal("project.update"), itemId: z.string().min(1), field: z.enum(["title", "summary", "technologies", "link", "caseStudySlug", "role", "period", "challenge", "approach", "outcome"]), value: z.union([z.string(), z.array(z.string())]) }),
  z.object({ type: z.literal("project.move"), itemId: z.string().min(1), direction: z.enum(["up", "down"]) }),
  z.object({ type: z.literal("project.attachMedia"), itemId: z.string().min(1), mediaId: z.string().min(1) }),
  z.object({ type: z.literal("project.detachMedia"), itemId: z.string().min(1), mediaId: z.string().min(1) }),
  z.object({ type: z.literal("project.remove"), itemId: z.string().min(1) }),
  z.object({ type: z.literal("media.setHeadshot"), url: z.union([z.literal(""), z.string().url()]), alt: z.string().trim().max(160) }),
  z.object({ type: z.literal("media.addAsset"), asset: z.object({ id: z.string().min(1), url: z.string().url(), storagePath: z.string().min(1).max(500), alt: z.string().trim().min(1).max(180), createdAt: z.string() }) }),
  z.object({ type: z.literal("media.updateAsset"), mediaId: z.string().min(1), alt: z.string().trim().min(1).max(180) }),
  z.object({ type: z.literal("media.removeAsset"), mediaId: z.string().min(1) }),
  z.object({ type: z.literal("publishing.add"), kind: z.enum(["page", "post"]), title: z.string().trim().min(1).max(120).optional(), excerpt: z.string().trim().max(320).optional(), body: z.string().trim().max(4000).optional(), seoTitle: z.string().trim().max(70).optional(), seoDescription: z.string().trim().max(170).optional() }),
  z.object({ type: z.literal("publishing.update"), kind: z.enum(["page", "post"]), itemId: z.string().min(1), field: z.enum(["title", "slug", "seoTitle", "seoDescription", "coverMediaId", "navigationLabel", "excerpt", "tags"]), value: z.union([z.string(), z.array(z.string())]) }),
  z.object({ type: z.literal("publishing.setContent"), kind: z.enum(["page", "post"]), itemId:z.string().min(1), richContent:richNodeSchema, blocks:z.array(structuredBlockSchema).max(200) }),
  upsertFromWriterStudioCommandSchema,
  z.object({ type: z.literal("publishing.remove"), kind: z.enum(["page", "post"]), itemId: z.string().min(1) }),
  z.object({ type: z.literal("publishing.setStatus"), kind: z.enum(["page", "post"]), itemId: z.string().min(1), status: z.enum(["draft", "published"]) }),
  z.object({ type: z.literal("block.add"), kind: z.enum(["page", "post"]), itemId: z.string().min(1), blockType: z.enum(["heading", "paragraph", "quote", "list", "ordered-list", "image"]), afterBlockId: z.string().min(1).optional() }),
  z.object({ type: z.literal("block.update"), kind: z.enum(["page", "post"]), itemId: z.string().min(1), blockId: z.string().min(1), field: z.enum(["text", "items", "mediaId", "headingLevel"]), value: z.union([z.string(), z.array(z.string())]) }),
  z.object({ type: z.literal("block.remove"), kind: z.enum(["page", "post"]), itemId: z.string().min(1), blockId: z.string().min(1) }),
  z.object({ type: z.literal("block.move"), kind: z.enum(["page", "post"]), itemId: z.string().min(1), blockId: z.string().min(1), direction: z.enum(["up", "down"]) }),
  z.object({ type: z.literal("block.moveTo"), kind: z.enum(["page", "post"]), itemId: z.string().min(1), blockId: z.string().min(1), targetIndex: z.number().int().nonnegative() }),
]);

export type SiteCommand = z.infer<typeof siteCommandSchema>;
export type CommandSource = "manual" | "voice";

export type CommandReceipt = {
  command: SiteCommand;
  source: CommandSource;
  summary: string;
  at: string;
};

export function formatCommandError(error: unknown) {
  if (error instanceof z.ZodError) {
    const issue = error.issues[0];
    if (issue?.code === "too_big" && "maximum" in issue) return `That value is too long for this field (maximum ${issue.maximum} characters). Nothing was changed.`;
    if (issue?.code === "too_small" && "minimum" in issue) return `That value is too short for this field (minimum ${issue.minimum} characters). Nothing was changed.`;
    return issue?.message ? `${issue.message} Nothing was changed.` : "That change did not pass portfolio validation. Nothing was changed.";
  }
  return error instanceof Error ? error.message : "That change could not be validated. Nothing was changed.";
}

function nextRevision(document: SiteDocument) {
  return { revision: document.revision + 1, updatedAt: new Date().toISOString() };
}

export function applySiteCommand(current: SiteDocument, candidate: unknown): SiteDocument {
  const command = siteCommandSchema.parse(candidate);
  let next: SiteDocument;

  if(command.type.startsWith("block.") && "kind" in command && "itemId" in command && findPublishable(current,command.kind as "page"|"post",command.itemId)?.richContent) throw new Error("This page uses the continuous rich text editor. Open the page and edit its content there to preserve formatting.");
  switch (command.type) {
    case "voice.replaceText": {
      if (current.revision !== command.expectedRevision) throw new Error("The portfolio changed since the replacement review. Review the matches again before applying.");
      const preview = previewSiteWideReplace(current, command.from, command.to);
      if (!preview.occurrences) throw new Error("The exact phrase was not found in editable text in this portfolio. Check capitalization and spacing.");
      next = { ...preview.next, ...nextRevision(current) };
      break;
    }
    case "visitor.enable":
      if (current.visitor.enabled === command.enabled) return current;
      next = { ...current, visitor: { ...current.visitor, enabled: command.enabled }, ...nextRevision(current) };
      break;
    case "visitor.addFact":
      if (current.visitor.facts.length >= 24) throw new Error("Visitor AI Agent supports up to 24 approved notes.");
      next = { ...current, visitor: { ...current.visitor, facts: [...current.visitor.facts, { id: crypto.randomUUID(), text: command.text, source: command.source }] }, ...nextRevision(current) };
      break;
    case "visitor.removeFact":
      if (!current.visitor.facts.some((fact) => fact.id === command.id)) throw new Error("Approved note not found.");
      next = { ...current, visitor: { ...current.visitor, facts: current.visitor.facts.filter((fact) => fact.id !== command.id) }, ...nextRevision(current) };
      break;
    case "identity.set":
      if (command.value.trim() === current.identity[command.field]) return current;
      next = { ...current, identity: { ...current.identity, [command.field]: command.value.trim() }, ...nextRevision(current) };
      break;
    case "design.setAccent":
      next = { ...current, design: { ...current.design, accent: command.value }, ...nextRevision(current) };
      break;
    case "design.setBackground":
      next = { ...current, design: { ...current.design, background: command.value }, ...nextRevision(current) };
      break;
    case "design.setHeroAlignment":
      next = { ...current, design: { ...current.design, heroAlignment: command.value }, ...nextRevision(current) };
      break;
    case "design.setTemplate": {
      if (current.design.template === command.value) return current;
      if (isUsingDefaultTemplateIdentity(current)) {
        const seeded = getTemplateDefaultDocument(command.value);
        next = {
          ...seeded,
          projectId: current.projectId,
          ...nextRevision(current),
        };
      } else {
        next = { ...applyTemplatePresentation(current, command.value), ...nextRevision(current) };
      }
      break;
    }
    case "design.applyTemplateDefaults": {
      const seeded = getTemplateDefaultDocument(command.value);
      next = {
        ...seeded,
        projectId: current.projectId,
        ...nextRevision(current),
      };
      break;
    }
    case "project.installCatalogTool": {
      if (current.content.projects.length >= 8) {
        throw new Error("A website can showcase up to 8 tools/projects on the homepage. Remove one first before adding another.");
      }
      const slug = uniqueProjectSlug(current, command.slug || command.title);
      const newProject = {
        id: crypto.randomUUID(),
        title: command.title.slice(0, 100),
        summary: command.summary.slice(0, 500),
        technologies: command.technologies.map((t) => t.slice(0, 32)).slice(0, 8),
        link: command.link,
        caseStudySlug: slug,
        role: command.role.slice(0, 100),
        period: command.period.slice(0, 80),
        challenge: command.challenge.slice(0, 1200),
        approach: command.approach.slice(0, 1800),
        outcome: command.outcome.slice(0, 1200),
        mediaIds: [] as string[],
      };
      let nextPosts = current.publishing.posts;
      if (command.includeCompanionPost && current.publishing.posts.length < 24) {
        const postTitle = `How to Use ${command.title}: Complete 2026 Workflow & SEO Guide`.slice(0, 120);
        const postSlug = uniquePublishingSlug(current, "post", `${slug}-guide`);
        const blocks = [
          {
            id: crypto.randomUUID(),
            type: "heading" as const,
            text: `What ${command.title} Solves for Practitioners`,
            headingLevel: "h2" as const,
            items: [] as string[],
            mediaId: "",
          },
          {
            id: crypto.randomUUID(),
            type: "paragraph" as const,
            text: `${command.summary} ${command.challenge}`.trim().slice(0, 2800),
            headingLevel: "h2" as const,
            items: [] as string[],
            mediaId: "",
          },
          {
            id: crypto.randomUUID(),
            type: "heading" as const,
            text: "Step-by-Step Workflow & Key Capabilities",
            headingLevel: "h2" as const,
            items: [] as string[],
            mediaId: "",
          },
          {
            id: crypto.randomUUID(),
            type: "list" as const,
            text: "",
            headingLevel: "h2" as const,
            items: [
              command.approach || `Open ${command.title} in your browser with zero setup.`,
              command.outcome || "Export structured, copy-ready outputs in one click.",
              command.link ? `Launch directly at ${command.link}` : "Integrated into our AI tool directory.",
            ].map((item) => item.slice(0, 290)),
            mediaId: "",
          },
        ];
        const newPost = {
          id: crypto.randomUUID(),
          sourceArticleProjectId: `catalog-tool-${slug}`.slice(0, 120),
          pillarClusterSlug: slug.slice(0, 80),
          title: postTitle,
          slug: postSlug,
          seoTitle: `${command.title} Guide & Walkthrough (2026)`.slice(0, 70),
          seoDescription: command.summary.slice(0, 170),
          coverMediaId: "",
          status: "published" as const,
          publishedAt: new Date().toISOString(),
          excerpt: command.summary.slice(0, 320),
          tags: command.technologies.slice(0, 6),
          blocks,
          richContent: legacyRichDocument({ blocks }, current),
        };
        nextPosts = [newPost, ...current.publishing.posts];
      }
      next = {
        ...current,
        content: {
          ...current.content,
          projects: [...current.content.projects, newProject],
        },
        publishing: {
          ...current.publishing,
          posts: nextPosts,
        },
        ...nextRevision(current),
      };
      break;
    }
    case "scene.setFamily":
      if (current.scene.family === command.value) return current;
      next = { ...current, scene: { ...current.scene, family: command.value }, ...nextRevision(current) };
      break;
    case "scene.setPreset":
      next = { ...current, scene: { ...current.scene, preset: command.value }, ...nextRevision(current) };
      break;
    case "scene.setMotion":
      next = { ...current, scene: { ...current.scene, motion: command.value }, ...nextRevision(current) };
      break;
    case "scene.setIntensity":
      next = { ...current, scene: { ...current.scene, intensity: command.value }, ...nextRevision(current) };
      break;
    case "scene.focusSkill": {
      const exists = command.skillId === null || current.skills.some((skill) => skill.id === command.skillId);
      if (!exists) throw new Error("The requested skill does not exist in this portfolio.");
      next = { ...current, scene: { ...current.scene, focusedSkill: command.skillId }, ...nextRevision(current) };
      break;
    }
    case "skill.add":
      if (current.skills.length >= 8) throw new Error("A portfolio can contain up to eight featured skills.");
      if (current.skills.some((skill) => skill.label.toLowerCase() === command.label.toLowerCase())) return current;
      next = { ...current, skills: [...current.skills, { id: crypto.randomUUID(), label: command.label, level: 3 }], ...nextRevision(current) };
      break;
    case "skill.update": {
      const existing = current.skills.find((skill) => skill.id === command.skillId);
      if (!existing) throw new Error("The requested skill does not exist in this portfolio.");
      const updated = { ...existing, ...(command.label !== undefined ? { label: command.label } : {}), ...(command.level !== undefined ? { level: command.level } : {}) };
      if (updated.label === existing.label && updated.level === existing.level) return current;
      next = { ...current, skills: current.skills.map((skill) => skill.id === command.skillId ? updated : skill), ...nextRevision(current) };
      break;
    }
    case "skill.remove":
      if (!current.skills.some((skill) => skill.id === command.skillId)) throw new Error("The requested skill does not exist in this portfolio.");
      next = { ...current, skills: current.skills.filter((skill) => skill.id !== command.skillId), scene: { ...current.scene, focusedSkill: current.scene.focusedSkill === command.skillId ? null : current.scene.focusedSkill }, ...nextRevision(current) };
      break;
    case "content.setAbout": {
      const value = command.value.trim();
      if (value === current.content.about[command.field]) return current;
      next = { ...current, content: { ...current.content, about: { ...current.content.about, [command.field]: value } }, ...nextRevision(current) };
      break;
    }
    case "content.setContact": {
      const value = command.value.trim();
      if (value === current.content.contact[command.field]) return current;
      next = { ...current, content: { ...current.content, contact: { ...current.content.contact, [command.field]: value } }, ...nextRevision(current) };
      break;
    }
    case "social.add": {
      if (current.content.contact.socials.length >= 10) throw new Error("A portfolio can contain up to ten social links.");
      if (!/^https?:\/\//i.test(command.url)) throw new Error("Social links must use http or https.");
      next = { ...current, content: { ...current.content, contact: { ...current.content.contact, socials: [...current.content.contact.socials, { id: crypto.randomUUID(), platform: command.platform, url: command.url }] } }, ...nextRevision(current) };
      break;
    }
    case "social.update": {
      const item = current.content.contact.socials.find((entry) => entry.id === command.itemId);
      if (!item) throw new Error("The requested social link does not exist.");
      if (command.url && !/^https?:\/\//i.test(command.url)) throw new Error("Social links must use http or https.");
      next = { ...current, content: { ...current.content, contact: { ...current.content.contact, socials: current.content.contact.socials.map((entry) => entry.id === item.id ? { ...entry, ...(command.platform ? { platform: command.platform } : {}), ...(command.url ? { url: command.url } : {}) } : entry) } }, ...nextRevision(current) };
      break;
    }
    case "social.remove":
      if (!current.content.contact.socials.some((entry) => entry.id === command.itemId)) throw new Error("The requested social link does not exist.");
      next = { ...current, content: { ...current.content, contact: { ...current.content.contact, socials: current.content.contact.socials.filter((entry) => entry.id !== command.itemId) } }, ...nextRevision(current) };
      break;
    case "opportunity.set": {
      if (current.opportunity.status === "canonical") throw new Error("Create an opportunity variant before adding an opportunity brief.");
      const value = command.value.trim();
      if (current.opportunity[command.field] === value) return current;
      next = { ...current, opportunity: { ...current.opportunity, [command.field]: value }, ...nextRevision(current) };
      break;
    }
    case "opportunity.setStatus":
      if (current.opportunity.status === "canonical") throw new Error("The canonical portfolio cannot be converted into a variant from this control.");
      if (command.status === "published") throw new Error("Use the owner-controlled Publish action to publish a variant. A status label does not create a public snapshot.");
      if (current.opportunity.status === command.status) return current;
      if (command.status === "review" && !reviewOpportunity(current).ready) throw new Error("Complete the title, audience, brief, and at least one approved case study before requesting review.");
      next = { ...current, opportunity: { ...current.opportunity, status: command.status }, ...nextRevision(current) };
      break;
    case "opportunity.setVisibility":
      if (current.opportunity.status === "canonical") throw new Error("Visibility is set on an opportunity variant only.");
      if (current.opportunity.visibility === command.visibility) return current;
      next = { ...current, opportunity: { ...current.opportunity, visibility: command.visibility }, ...nextRevision(current) };
      break;
    case "opportunity.setIncludedProjects": {
      if (current.opportunity.status === "canonical") throw new Error("Project selection belongs to an opportunity variant.");
      const projectIds = [...new Set(command.projectIds)];
      if (projectIds.some((id) => !current.content.projects.some((project) => project.id === id))) throw new Error("An included project is not available in this portfolio.");
      if (JSON.stringify(projectIds) === JSON.stringify(current.opportunity.includedProjectIds)) return current;
      next = { ...current, opportunity: { ...current.opportunity, includedProjectIds: projectIds }, ...nextRevision(current) };
      break;
    }
    case "section.setVisible":
      if (current.content.visibility[command.section] === command.value) return current;
      next = { ...current, content: { ...current.content, visibility: { ...current.content.visibility, [command.section]: command.value } }, ...nextRevision(current) };
      break;
    case "section.move": {
      const index = current.content.order.indexOf(command.section);
      const target = command.direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= current.content.order.length) return current;
      const order = [...current.content.order];
      [order[index], order[target]] = [order[target], order[index]];
      next = { ...current, content: { ...current.content, order }, ...nextRevision(current) };
      break;
    }
    case "section.moveTo": {
      const index = current.content.order.indexOf(command.section);
      if (index < 0) throw new Error("The requested section does not exist.");
      const target = Math.min(command.targetIndex, current.content.order.length - 1);
      if (index === target) return current;
      const order = [...current.content.order];
      const [section] = order.splice(index, 1);
      order.splice(target, 0, section);
      next = { ...current, content: { ...current.content, order }, ...nextRevision(current) };
      break;
    }
    case "experience.add":
      if (current.content.experience.length >= 8) throw new Error("A portfolio can contain up to eight experience entries.");
      next = { ...current, content: { ...current.content, experience: [...current.content.experience, { id: crypto.randomUUID(), role: command.role ?? "New role", organization: command.organization ?? "", period: command.period ?? "", summary: command.summary ?? "" }] }, ...nextRevision(current) };
      break;
    case "experience.update": {
      const item = current.content.experience.find((entry) => entry.id === command.itemId);
      if (!item) throw new Error("The requested experience entry does not exist.");
      const value = command.value.trim();
      if (item[command.field] === value) return current;
      next = { ...current, content: { ...current.content, experience: current.content.experience.map((entry) => entry.id === command.itemId ? { ...entry, [command.field]: value } : entry) }, ...nextRevision(current) };
      break;
    }
    case "experience.remove":
      if (!current.content.experience.some((entry) => entry.id === command.itemId)) throw new Error("The requested experience entry does not exist.");
      next = { ...current, content: { ...current.content, experience: current.content.experience.filter((entry) => entry.id !== command.itemId) }, ...nextRevision(current) };
      break;
    case "education.add":
      if (current.content.education.length >= 8) throw new Error("A portfolio can contain up to eight education entries.");
      next = { ...current, content: { ...current.content, education: [...current.content.education, { id: crypto.randomUUID(), credential: command.credential ?? "New credential", institution: command.institution ?? "", period: command.period ?? "", summary: command.summary ?? "" }] }, ...nextRevision(current) };
      break;
    case "education.update": {
      const item = current.content.education.find((entry) => entry.id === command.itemId);
      if (!item) throw new Error("The requested education entry does not exist.");
      const value = command.value.trim();
      if (item[command.field] === value) return current;
      next = { ...current, content: { ...current.content, education: current.content.education.map((entry) => entry.id === command.itemId ? { ...entry, [command.field]: value } : entry) }, ...nextRevision(current) };
      break;
    }
    case "education.remove":
      if (!current.content.education.some((entry) => entry.id === command.itemId)) throw new Error("The requested education entry does not exist.");
      next = { ...current, content: { ...current.content, education: current.content.education.filter((entry) => entry.id !== command.itemId) }, ...nextRevision(current) };
      break;
    case "project.add":
      if (current.content.projects.length >= 8) throw new Error("A portfolio can contain up to eight projects.");
      next = { ...current, content: { ...current.content, projects: [...current.content.projects, { id: crypto.randomUUID(), title: command.title ?? "New project", summary: command.summary ?? "", technologies: command.technologies ?? [], link: command.link ?? "", caseStudySlug: uniqueProjectSlug(current, command.title ?? "new-project"), role: "", period: "", challenge: "", approach: "", outcome: "", mediaIds: [] }] }, ...nextRevision(current) };
      break;
    case "project.update": {
      const item = current.content.projects.find((entry) => entry.id === command.itemId);
      if (!item) throw new Error("The requested project does not exist.");
      let value = Array.isArray(command.value) ? command.value.map((entry) => entry.trim()).filter(Boolean) : command.value.trim();
      if (command.field === "caseStudySlug" && typeof value === "string") {
        value = normalizeCaseStudySlug(value);
        if (!value) throw new Error("Use at least one letter or number in the case-study slug.");
        if (current.content.projects.some((entry) => entry.id !== command.itemId && entry.caseStudySlug === value)) throw new Error("Each case study needs a unique slug.");
      }
      if (JSON.stringify(item[command.field]) === JSON.stringify(value)) return current;
      next = { ...current, content: { ...current.content, projects: current.content.projects.map((entry) => entry.id === command.itemId ? { ...entry, [command.field]: value } : entry) }, ...nextRevision(current) };
      break;
    }
    case "project.move": {
      const index = current.content.projects.findIndex((entry) => entry.id === command.itemId);
      if (index < 0) throw new Error("The requested project does not exist.");
      const target = command.direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= current.content.projects.length) return current;
      const projects = [...current.content.projects];
      [projects[index], projects[target]] = [projects[target], projects[index]];
      next = { ...current, content: { ...current.content, projects }, ...nextRevision(current) };
      break;
    }
    case "project.attachMedia": {
      const asset = current.media.assets.find((entry) => entry.id === command.mediaId);
      const project = current.content.projects.find((entry) => entry.id === command.itemId);
      if (!asset || !project) throw new Error("The requested project or media asset does not exist.");
      if (project.mediaIds.includes(asset.id)) return current;
      if (project.mediaIds.length >= 8) throw new Error("A case-study gallery can contain up to eight images.");
      next = { ...current, content: { ...current.content, projects: current.content.projects.map((entry) => entry.id === project.id ? { ...entry, mediaIds: [...entry.mediaIds, asset.id] } : entry) }, ...nextRevision(current) };
      break;
    }
    case "project.detachMedia": {
      const project = current.content.projects.find((entry) => entry.id === command.itemId);
      if (!project) throw new Error("The requested project does not exist.");
      if (!project.mediaIds.includes(command.mediaId)) return current;
      next = { ...current, content: { ...current.content, projects: current.content.projects.map((entry) => entry.id === project.id ? { ...entry, mediaIds: entry.mediaIds.filter((id) => id !== command.mediaId) } : entry) }, ...nextRevision(current) };
      break;
    }
    case "project.remove":
      if (!current.content.projects.some((entry) => entry.id === command.itemId)) throw new Error("The requested project does not exist.");
      next = { ...current, content: { ...current.content, projects: current.content.projects.filter((entry) => entry.id !== command.itemId) }, ...nextRevision(current) };
      break;
    case "media.setHeadshot":
      if (current.media.headshotUrl === command.url && current.media.headshotAlt === command.alt) return current;
      next = { ...current, media: { ...current.media, headshotUrl: command.url, headshotAlt: command.alt }, ...nextRevision(current) };
      break;
    case "media.addAsset":
      if (current.media.assets.length >= 24) throw new Error("The media library can contain up to 24 images.");
      if (current.media.assets.some((asset) => asset.id === command.asset.id)) return current;
      next = { ...current, media: { ...current.media, assets: [...current.media.assets, command.asset] }, ...nextRevision(current) };
      break;
    case "media.updateAsset":
      if (!current.media.assets.some((asset) => asset.id === command.mediaId)) throw new Error("The requested media asset does not exist.");
      next = { ...current, media: { ...current.media, assets: current.media.assets.map((asset) => asset.id === command.mediaId ? { ...asset, alt: command.alt } : asset) }, ...nextRevision(current) };
      break;
    case "media.removeAsset":
      if (!current.media.assets.some((asset) => asset.id === command.mediaId)) throw new Error("The requested media asset does not exist.");
      next = { ...current, media: { ...current.media, assets: current.media.assets.filter((asset) => asset.id !== command.mediaId) }, content: { ...current.content, projects: current.content.projects.map((project) => ({ ...project, mediaIds: project.mediaIds.filter((id) => id !== command.mediaId) })) }, ...nextRevision(current) };
      break;
    case "publishing.add": {
      const collection = command.kind === "page" ? current.publishing.pages : current.publishing.posts;
      const limit = command.kind === "page" ? 12 : 24;
      if (collection.length >= limit) throw new Error(`A portfolio can contain up to ${limit} ${command.kind}s.`);
      const title = command.title ?? (command.kind === "page" ? "New page" : "New post");
      const base = { id: crypto.randomUUID(), title, slug: uniquePublishingSlug(current, command.kind, title), seoTitle: command.seoTitle ?? "", seoDescription: command.seoDescription ?? "", coverMediaId: "", status: "draft" as const, publishedAt: null, blocks: command.body ? [{ id: crypto.randomUUID(), type: "paragraph" as const, text: command.body, headingLevel: "h2" as const, items: [], mediaId: "" }] : [] };
      next = command.kind === "page"
        ? { ...current, publishing: { ...current.publishing, pages: [...current.publishing.pages, { ...base, navigationLabel: title.slice(0, 40) }] }, ...nextRevision(current) }
        : { ...current, publishing: { ...current.publishing, posts: [...current.publishing.posts, { ...base, excerpt: command.excerpt ?? "", tags: [] }] }, ...nextRevision(current) };
      break;
    }
    case "publishing.update": {
      const item = findPublishable(current, command.kind, command.itemId);
      if (!item) throw new Error(`The requested ${command.kind} does not exist.`);
      if (command.field === "navigationLabel" && command.kind !== "page") throw new Error("Navigation labels apply only to custom pages.");
      if ((command.field === "excerpt" || command.field === "tags") && command.kind !== "post") throw new Error("Excerpts and tags apply only to blog posts.");
      let value = Array.isArray(command.value) ? command.value.map((entry) => entry.trim()).filter(Boolean) : command.value.trim();
      if (command.field === "slug" && typeof value === "string") {
        value = normalizePublishingSlug(value);
        if (!value) throw new Error("Use at least one letter or number in the public slug.");
        if (publishingSlugExists(current, command.kind, value, command.itemId)) throw new Error(`Each ${command.kind} needs a unique slug.`);
      }
      if (command.field === "coverMediaId" && value && !current.media.assets.some((asset) => asset.id === value)) throw new Error("Choose an image from the media library.");
      if (JSON.stringify(item[command.field as keyof typeof item]) === JSON.stringify(value)) return current;
      next = { ...current, publishing: updatePublishable(current, command.kind, command.itemId, (entry) => ({ ...entry, [command.field]: value })), ...nextRevision(current) };
      break;
    }
    case "publishing.setContent":
      next = {...current, publishing:updatePublishable(current,command.kind,command.itemId,entry=>({...entry,richContent:command.richContent,blocks:command.blocks})),...nextRevision(current)};
      break;
    case "publishing.upsertFromWriterStudio":
      next = applyUpsertFromWriterStudioCommand(current, command);
      break;
    case "publishing.remove":
      if (!findPublishable(current, command.kind, command.itemId)) throw new Error(`The requested ${command.kind} does not exist.`);
      next = command.kind === "page"
        ? { ...current, publishing: { ...current.publishing, pages: current.publishing.pages.filter((item) => item.id !== command.itemId) }, ...nextRevision(current) }
        : { ...current, publishing: { ...current.publishing, posts: current.publishing.posts.filter((item) => item.id !== command.itemId) }, ...nextRevision(current) };
      break;
    case "publishing.setStatus": {
      const item = findPublishable(current, command.kind, command.itemId);
      if (!item) throw new Error(`The requested ${command.kind} does not exist.`);
      if (item.status === command.status) return current;
      if (command.status === "published") {
        const hasContent = item.blocks.some((block) => block.type === "image" ? Boolean(block.mediaId) : block.type === "list" || block.type === "ordered-list" ? block.items.length > 0 : Boolean(block.text.trim()));
        if (!hasContent) throw new Error("Add meaningful page content before publishing.");
        if (command.kind === "post") {
          const post = current.publishing.posts.find((entry) => entry.id === command.itemId)!;
          const missing = [!post.title.trim() && "title", !post.slug.trim() && "public URL", !post.excerpt.trim() && "excerpt", !post.coverMediaId && "cover image", !post.seoTitle.trim() && "SEO title", !post.seoDescription.trim() && "SEO description"].filter(Boolean);
          if (missing.length) throw new Error(`Complete the required article fields: ${missing.join(", ")}.`);
        }
      }
      const publishedAt = command.status === "published" ? new Date().toISOString() : null;
      next = { ...current, publishing: updatePublishable(current, command.kind, command.itemId, (entry) => ({ ...entry, status: command.status, publishedAt })), ...nextRevision(current) };
      break;
    }
    case "block.add": {
      const item = findPublishable(current, command.kind, command.itemId);
      if (!item) throw new Error(`The requested ${command.kind} does not exist.`);
      if (item.blocks.length >= 40) throw new Error("A page or post can contain up to 40 blocks.");
      const block = { id: crypto.randomUUID(), type: command.blockType, text: command.blockType === "heading" ? "New heading" : "", headingLevel: "h2" as const, items: [], mediaId: "" };
      const insertionIndex = command.afterBlockId ? item.blocks.findIndex((entry) => entry.id === command.afterBlockId) + 1 : item.blocks.length;
      if (command.afterBlockId && insertionIndex === 0) throw new Error("The requested insertion point does not exist.");
      const blocks = [...item.blocks];
      blocks.splice(insertionIndex, 0, block);
      next = { ...current, publishing: updatePublishable(current, command.kind, command.itemId, (entry) => ({ ...entry, richContent: undefined, blocks })), ...nextRevision(current) };
      break;
    }
    case "block.update": {
      const item = findPublishable(current, command.kind, command.itemId);
      const block = item?.blocks.find((entry) => entry.id === command.blockId);
      if (!item || !block) throw new Error("The requested content block does not exist.");
      const value = Array.isArray(command.value) ? command.value.map((entry) => entry.trim()).filter(Boolean) : command.value.trim();
      if (command.field === "mediaId" && value && !current.media.assets.some((asset) => asset.id === value)) throw new Error("Choose an image from the media library.");
      if (command.field === "headingLevel" && (typeof value !== "string" || !["h2", "h3", "h4", "h5", "h6"].includes(value))) throw new Error("Choose a heading level from H2 through H6.");
      if (JSON.stringify(block[command.field]) === JSON.stringify(value)) return current;
      next = { ...current, publishing: updatePublishable(current, command.kind, command.itemId, (entry) => ({ ...entry, richContent: undefined, blocks: entry.blocks.map((candidate) => candidate.id === block.id ? { ...candidate, [command.field]: value } : candidate) })), ...nextRevision(current) };
      break;
    }
    case "block.remove": {
      const item = findPublishable(current, command.kind, command.itemId);
      if (!item?.blocks.some((entry) => entry.id === command.blockId)) throw new Error("The requested content block does not exist.");
      next = { ...current, publishing: updatePublishable(current, command.kind, command.itemId, (entry) => ({ ...entry, richContent: undefined, blocks: entry.blocks.filter((candidate) => candidate.id !== command.blockId) })), ...nextRevision(current) };
      break;
    }
    case "block.move": {
      const item = findPublishable(current, command.kind, command.itemId);
      if (!item) throw new Error(`The requested ${command.kind} does not exist.`);
      const index = item.blocks.findIndex((entry) => entry.id === command.blockId);
      if (index < 0) throw new Error("The requested content block does not exist.");
      const target = command.direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= item.blocks.length) return current;
      const blocks = [...item.blocks];
      [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
      next = { ...current, publishing: updatePublishable(current, command.kind, command.itemId, (entry) => ({ ...entry, richContent: undefined, blocks })), ...nextRevision(current) };
      break;
    }
    case "block.moveTo": {
      const item = findPublishable(current, command.kind, command.itemId);
      if (!item) throw new Error(`The requested ${command.kind} does not exist.`);
      const index = item.blocks.findIndex((entry) => entry.id === command.blockId);
      if (index < 0) throw new Error("The requested content block does not exist.");
      const target = Math.min(command.targetIndex, item.blocks.length - 1);
      if (target === index) return current;
      const blocks = [...item.blocks];
      const [moved] = blocks.splice(index, 1);
      blocks.splice(target, 0, moved);
      next = { ...current, publishing: updatePublishable(current, command.kind, command.itemId, (entry) => ({ ...entry, richContent: undefined, blocks })), ...nextRevision(current) };
      break;
    }
  }

  return siteDocumentSchema.parse(next);
}

export function describeCommand(command: SiteCommand, document: SiteDocument) {
  switch (command.type) {
    case "visitor.enable": return command.enabled ? "Enabled Visitor AI Agent for the next publication." : "Disabled Visitor AI Agent for the next publication.";
    case "visitor.addFact": return "Approved a public Visitor AI Agent note.";
    case "visitor.removeFact": return "Removed a public Visitor AI Agent note.";
    case "voice.replaceText": return `Replaced reviewed text across this portfolio.`;
    case "identity.set": return `Updated ${command.field}.`;
    case "design.setAccent": return `Changed the accent to ${command.value}.`;
    case "design.setBackground": return `Changed the background to ${command.value}.`;
    case "design.setHeroAlignment": return `Aligned the hero ${command.value}.`;
    case "design.setTemplate": return `Switched to the ${command.value} template.`;
    case "design.applyTemplateDefaults": return `Loaded default tools, pages, and 5 SEO blog posts for ${command.value}.`;
    case "project.installCatalogTool": return `Installed "${command.title}" from the DoItWithAI Tool Catalog (0 AI tokens).`;
    case "scene.setFamily": return `Changed the 3D scene family to ${command.value}.`;
    case "scene.setPreset": return `Applied the ${command.value} 3D preset.`;
    case "scene.setMotion": return `Set scene motion to ${command.value}.`;
    case "scene.setIntensity": return `Set scene intensity to ${Math.round(command.value * 100)}%.`;
    case "scene.focusSkill": {
      const label = document.skills.find((skill) => skill.id === command.skillId)?.label;
      return label ? `Focused the scene on ${label}.` : "Cleared the scene focus.";
    }
    case "skill.add": return `Added ${command.label} to featured skills.`;
    case "skill.update": return "Updated a featured skill.";
    case "skill.remove": return "Removed a featured skill.";
    case "content.setAbout": return `Updated About ${command.field}.`;
    case "content.setContact": return `Updated Contact ${command.field}.`;
    case "social.add": return `Added a ${command.platform} link.`;
    case "social.update": return "Updated a social link.";
    case "social.remove": return "Removed a social link.";
    case "opportunity.set": return `Updated the opportunity ${command.field}.`;
    case "opportunity.setStatus": return `Marked this opportunity variant as ${command.status}.`;
    case "opportunity.setVisibility": return `Set opportunity visibility to ${command.visibility}.`;
    case "opportunity.setIncludedProjects": return "Updated the projects selected for this opportunity.";
    case "section.setVisible": return `${command.value ? "Showed" : "Hid"} the ${command.section} section.`;
    case "section.move": return `Moved the ${command.section} section ${command.direction}.`;
    case "section.moveTo": return `Moved the ${command.section} section to position ${command.targetIndex + 1}.`;
    case "experience.add": return "Added an experience entry.";
    case "experience.update": return "Updated an experience entry.";
    case "experience.remove": return "Removed an experience entry.";
    case "education.add": return "Added an education entry.";
    case "education.update": return "Updated an education entry.";
    case "education.remove": return "Removed an education entry.";
    case "project.add": return "Added a project.";
    case "project.update": return "Updated a project.";
    case "project.move": return `Moved a project ${command.direction}.`;
    case "project.attachMedia": return "Added an image to a case study.";
    case "project.detachMedia": return "Removed an image from a case study.";
    case "project.remove": return "Removed a project.";
    case "media.setHeadshot": return command.url ? "Updated the portfolio headshot." : "Removed the portfolio headshot.";
    case "media.addAsset": return "Added an image to the media library.";
    case "media.updateAsset": return "Updated image alternative text.";
    case "media.removeAsset": return "Removed an image from the media library.";
    case "publishing.add": return `Added a ${command.kind} draft.`;
    case "publishing.update": return `Updated ${command.kind} ${command.field}.`;
    case "publishing.setContent": return "Updated rich page content.";
    case "publishing.upsertFromWriterStudio": return describeWriterPublishingCommand(command);
    case "publishing.remove": return `Removed a ${command.kind}.`;
    case "publishing.setStatus": return `${command.status === "published" ? "Published" : "Returned to draft"} the ${command.kind}.`;
    case "block.add": return `Added a ${command.blockType} block.`;
    case "block.update": return "Updated a structured content block.";
    case "block.remove": return "Removed a structured content block.";
    case "block.move": return `Moved a content block ${command.direction}.`;
    case "block.moveTo": return "Reordered a content block.";
  }
}

export function normalizeCaseStudySlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function uniqueProjectSlug(document: SiteDocument, value: string) {
  const base = normalizeCaseStudySlug(value) || "project";
  let candidate = base;
  let suffix = 2;
  const existing = new Set(document.content.projects.map((project) => project.caseStudySlug));
  while (existing.has(candidate)) candidate = `${base}-${suffix++}`;
  return candidate;
}

type PublishingKind = "page" | "post";
type CustomPage = SiteDocument["publishing"]["pages"][number];
type BlogPost = SiteDocument["publishing"]["posts"][number];
type Publishable = CustomPage | BlogPost;

export function normalizePublishingSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function findPublishable(document: SiteDocument, kind: PublishingKind, id: string): Publishable | undefined {
  return kind === "page" ? document.publishing.pages.find((item) => item.id === id) : document.publishing.posts.find((item) => item.id === id);
}

function publishingSlugExists(document: SiteDocument, kind: PublishingKind, slug: string, exceptId?: string) {
  const collection = kind === "page" ? document.publishing.pages : document.publishing.posts;
  return collection.some((item) => item.id !== exceptId && item.slug === slug);
}

function uniquePublishingSlug(document: SiteDocument, kind: PublishingKind, value: string) {
  const base = normalizePublishingSlug(value) || kind;
  let candidate = base;
  let suffix = 2;
  while (publishingSlugExists(document, kind, candidate)) candidate = `${base}-${suffix++}`;
  return candidate;
}

function updatePublishable(document: SiteDocument, kind: PublishingKind, id: string, update: (entry: Publishable) => Publishable): SiteDocument["publishing"] {
  return kind === "page"
    ? { ...document.publishing, pages: document.publishing.pages.map((item) => item.id === id ? update(item) as CustomPage : item) }
    : { ...document.publishing, posts: document.publishing.posts.map((item) => item.id === id ? update(item) as BlogPost : item) };
}
