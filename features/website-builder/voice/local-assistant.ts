import { TEMPLATE_CONTRACTS } from "@/features/website-builder/domain/template-contracts";
export type AssistantCall = { name: string; arguments: Record<string, unknown> };
export type AssistantPlan = { reply: string; calls: AssistantCall[]; source: "local" | "ai"; degraded?: boolean; code?: string };

const destinations: Array<{ destination: string; label: string; patterns: RegExp[] }> = [
  { destination: "page_structure", label: "Page Structure", patterns: [/\bpage structure\b/i, /\bsection structure\b/i] },
  { destination: "media_library", label: "Media Library", patterns: [/\bmedia library\b/i, /\bimages? library\b/i] },
  { destination: "site_pages", label: "Site Pages", patterns: [/\bsite pages?\b/i, /\bcustom pages?\b/i] },
  { destination: "blog", label: "Blog", patterns: [/\bblogs?\b/i, /\barticles?\b/i, /\bblog posts?\b/i] },
  { destination: "experience", label: "Experience", patterns: [/\bexperience\b/i, /\bwork history\b/i] },
  { destination: "education", label: "Education", patterns: [/\beducation\b/i, /\bqualifications?\b/i] },
  { destination: "projects", label: "Projects", patterns: [/\bprojects?\b/i, /\bportfolio work\b/i] },
  { destination: "contact", label: "Contact", patterns: [/\bcontact\b/i, /\bsocial links?\b/i] },
  { destination: "opportunity", label: "Opportunity", patterns: [/\bopportunit(?:y|ies)\b/i, /\bvariant\b/i, /\btailor(?:ed)? version\b/i] },
  { destination: "skills", label: "Skills", patterns: [/\bskills?\b/i, /\bcapabilities\b/i] },
  { destination: "about", label: "About", patterns: [/\babout\b/i, /\bmy story\b/i] },
  { destination: "design", label: "Design", patterns: [/\bdesign panel\b/i, /\btheme settings?\b/i] },
  { destination: "scene", label: "3D Scene", patterns: [/\b3d scene\b/i, /\bscene settings?\b/i] },
  { destination: "hero", label: "Hero", patterns: [/\bhero\b/i, /\bhome(?:page)?\b/i, /\btop section\b/i] },
];

const navigationIntent = /\b(go|move|navigate|jump|open|show|take me|switch|visit|focus)\b/i;
const generativeIntent = /\b(improve|enhance|rewrite|polish|refine|draft|write|generate|optimise|optimize|make (?:it|this) (?:better|professional))\b/i;

export function planLocalAssistant(message: string): AssistantPlan | null {
  const value = message.trim();
  if (!value) return null;
  // A single-field matcher must never swallow a second instruction as literal field text.
  if (/\b(?:and|then|also|after that)\s+(?:please\s+)?(?:change|set|update|replace|add|remove|publish|go to|open)\b/i.test(value)) return null;

  const siteReplace = value.match(/^(?:please\s+)?replace\s+[“"']?(.+?)[”"']?\s+with\s+[“"']?(.+?)[”"']?\s+(?:everywhere|across (?:my|the) (?:website|portfolio|site)|throughout (?:my|the) (?:website|portfolio|site))[.!]?$/i);
  if (siteReplace && siteReplace[1].trim() && siteReplace[2].trim())
    return { source: "local", reply: "Scanning exact matches for your review. Nothing will change yet.", calls: [{ name: "review_site_replace", arguments: { from: siteReplace[1].trim(), to: siteReplace[2].trim() } }] };

  if (/^(?:please\s+)?(?:show|summari[sz]e|list|tell me about)\s+(?:my\s+)?(?:projects|portfolio dashboard|portfolios)[.!]?$/i.test(value))
    return { source: "local", reply: "Reading your saved portfolio dashboard.", calls: [{ name: "summarize_projects", arguments: {} }] };

  if (/^(?:please\s+)?(?:publish|review publishing|prepare publication|show publication)(?:\s+(?:my|the))?\s+(?:website|portfolio|site)(?:\s+changes)?[.!]?$/i.test(value))
    return { source: "local", reply: "Preparing a publication review.", calls: [{ name: "review_publication", arguments: { scope: "website" } }] };

  if (/^(?:please\s+)?undo(?:\s+(?:that|the last change))?[.!]?$/i.test(value)) {
    return { source: "local", reply: "I undid the previous change.", calls: [{ name: "undo_last_change", arguments: {} }] };
  }

  if (/\b(?:open|launch|go to|write|draft)\b.*\b(?:ai content writer|content writer|writer studio)\b/i.test(value)) {
    return { source: "local", reply: "Opening the AI Content Writer Studio linked to this website.", calls: [{ name: "open_in_content_writer", arguments: {} }] };
  }

  const template = TEMPLATE_CONTRACTS.find((item) => value.toLowerCase().includes(item.name.toLowerCase()) || value.toLowerCase().includes(item.id));
  if (template && /\b(use|switch|apply|choose|select|change)\b/i.test(value)) return { source: "local", reply: `Applying ${template.name}. Your content is preserved.`, calls: [{ name: "set_portfolio_template", arguments: { template: template.id } }] };
  if (/\b(upload|add|replace|change)\b/i.test(value) && /\b(portrait|headshot|profile (?:photo|image)|hero (?:photo|image))\b/i.test(value)) return { source: "local", reply: "Opening your profile photo controls in About. Choose Upload image to select a file. Your portrait is shared with portrait-based hero layouts.", calls: [{ name: "navigate_to", arguments: { destination: "about" } }] };

  if (navigationIntent.test(value)) {
    const target = destinations.find((candidate) => candidate.patterns.some((pattern) => pattern.test(value)));
    if (target) return { source: "local", reply: `Opening ${target.label}.`, calls: [{ name: "navigate_to", arguments: { destination: target.destination } }] };
  }

  if (generativeIntent.test(value)) return null;

  const textEdit = value.match(/^(?:please\s+)?(?:change|set|update|replace)\s+(?:my\s+|the\s+)?(hero name|name|professional role|hero role|introduction|hero introduction|availability|about heading|about text|about paragraph|contact heading|contact email|contact location|contact button|contact call to action)\s+(?:to|as|with)\s+([\s\S]+)$/i);
  if (textEdit) {
    const targetByLabel: Record<string, string> = {
      "hero name": "hero_name", name: "hero_name", "professional role": "hero_role", "hero role": "hero_role",
      introduction: "hero_intro", "hero introduction": "hero_intro", availability: "hero_availability",
      "about heading": "about_heading", "about text": "about_body", "about paragraph": "about_body",
      "contact heading": "contact_heading", "contact email": "contact_email", "contact location": "contact_location",
      "contact button": "contact_cta", "contact call to action": "contact_cta",
    };
    const target = targetByLabel[textEdit[1].toLowerCase()];
    return { source: "local", reply: "I’ll apply that exact text.", calls: [{ name: "update_text_content", arguments: { target, text: textEdit[2].trim(), polish: false } }] };
  }

  const skill = value.match(/^(?:please\s+)?add\s+(.+?)\s+as\s+(?:a\s+)?skill[.!]?$/i);
  if (skill) return { source: "local", reply: `Adding ${skill[1].trim()} to Skills.`, calls: [{ name: "manage_skill", arguments: { action: "add", label: skill[1].trim() } }] };

  const social = value.match(/^(?:please\s+)?add\s+(https?:\/\/\S+)\s+(?:as|to)\s+(?:my\s+)?(facebook|instagram|linkedin|x|youtube|tiktok|github|website|medium|pinterest)(?:\s+(?:profile|link))?[.!]?$/i);
  if (social) return { source: "local", reply: `Adding the ${social[2]} link to Contact.`, calls: [{ name: "manage_social_link", arguments: { action: "add", platform: social[2].toLowerCase(), url: social[1] } }] };

  return null;
}
