import { specialists, type Specialist } from "./specialists";

export const channels = [
  { id: "pinterest", label: "Pinterest" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "facebook", label: "Facebook" },
  { id: "video", label: "TikTok & Reels" },
] as const;

export const socialHub = "Social & Video Hub";
export const visualStudio = "Visual & Brand Studio";
export const panelAgents: Record<string, Specialist["id"] | "chief"> = {
  Overview: "chief",
  "Agency Calendar": "chief",
  "Keyword & Topics": "keywords",
  "Article Studio": "writer",
  [visualStudio]: "visual",
  "Technical Site Audit": "technical",
  "On-Page & Refresh": "refresh",
  "AI Visibility & Links": "pr",
  "QA & Auto-Publish": "qa",
  "Agent Skills & Cron": "chief",
  "Token & API Usage": "chief",
  Pinterest: "pinterest",
  LinkedIn: "linkedin",
  Facebook: "facebook",
  "TikTok & Reels": "video",
};
export function agentName(id: string) {
  return (
    specialists.find((s) => s.id === id)?.name ||
    (id === "chief" ? "Chief AI Officer" : "Workspace Copilot")
  );
}
export function commercialLabel(id: string, label: string) {
  if (id === "nav-social") return socialHub;
  if (id === "nav-visuals") return visualStudio;
  if (id === "nav-onpage") return "On-Page & Refresh";
  return label;
}
