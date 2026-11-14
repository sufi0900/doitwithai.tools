import type { SiteDocument } from "./site-document";
import type { RichNode } from "./rich-document";

/** Replace literal, case-sensitive owner-supplied copy only. Never edit URLs, slugs or media metadata. */
export function previewSiteWideReplace(document: SiteDocument, from: string, to: string) {
  if (!from || !to || from === to) throw new Error("Provide different, nonempty original and replacement text.");
  const locations: string[] = [];
  let occurrences = 0;
  function replace(value: string, label: string, report = true) {
    const count = value.split(from).length - 1;
    if (!count) return value;
    if (report) { occurrences += count; locations.push(`${label} (${count})`); }
    if (occurrences > 100 || locations.length > 40) throw new Error("This phrase occurs too often to change safely in one request. Narrow the phrase or section.");
    return value.split(from).join(to);
  }
  function rich(node: RichNode, label: string): RichNode {
    return { ...node, ...(node.type === "text" && typeof node.text === "string" ? { text: replace(node.text, label) } : {}),
      ...(node.content ? { content: node.content.map(child => rich(child, label)) } : {}) };
  }
  const publishing = {
    ...document.publishing,
    pages: document.publishing.pages.map(page => ({ ...page,
      title: replace(page.title, `Page ${page.id}: title`),
      navigationLabel: replace(page.navigationLabel, `Page ${page.id}: navigation label`),
      seoTitle: replace(page.seoTitle, `Page ${page.id}: SEO title`),
      seoDescription: replace(page.seoDescription, `Page ${page.id}: SEO description`),
      blocks: page.blocks.map(block => ({ ...block, text: replace(block.text, `Page ${page.id}: content`, !page.richContent), items: block.items.map(item => replace(item, `Page ${page.id}: list`, !page.richContent)) })),
      ...(page.richContent ? { richContent: rich(page.richContent, `Page ${page.id}: rich text`) } : {}) })),
    posts: document.publishing.posts.map(post => ({ ...post,
      title: replace(post.title, `Blog ${post.id}: title`),
      excerpt: replace(post.excerpt, `Blog ${post.id}: excerpt`),
      seoTitle: replace(post.seoTitle, `Blog ${post.id}: SEO title`),
      seoDescription: replace(post.seoDescription, `Blog ${post.id}: SEO description`),
      blocks: post.blocks.map(block => ({ ...block, text: replace(block.text, `Blog ${post.id}: content`, !post.richContent), items: block.items.map(item => replace(item, `Blog ${post.id}: list`, !post.richContent)) })),
      ...(post.richContent ? { richContent: rich(post.richContent, `Blog ${post.id}: rich text`) } : {}) })),
  };
  const next: SiteDocument = { ...document,
    identity: { ...document.identity, name: replace(document.identity.name, "Hero: name"), role: replace(document.identity.role, "Hero: role"), intro: replace(document.identity.intro, "Hero: introduction"), availability: replace(document.identity.availability, "Hero: availability") },
    content: { ...document.content,
      about: { heading: replace(document.content.about.heading, "About: heading"), body: replace(document.content.about.body, "About: body") },
      contact: { ...document.content.contact, heading: replace(document.content.contact.heading, "Contact: heading"), location: replace(document.content.contact.location, "Contact: location"), cta: replace(document.content.contact.cta, "Contact: call to action") },
      experience: document.content.experience.map(item => ({ ...item, role: replace(item.role, `Experience ${item.id}: role`), organization: replace(item.organization, `Experience ${item.id}: organization`), period: replace(item.period, `Experience ${item.id}: period`), summary: replace(item.summary, `Experience ${item.id}: summary`) })),
      education: document.content.education.map(item => ({ ...item, credential: replace(item.credential, `Education ${item.id}: credential`), institution: replace(item.institution, `Education ${item.id}: institution`), period: replace(item.period, `Education ${item.id}: period`), summary: replace(item.summary, `Education ${item.id}: summary`) })),
      projects: document.content.projects.map(item => ({ ...item, title: replace(item.title, `Project ${item.id}: title`), summary: replace(item.summary, `Project ${item.id}: summary`), role: replace(item.role, `Project ${item.id}: role`), period: replace(item.period, `Project ${item.id}: period`), challenge: replace(item.challenge, `Project ${item.id}: challenge`), approach: replace(item.approach, `Project ${item.id}: approach`), outcome: replace(item.outcome, `Project ${item.id}: outcome`) })),
    },
    skills: document.skills.map(skill => ({ ...skill, label: replace(skill.label, `Skill ${skill.id}`) })),
    publishing,
  };
  return { next, locations, occurrences };
}
