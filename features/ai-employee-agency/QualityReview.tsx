"use client";

import { useEffect, useState } from "react";
import { agencyRequest } from "./agency-request";
import { loadCmsConnectionConfig,type CmsConnectionConfig,type CmsPlatformId } from "@/lib/ai-employee-agency/cms-connectors";

type Work = { id: string; task: string; result: string };
type Review = {
  id: string;
  payload: {
    workId: string;
    revision: number;
    disposition: string;
    total?: number;
    scores?: Record<string, number>;
    feedback: string;
    article: {
      title: string;
      slug: string;
      metaDescription: string;
      compiledMarkdownBody: string;
    };
  };
};
const endpoint = "/api/ai-employee-agency/quality";
const inputStyle =
  "block w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none";

export function QualityReview({
  domain,
  revision,internal=false,
}: {
  internal?: boolean;
  domain: string;
  revision: number;
}) {
  const [destinations,setDestinations]=useState<CmsPlatformId[]>([]),[destination,setDestination]=useState<CmsPlatformId>(),[live,setLive]=useState(false);
  const [works, setWorks] = useState<Work[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selected, setSelected] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  async function refresh() {
    const response = await agencyRequest(endpoint);
    const data = await response.json();
    if (!response.ok) throw Error(data.error);
    setDestinations(data.destinations || []);
    setWorks(data.works);
    setReviews(data.reviews);
  }
  useEffect(() => {
    refresh().catch((err) => setNotice(err.message));
  }, []);
  async function submit(body: unknown, url = endpoint) {
    setBusy(true);
    setNotice("");
    try {
      const response = await agencyRequest(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error);
      setNotice(data.diagnosticMessage || "Review saved.");
      await refresh();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  }
  const work = works.find((w) => w.id === selected);
  const review = reviews.find(
    (r) => r.payload.workId === selected && r.payload.revision === revision,
  );
  const snapshot = review?.payload.article;
  const stored = loadCmsConnectionConfig(domain,false);
  const local=stored.siteUrl.replace(/\/$/,'')===domain.replace(/\/$/,'') ? stored:undefined;
  const choices=Array.from(new Set<CmsPlatformId>([...(internal?['internal-doitwithai' as const]:[]),...destinations,...(local?[local.platformId]:[])]));
  const selectedId=destination || choices[0];
  const config:CmsConnectionConfig={...(local?.platformId===selectedId?local:{}),platformId:selectedId,siteUrl:domain,autoPublishMode:live?'auto-publish-live':'stage-as-draft'};
  return (
    <section className="space-y-4 rounded-xl border border-slate-800 bg-[#111827] p-5">
      <div className="border-b border-slate-800 pb-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
          Editorial QA &amp; Delivery
        </p>
        <h2 className="text-base font-semibold text-white">Editorial review queue</h2>
      </div>
      <select
        aria-label="Writer draft"
        className={inputStyle}
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        disabled={busy}
      >
        <option value="">
          {works.length
            ? "Choose a writer draft"
            : "No writer drafts available"}
        </option>
        {works.map((w) => (
          <option key={w.id} value={w.id}>
            {w.task}
          </option>
        ))}
      </select>
      {review && (
        <div className="space-y-3 rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <strong className="text-sm font-semibold capitalize text-white">
              {review.payload.disposition.replace("_", " ")}{" "}
              {review.payload.total !== undefined &&
                "· " + review.payload.total + "/100"}
            </strong>
          </div>
          <p className="break-words font-mono text-xs text-slate-400">
            {Object.entries(review.payload.scores || {})
              .map(([key, n]) => key + " " + n)
              .join(" · ")}
          </p>
          <p className="break-words whitespace-pre-wrap text-sm text-slate-300">{review.payload.feedback}</p>
          <details className="rounded-lg border border-slate-800 bg-[#111827] p-3 text-xs">
            <summary className="cursor-pointer font-medium text-slate-200">Reviewed article</summary>
            <div className="mt-2.5 max-h-96 space-y-2 overflow-y-auto break-words border-t border-slate-800 pt-2.5">
              <h3 className="text-sm font-semibold text-white">{snapshot?.title}</h3>
              <p className="text-slate-400">{snapshot?.metaDescription}</p>
              <p className="whitespace-pre-wrap text-slate-300">
                {snapshot?.compiledMarkdownBody}
              </p>
            </div>
          </details>
          {review.payload.disposition === "human_review" && (
            <button
              type="button"
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
              disabled={busy}
              onClick={() => submit({ action: "approve", reviewId: review.id })}
            >
              Sign off on this article for release
            </button>
          )}
          {review.payload.disposition === "approved" && choices.length>0 && (<div className="space-y-3 border-t border-slate-800 pt-3">
            <label className="block space-y-1.5 text-xs font-medium text-slate-300">
              <span>Delivery destination</span>
              <select className={inputStyle} value={selectedId} onChange={e=>{setDestination(e.target.value as CmsPlatformId);setLive(false);}}>{choices.map(c=><option key={c}>{c}</option>)}</select>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input type="checkbox" checked={live} onChange={e=>setLive(e.target.checked)}/>
              <span>Request live publication</span>
            </label>
            <button
              type="button"
              className="w-full break-words rounded-lg bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50 sm:w-auto"
              disabled={busy}
              onClick={() =>
                submit(
                  { reviewId: review.id, config },
                  "/api/ai-employee-agency/publish-cms",
                )
              }
            >
              Send to {config.platformId} · {config.siteUrl} ·{" "}
              {config.autoPublishMode}
            </button></div>
          )}
        </div>
      )}
      {work && (!review || review.payload.disposition === "revision") && (
        <form
          key={work.id + (review?.id || "")}
          className="space-y-3 rounded-xl border border-slate-800 bg-[#0B0F17] p-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit({
              workId: work.id,
              draft: Object.fromEntries(new FormData(event.currentTarget)),
            });
          }}
        >
          <label className="block space-y-1.5 text-xs font-medium text-slate-300">
            <span>Page title</span>
            <input
              className={inputStyle}
              name="title"
              required
              defaultValue={snapshot?.title}
              maxLength={60}
            />
          </label>
          <label className="block space-y-1.5 text-xs font-medium text-slate-300">
            <span>Slug</span>
            <input
              className={inputStyle}
              name="slug"
              required
              defaultValue={snapshot?.slug}
            />
          </label>
          <label className="block space-y-1.5 text-xs font-medium text-slate-300">
            <span>Meta description</span>
            <textarea
              className={inputStyle}
              name="description"
              required
              defaultValue={snapshot?.metaDescription}
              maxLength={160}
            />
          </label>
          <label className="block space-y-1.5 text-xs font-medium text-slate-300">
            <span>Article text</span>
            <textarea
              className={inputStyle}
              name="body"
              rows={9}
              required
              defaultValue={snapshot?.compiledMarkdownBody || work.result}
            />
          </label>
          <button
            className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            disabled={busy}
          >
            {busy ? "Reviewing…" : "Run quality checks"}
          </button>
        </form>
      )}
      {notice && (
        <p role="status" className="break-words whitespace-pre-wrap text-xs text-slate-300">
          {notice}
        </p>
      )}
    </section>
  );
}
