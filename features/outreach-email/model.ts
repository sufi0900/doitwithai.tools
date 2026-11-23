export type Purpose = "resource" | "broken-link" | "brand-mention";
export type Input = {
  purpose: Purpose;
  sourceUrl: string;
  context: string;
  resourceUrl: string;
  benefit: string;
  sender: string;
  recipient: string;
  pageTitle: string;
  brokenUrl: string;
  brand: string;
  tone: "direct" | "friendly";
  followUp: boolean;
};
export type Draft = {
  subject: string;
  subjects: string[];
  body: string;
  followUp: string;
};
export type Field = keyof Input;
export const defaults: Input = {
  purpose: "resource",
  sourceUrl: "",
  context: "",
  resourceUrl: "",
  benefit: "",
  sender: "",
  recipient: "",
  pageTitle: "",
  brokenUrl: "",
  brand: "",
  tone: "direct",
  followUp: false,
};
export const purposeNames: Record<Purpose, string> = {
  resource: "Resource suggestion",
  "broken-link": "Broken-link replacement",
  "brand-mention": "Unlinked brand mention",
};
export function webUrl(raw: string) {
  const url = new URL(
    /^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`,
  );
  if (
    !/^https?:$/.test(url.protocol) ||
    url.username ||
    url.password ||
    url.port ||
    !url.hostname.includes(".") ||
    /^(?:\d{1,3}\.){3}\d{1,3}$/.test(url.hostname) ||
    /\.(?:local|internal|localhost)$/.test(url.hostname)
  )
    throw Error(
      "Enter a public HTTP or HTTPS website URL without credentials or a custom port.",
    );
  url.hash = "";
  return url.href;
}
export function validate(input: Input) {
  const errors: Partial<Record<Field, string>> = {};
  if (!["resource", "broken-link", "brand-mention"].includes(input.purpose))
    errors.purpose = "Choose an outreach purpose.";
  for (const field of [
    "sourceUrl",
    "resourceUrl",
    ...(input.purpose === "broken-link" ? ["brokenUrl"] : []),
  ] as Field[]) {
    const value = String(input[field] ?? "");
    try {
      if (!value.trim() || value.length > 2048) throw Error();
      webUrl(value);
    } catch {
      errors[field] =
        "Enter a valid website URL, such as https://example.com/resources.";
    }
  }
  for (const [field, max, label] of [
    ["context", 600, "specific reference from the publisher page"],
    ["benefit", 400, "reader benefit"],
    ["sender", 100, "sender name"],
    ...(input.purpose === "brand-mention"
      ? [["brand", 100, "brand name"]]
      : []),
  ] as [Field, number, string][]) {
    const value = String(input[field] ?? "").trim();
    if (!value) errors[field] = `Add your ${label}.`;
    else if (value.length > max)
      errors[field] = `Keep this field within ${max} characters.`;
  }
  for (const field of ["recipient", "pageTitle"] as Field[])
    if (String(input[field]).length > 160)
      errors[field] = "Keep this field within 160 characters.";
  if (!["direct", "friendly"].includes(input.tone))
    errors.tone = "Choose a writing tone.";
  return errors;
}
const line = (value: string) =>
  value
    .replace(/[\u0000-\u001f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const end = (value: string) => (/[.!?]$/.test(value) ? value : value + ".");
export function buildDraft(input: Input): Draft {
  const errors = validate(input);
  if (Object.keys(errors).length)
    throw Error("Complete the highlighted fields before building a draft.");
  const source = webUrl(input.sourceUrl),
    resource = webUrl(input.resourceUrl),
    context = line(input.context),
    benefit = line(input.benefit),
    name = line(input.recipient),
    sender = line(input.sender),
    title = line(input.pageTitle) || "your resource page";
  const greeting = name ? `Hi ${name},` : "Hello,";
  const opener = `I’m writing about ${title}:\n${source}`;
  let request: string, subjects: string[];
  if (input.purpose === "broken-link") {
    const broken = webUrl(input.brokenUrl);
    request = `The link I’d like to flag is:\n${broken}\n\nIf it is still unavailable when you review it, would this resource fit as a replacement?\n${resource}\n\nFor your readers: ${end(benefit)}`;
    subjects = [
      `Possible link update for ${title}`,
      `Resource replacement to review`,
      `A reference on ${title}`,
    ];
  } else if (input.purpose === "brand-mention") {
    const brand = line(input.brand);
    request = `Regarding the mention of ${brand}, would a link to this page give readers useful context?\n${resource}\n\nFor your readers: ${end(benefit)}`;
    subjects = [
      `Reference for ${brand}`,
      `A link suggestion for ${title}`,
      `Context for your ${brand} mention`,
    ];
  } else {
    request = `Would this resource be useful alongside that section?\n${resource}\n\nFor your readers: ${end(benefit)}`;
    subjects = [
      `Resource suggestion for ${title}`,
      `A reference your readers may find useful`,
      `Suggested addition to ${title}`,
    ];
  }
  subjects = subjects.map((s) => s.replace(/[\r\n]/g, " ").slice(0, 160));
  const closing =
    input.tone === "friendly"
      ? "Thanks for considering it. Please use your judgment about whether it fits."
      : "Please consider it only if it fits the page’s purpose.";
  const body = [
    greeting,
    opener,
    `The specific reference:\n${end(context)}`,
    request,
    closing,
    `Thank you,\n${sender}`,
  ].join("\n\n");
  const followUp = input.followUp
    ? [
        greeting,
        `I’m following up on my earlier note about ${title}:\n${source}`,
        `The resource I suggested is:\n${resource}`,
        `For your readers: ${end(benefit)}`,
        "If this is not relevant, no further response is needed.",
        `Thank you,\n${sender}`,
      ].join("\n\n")
    : "";
  return { subject: subjects[0], subjects, body, followUp };
}
export function draftText(draft: Draft) {
  return `Subject: ${draft.subject.trim()}\n\n${draft.body.trim()}${draft.followUp.trim() ? `\n\n---\nOptional follow-up draft\nUse only after sending the first message.\n\n${draft.followUp.trim()}` : ""}\n`;
}
export const example: Input = {
  ...defaults,
  sourceUrl: "https://publisher.example/resources",
  context: "The spreadsheet section lists tools for planning article updates.",
  resourceUrl: "https://creator.example/content-refresh-template",
  benefit:
    "The editable worksheet helps readers record update tasks and review dates.",
  sender: "Alex",
  recipient: "Sam",
  pageTitle: "your content planning resources",
  followUp: true,
};
