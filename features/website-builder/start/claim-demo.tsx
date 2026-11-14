"use client";

import { authorizedWebsiteFetch } from "@/features/website-builder/lib/supabase/browser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { siteDocumentSchema, type SiteDocument } from "@/features/website-builder/domain/site-document";

const STORAGE_KEY = "voxfolio-demo-document-v1";
const accents = { cyan: "#4deeea", violet: "#a78bfa", coral: "#fb7185", lime: "#a3e635", rose: "#d94c89", blue: "#75aaff", olive: "#78834b", indigo: "#6366f1" };

export function ClaimDemo({ email }: { email: string }) {
  const router = useRouter();
  const [document, setDocument] = useState<SiteDocument | null>(null);
  const [projectName, setProjectName] = useState("My DoItWithAI website");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const parsed = siteDocumentSchema.safeParse(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"));
      if (parsed.success) { setDocument(parsed.data); setProjectName(`${parsed.data.identity.name} — Portfolio`); }
    } catch { setDocument(null); }
  }, []);

  async function save() {
    if (!document) return;
    setBusy(true); setError("");
    const response = await authorizedWebsiteFetch("/api/projects", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode: "demo", projectName, document }) });
    const result = await response.json(); setBusy(false);
    if (!response.ok) return setError(result.error ?? "Could not save this portfolio.");
    localStorage.removeItem(STORAGE_KEY);
    router.replace(`/do-it-ai/website-studio/${result.projectId}`); router.refresh();
  }

  return <main className="website-builder-scope flow-page"><header className="flow-nav"><Link href="/ai-website-builder">← Back to Website Builder</Link><strong>DOITWITHAI STUDIO</strong><Link href="/do-it-ai">My workspace</Link></header>
    <section className="claim-card"><p className="eyebrow">SAVE YOUR GUEST PORTFOLIO</p><h1>Move this draft into your workspace</h1><p>Signed in as {email}. Your local portfolio will become a private cloud project. You can review it in Studio before publishing.</p>
      {document ? <><div className="claim-summary"><span style={{ background: accents[document.design.accent] }} /><div><strong>{document.identity.name}</strong><small>{document.identity.role}</small></div><em>{document.skills.length} skills · revision {document.revision}</em></div>
        <label>Project name<input value={projectName} maxLength={80} onChange={(event) => setProjectName(event.target.value)} /></label>
        {error && <div className="form-message">{error}</div>}<button type="button" className="primary-action" disabled={busy || !projectName.trim()} onClick={save}>{busy ? "Saving…" : "Save and continue to Studio"}</button></> : <div className="claim-empty"><h2>No guest draft was found</h2><p>Return to the live studio demo, customize your website, then choose Save & publish.</p><Link className="primary-action" href="/do-it-ai/website-studio/demo">Open interactive demo</Link></div>}
    </section>
  </main>;
}
