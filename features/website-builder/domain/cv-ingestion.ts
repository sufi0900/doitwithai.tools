import { z } from "zod";
import { approvedCvFactSchema, cvFactKindOptions } from "./site-document";

export const MAX_CV_BYTES = 5 * 1024 * 1024;
export const acceptedCvTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"] as const;

export const cvCandidateSchema = approvedCvFactSchema.extend({ kind: z.enum(cvFactKindOptions), confidence: z.enum(["high", "medium", "low"]) });
export const cvExtractionSchema = z.object({
  sourceId: z.string().min(1),
  fileName: z.string().min(1),
  mediaType: z.string().min(1),
  originalStored: z.literal(false),
  engine: z.enum(["local", "ai-hybrid"]),
  notice: z.string().max(240).optional(),
  diagnosticCode: z.enum(["not_configured", "authentication", "rate_limited", "request_rejected", "timeout", "incomplete_response", "invalid_response", "ungrounded_response", "provider_unavailable"]).optional(),
  candidates: z.array(cvCandidateSchema).max(40),
});
export type CvCandidate = z.infer<typeof cvCandidateSchema>;

const sectionHeadings = new Set([
  "summary", "executive summary", "professional summary", "career summary", "career profile", "profile", "professional profile", "personal profile", "professional overview", "overview", "objective", "about", "about me", "introduction", "bio",
  "skills", "technical skills", "core skills", "competencies", "expertise", "education", "academic background", "qualifications",
  "experience", "work experience", "employment history", "professional experience", "projects", "certifications", "awards", "languages",
  "contact", "contact details", "reference", "references", "what makes me unique", "interests", "achievements",
]);
const roleWords = /\b(engineer|developer|designer|writer|specialist|strategist|consultant|manager|director|analyst|researcher|architect|marketer|scientist|founder|lead|officer|administrator|producer|editor|coordinator|executive|accountant|teacher|professor|recruiter|sales|seo|product|content|software|data|web|ux|ui)\b/i;
const actionStart = /^(built|managed|led|created|developed|designed|produced|collaborated|reviewed|conducted|contributed|implemented|planned|monitored|extended|uses|approaches|builds|worked|responsible)\b/i;

function clean(value: string) {
  const compact = value.replace(/\s+/g, " ").replace(/^[•·▪●\-*]+\s*/, "").trim();
  const letters = compact.split(" ");
  return letters.length >= 4 && letters.every((part) => /^[A-Za-z]$/.test(part)) ? letters.join("") : compact;
}
function key(value: string) { return clean(value).toLowerCase().replace(/[^a-z0-9&]+/g, " ").trim(); }
function isHeading(value: string) { return sectionHeadings.has(key(value)); }
function isContact(value: string) { return /@|https?:|www\.|linkedin(?:\.com)?|github(?:\.com)?|\b[a-z0-9-]+\.(?:com|net|org|io|dev|ai|co)\b|\+?\d[\d\s().-]{7,}/i.test(value); }
function excerpt(value: string) { return clean(value).slice(0, 320); }
function candidate(kind: CvCandidate["kind"], value: string, sourceExcerpt: string, confidence: CvCandidate["confidence"]): CvCandidate {
  return { id: crypto.randomUUID(), kind, value: clean(value).slice(0, kind === "skill" ? 32 : 220), sourceExcerpt: excerpt(sourceExcerpt), confidence };
}

function nameScore(line: string, index: number) {
  if (isHeading(line) || isContact(line) || roleWords.test(line) || /\d|[|:]/.test(line)) return -1;
  const words = line.split(/\s+/);
  if (words.length < 2 || words.length > 5 || line.length > 60 || !words.every((word) => /^[A-Za-zÀ-ž.'’-]+$/.test(word))) return -1;
  if (/\b(street|road|zone|city|capital|territory|province|county|pakistan|india|university|college|school)\b/i.test(line)) return -1;
  let score = Math.max(0, 4 - index / 15);
  if (line === line.toUpperCase()) score += 4;
  if (words.every((word) => /^[A-ZÀ-Þ]/.test(word))) score += 2;
  return score;
}

function roleScore(line: string, index: number, nameIndex: number) {
  if (isHeading(line) || isContact(line) || !roleWords.test(line) || line.length > 100 || /[.!?]$/.test(line)) return -1;
  let score = 4;
  if (line === line.toUpperCase()) score += 3;
  if (Math.abs(index - nameIndex) <= 3) score += 4;
  if (/\b(at|for)\b|[|—–]/i.test(line)) score -= 2;
  if (/^(founder|content writer at|seo\s*&\s*content writer\s*[—–])/i.test(line)) score -= 2;
  return score;
}

function proseBlocks(lines: string[]) {
  const blocks: string[][] = [];
  let current: string[] = [];
  const flush = () => { if (current.join(" ").length >= 80) blocks.push(current); current = []; };
  for (const line of lines) {
    const prose = line.length >= 38 && !isHeading(line) && !isContact(line) && !/^[-–—]?\s*(?:19|20)\d{2}\b/.test(line);
    if (!prose) { flush(); continue; }
    current.push(line);
  }
  flush();
  return blocks;
}
function summaryScore(value: string) {
  let score = 0;
  if (/\b(?:professional|specialist|writer|developer|designer|engineer|consultant)\b/i.test(value)) score += 3;
  if (/\b(?:experience|expertise|skilled|background|track record)\b/i.test(value)) score += 4;
  if (/\b(?:years?|markets?|industr(?:y|ies)|strategy|end-to-end)\b/i.test(value)) score += 1;
  if (actionStart.test(value)) score -= 4;
  if (/\b(?:Apr|Jan|Feb|Mar|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b|\b20\d{2}\b/.test(value)) score -= 3;
  return score;
}

function adjacentSummary(lines: string[]) {
  const start = lines.findIndex((line) => /^(summary|executive summary|professional summary|career summary|career profile|profile|professional profile|personal profile|professional overview|overview|objective|about|about me|introduction|bio)$/i.test(key(line)));
  if (start < 0) return null;
  const collected: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (isHeading(line)) break;
    collected.push(line);
  }
  const value = clean(collected.join(" "));
  return value.length >= 20 && value.length <= 600 ? value : null;
}

function extractSkills(lines: string[]) {
  const start = lines.findIndex((line) => /^(skills|technical skills|core skills|competencies|expertise)$/i.test(key(line)));
  if (start < 0) return [];
  const endOffset = lines.slice(start + 1).findIndex((line) => isHeading(line));
  const end = endOffset < 0 ? Math.min(lines.length, start + 30) : start + 1 + endOffset;
  const raw = lines.slice(start + 1, end)
    .filter((line) => !isContact(line) && !/available|request|portfolio|documentation/i.test(line))
    .flatMap((line) => line.split(/[,;•·|]/).map(clean))
    .filter((line) => line.length >= 2 && line.length <= 48);
  const merged: string[] = [];
  for (let index = 0; index < raw.length; index += 1) {
    const line = raw[index];
    if ((/&$/.test(line) || /^(?:Architecture|Auditing|Analysis|Optimization|Strategy|Development|Reporting|Building)$/i.test(raw[index + 1] ?? "")) && raw[index + 1]) { merged.push(`${line} ${raw[index + 1]}`); index += 1; }
    else merged.push(line);
  }
  return [...new Set(merged.map(clean).filter((item) => item.length <= 32))].slice(0, 8);
}

export function extractCvCandidates(rawText: string): CvCandidate[] {
  const lines = rawText.split(/\r?\n/).map(clean).filter(Boolean).slice(0, 800);
  if (!lines.length) return [];
  const result: CvCandidate[] = [];
  const rankedNames = lines.map((line, index) => ({ line, index, score: nameScore(line, index) })).filter((item) => item.score >= 0).sort((a, b) => b.score - a.score);
  const name = rankedNames[0];
  if (name) result.push(candidate("name", name.line, name.line, name.score >= 7 ? "high" : "medium"));
  const rankedRoles = lines.map((line, index) => ({ line, index, score: roleScore(line, index, name?.index ?? -100) })).filter((item) => item.score >= 0).sort((a, b) => b.score - a.score);
  const role = rankedRoles[0];
  if (role) result.push(candidate("role", role.line, role.line, role.score >= 7 ? "high" : "medium"));
  const directSummary = adjacentSummary(lines);
  const summaries = proseBlocks(lines).map((block) => ({ value: clean(block.join(" ")), score: summaryScore(block.join(" ")) })).sort((a, b) => b.score - a.score);
  const summary = directSummary ?? summaries[0]?.value;
  const score = directSummary ? summaryScore(directSummary) + 2 : summaries[0]?.score ?? -1;
  if (summary && score >= 2) result.push(candidate("intro", summary, summary, score >= 6 ? "high" : "medium"));
  for (const skill of extractSkills(lines)) result.push(candidate("skill", skill, skill, "medium"));
  const educationLines = lines.filter((line) => /\b(?:associate|bachelor|master|doctor|ph\.?d|diploma|degree|b\.?sc|m\.?sc|mba)\b/i.test(line) && !isHeading(line));
  for (const line of educationLines.slice(0, 4)) {
    const index = lines.indexOf(line);
    const institution = lines[index + 1] && /university|college|school|institute|academy/i.test(lines[index + 1]) ? ` — ${lines[index + 1]}` : "";
    result.push(candidate("education", `${line}${institution}`, `${line}${institution}`, "high"));
  }
  const experienceLines = lines.filter((line) => roleWords.test(line) && /\b(?:at|founder|lead|manager|director)\b|[—–|]/i.test(line) && !isHeading(line) && !isContact(line) && line !== role?.line);
  for (const line of experienceLines.slice(0, 4)) result.push(candidate("experience", line, line, "medium"));
  return result.slice(0, 40);
}
