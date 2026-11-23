export const WIKIDATA_API = "https://www.wikidata.org/w/api.php";

export const LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ar", label: "Arabic" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "hi", label: "Hindi" },
  { code: "id", label: "Indonesian" },
  { code: "pt", label: "Portuguese" },
  { code: "tr", label: "Turkish" },
  { code: "ur", label: "Urdu" },
];

export const SCHEMA_TYPES = ["Organization", "Person", "Brand", "Product", "Place"] as const;
export type SchemaType = (typeof SCHEMA_TYPES)[number];

export interface Candidate {
  id: string;
  label: string;
  description: string;
}

export interface ProfileLink {
  key: string;
  label: string;
  url: string;
  kind: "website" | "profile" | "reference";
  defaultChecked: boolean;
  note?: string;
}

export interface EntityProfile {
  id: string;
  label: string;
  description: string;
  website: string;
  links: ProfileLink[];
}

/* ------------------------------ request URLs ------------------------------ */

export function isValidQid(value: string): boolean {
  return /^Q\d{1,12}$/.test(value);
}

export function buildSearchUrl(term: string, language: string, limit = 7): string {
  const params = new URLSearchParams({
    action: "wbsearchentities",
    search: term.trim(),
    language,
    uselang: language,
    type: "item",
    limit: String(limit),
    format: "json",
    origin: "*",
  });
  return `${WIKIDATA_API}?${params.toString()}`;
}

export function buildEntityUrl(id: string, language: string): string {
  const languages = [...new Set([language, "en"])];
  const sitefilter = [...new Set([`${language}wiki`, "enwiki"])];
  const params = new URLSearchParams({
    action: "wbgetentities",
    ids: id,
    props: "labels|descriptions|claims|sitelinks",
    languages: languages.join("|"),
    sitefilter: sitefilter.join("|"),
    format: "json",
    origin: "*",
  });
  return `${WIKIDATA_API}?${params.toString()}`;
}

/* -------------------------------- parsing -------------------------------- */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseSearchResponse(json: unknown): Candidate[] {
  if (!isRecord(json) || !Array.isArray(json.search)) return [];
  const results: Candidate[] = [];
  for (const item of json.search) {
    if (!isRecord(item) || typeof item.id !== "string" || !isValidQid(item.id)) continue;
    results.push({
      id: item.id,
      label: typeof item.label === "string" && item.label ? item.label : item.id,
      description: typeof item.description === "string" ? item.description : "",
    });
  }
  return results;
}

interface PropertyDef {
  id: string;
  label: string;
  kind: ProfileLink["kind"];
  valuePattern: RegExp;
  toUrl: (value: string) => string;
  defaultChecked: boolean;
  note?: string;
}

const SAFE_ID = /^[A-Za-z0-9._-]{1,100}$/;

export const PROPERTIES: PropertyDef[] = [
  { id: "P2002", label: "X (Twitter)", kind: "profile", valuePattern: SAFE_ID, toUrl: (v) => `https://x.com/${v}`, defaultChecked: true },
  { id: "P2013", label: "Facebook", kind: "profile", valuePattern: SAFE_ID, toUrl: (v) => `https://www.facebook.com/${v}`, defaultChecked: true },
  { id: "P2003", label: "Instagram", kind: "profile", valuePattern: SAFE_ID, toUrl: (v) => `https://www.instagram.com/${v}/`, defaultChecked: true },
  { id: "P4264", label: "LinkedIn (company)", kind: "profile", valuePattern: SAFE_ID, toUrl: (v) => `https://www.linkedin.com/company/${v}/`, defaultChecked: true },
  { id: "P6634", label: "LinkedIn (person)", kind: "profile", valuePattern: SAFE_ID, toUrl: (v) => `https://www.linkedin.com/in/${v}/`, defaultChecked: true },
  { id: "P2397", label: "YouTube channel", kind: "profile", valuePattern: SAFE_ID, toUrl: (v) => `https://www.youtube.com/channel/${v}`, defaultChecked: true },
  { id: "P7085", label: "TikTok", kind: "profile", valuePattern: SAFE_ID, toUrl: (v) => `https://www.tiktok.com/@${v}`, defaultChecked: true },
  { id: "P2037", label: "GitHub", kind: "profile", valuePattern: SAFE_ID, toUrl: (v) => `https://github.com/${v}`, defaultChecked: true },
  { id: "P2088", label: "Crunchbase", kind: "reference", valuePattern: SAFE_ID, toUrl: (v) => `https://www.crunchbase.com/organization/${v}`, defaultChecked: true },
  {
    id: "P2671",
    label: "Google Knowledge Graph ID",
    kind: "reference",
    valuePattern: /^\/[gm]\/[A-Za-z0-9_]{1,40}$/,
    toUrl: (v) => `https://www.google.com/search?kgmid=${v}`,
    defaultChecked: false,
    note: "Optional. Only include if you're sure it matches.",
  },
];

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/** Returns usable string values for a claim list, preferred rank first, skipping deprecated statements. */
function claimStrings(claims: Record<string, unknown>, propertyId: string): string[] {
  const list = claims[propertyId];
  if (!Array.isArray(list)) return [];
  const ranked: { value: string; preferred: boolean }[] = [];
  for (const claim of list) {
    if (!isRecord(claim) || claim.rank === "deprecated") continue;
    const snak = claim.mainsnak;
    if (!isRecord(snak) || snak.snaktype !== "value" || !isRecord(snak.datavalue)) continue;
    const value = snak.datavalue.value;
    if (typeof value === "string" && value.trim()) ranked.push({ value: value.trim(), preferred: claim.rank === "preferred" });
  }
  ranked.sort((a, b) => Number(b.preferred) - Number(a.preferred));
  return ranked.map((item) => item.value);
}

function pickText(map: unknown, language: string): string {
  if (!isRecord(map)) return "";
  for (const code of [language, "en"]) {
    const entry = map[code];
    if (isRecord(entry) && typeof entry.value === "string" && entry.value) return entry.value;
  }
  return "";
}

export function wikipediaUrl(language: string, title: string): string {
  return `https://${language}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
}

export function parseEntityResponse(json: unknown, id: string, language: string): EntityProfile | null {
  if (!isRecord(json) || !isRecord(json.entities)) return null;
  const entity = json.entities[id];
  if (!isRecord(entity) || "missing" in entity) return null;

  const links: ProfileLink[] = [];
  const claims = isRecord(entity.claims) ? entity.claims : {};

  const websites = claimStrings(claims, "P856").filter(isHttpUrl);
  websites.forEach((url, index) => {
    links.push({
      key: `P856:${url}`,
      label: index === 0 ? "Official website" : "Another official website",
      url,
      kind: "website",
      defaultChecked: false,
      note: index === 0 ? "Used as the page's url, not repeated in sameAs." : undefined,
    });
  });

  const sitelinks = isRecord(entity.sitelinks) ? entity.sitelinks : {};
  const seenWiki = new Set<string>();
  for (const code of [language, "en"]) {
    const link = sitelinks[`${code}wiki`];
    if (isRecord(link) && typeof link.title === "string" && link.title && !seenWiki.has(code)) {
      seenWiki.add(code);
      links.push({
        key: `wikipedia:${code}`,
        label: `Wikipedia (${code})`,
        url: wikipediaUrl(code, link.title),
        kind: "reference",
        defaultChecked: true,
      });
    }
  }
  links.push({
    key: `wikidata:${id}`,
    label: "Wikidata",
    url: `https://www.wikidata.org/wiki/${id}`,
    kind: "reference",
    defaultChecked: true,
  });

  for (const property of PROPERTIES) {
    for (const value of claimStrings(claims, property.id)) {
      if (!property.valuePattern.test(value)) continue;
      links.push({
        key: `${property.id}:${value}`,
        label: property.label,
        url: property.toUrl(value),
        kind: property.kind,
        defaultChecked: property.defaultChecked,
        note: property.note,
      });
    }
  }

  return {
    id,
    label: pickText(entity.labels, language) || id,
    description: pickText(entity.descriptions, language),
    website: websites[0] ?? "",
    links,
  };
}

/* ------------------------------ manual links ------------------------------ */

export function parseManualUrls(text: string): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();
  for (const token of text.split(/[\s,]+/).filter(Boolean)) {
    if (!isHttpUrl(token)) {
      invalid.push(token);
      continue;
    }
    const href = new URL(token).href;
    if (!seen.has(href)) {
      seen.add(href);
      valid.push(href);
    }
  }
  return { valid, invalid };
}

/* -------------------------------- JSON-LD -------------------------------- */

export interface JsonLdInput {
  type: SchemaType;
  name: string;
  url: string;
  description: string;
  sameAs: string[];
}

export function buildJsonLd(input: JsonLdInput): Record<string, unknown> {
  const data: Record<string, unknown> = { "@context": "https://schema.org", "@type": input.type };
  const url = input.url.trim();
  if (isHttpUrl(url)) data["@id"] = `${new URL(url).origin}/#${input.type.toLowerCase()}`;
  if (input.name.trim()) data.name = input.name.trim();
  if (isHttpUrl(url)) data.url = new URL(url).href;
  if (input.description.trim()) data.description = input.description.trim();
  const sameAs = [...new Set(input.sameAs)];
  if (sameAs.length === 1) data.sameAs = sameAs[0];
  else if (sameAs.length > 1) data.sameAs = sameAs;
  return data;
}

/** Serialises JSON-LD safely for embedding in a <script> tag. */
export function serializeJsonLd(data: Record<string, unknown>, wrap: boolean): string {
  const json = JSON.stringify(data, null, 2).replace(/</g, "\\u003c");
  return wrap ? `<script type="application/ld+json">\n${json}\n</script>` : json;
}
