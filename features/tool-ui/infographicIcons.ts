import type { InfographicIconId } from "./EditableInfographicStudio";

export function inferNodeIcon(text: string, idx: number): InfographicIconId {
  const lower = text.toLowerCase();
  if (/launch|scale|fast|boost|deploy|start|publish/.test(lower))
    return "rocket";
  if (/target|intent|keyword|focus|goal|niche/.test(lower)) return "target";
  if (/ai|llm|gpt|prompt|automat|generat/.test(lower)) return "sparkles";
  if (/stat|metric|roi|traffic|growth|revenue|chart|rank/.test(lower))
    return "chart";
  if (/audit|trust|safe|protect|compliance|verify|eeat/.test(lower))
    return "shield";
  if (/seo|search|web|domain|url|global|link/.test(lower)) return "globe";
  if (/plan|think|strateg|research|analy|framework/.test(lower)) return "brain";
  if (/cluster|pillar|structure|schema|hub|layer/.test(lower)) return "layers";
  if (/speed|instant|quick|hook|viral|short/.test(lower)) return "zap";
  if (/win|top|best|leader|authority|award/.test(lower)) return "trophy";
  if (/check|list|step|test|review|fix/.test(lower)) return "check";
  if (/user|audience|customer|client|team|community/.test(lower))
    return "users";
  if (/lead|convert|funnel|cta|click|subscribe/.test(lower)) return "magnet";
  if (/workflow|process|system|tool|build|pipeline/.test(lower)) return "gear";
  if (/pr|outreach|share|social|distribute|repurpose/.test(lower))
    return "megaphone";
  if (/data|benchmark|evidence|fact|study|source/.test(lower))
    return "database";
  const fallbackPool: InfographicIconId[] = [
    "rocket",
    "target",
    "brain",
    "chart",
    "layers",
    "zap",
    "megaphone",
    "trophy",
  ];
  return fallbackPool[idx % fallbackPool.length];
}
