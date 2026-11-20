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
const inputStyle = "block w-full rounded bg-slate-800 p-2";

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
    <section className="space-y-3 rounded-xl border border-slate-700 p-5">
      <h2 className="text-lg font-semibold">Editorial review queue</h2>
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
        <div>
          <strong>
            {review.payload.disposition.replace("_", " ")}{" "}
            {review.payload.total !== undefined &&
              "· " + review.payload.total + "/100"}
          </strong>
          <p>
            {Object.entries(review.payload.scores || {})
              .map(([key, n]) => key + " " + n)
              .join(" · ")}
          </p>
          <p className="whitespace-pre-wrap">{review.payload.feedback}</p>
          <details>
            <summary>Reviewed article</summary>
            <h3>{snapshot?.title}</h3>
            <p>{snapshot?.metaDescription}</p>
            <p className="whitespace-pre-wrap">
              {snapshot?.compiledMarkdownBody}
            </p>
          </details>
          {review.payload.disposition === "human_review" && (
            <button
              disabled={busy}
              onClick={() => submit({ action: "approve", reviewId: review.id })}
            >
              Sign off on this article for release
            </button>
          )}
          {review.payload.disposition === "approved" && choices.length>0 && (<div className="space-y-2">
            <label>Delivery destination <select className={inputStyle} value={selectedId} onChange={e=>{setDestination(e.target.value as CmsPlatformId);setLive(false);}}>{choices.map(c=><option key={c}>{c}</option>)}</select></label>
            <label className="block"><input type="checkbox" checked={live} onChange={e=>setLive(e.target.checked)}/> Request live publication</label>
            <button
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
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            submit({
              workId: work.id,
              draft: Object.fromEntries(new FormData(event.currentTarget)),
            });
          }}
        >
          <label>
            Page title
            <input
              className={inputStyle}
              name="title"
              required
              defaultValue={snapshot?.title}
              maxLength={60}
            />
          </label>
          <label>
            Slug
            <input
              className={inputStyle}
              name="slug"
              required
              defaultValue={snapshot?.slug}
            />
          </label>
          <label>
            Meta description
            <textarea
              className={inputStyle}
              name="description"
              required
              defaultValue={snapshot?.metaDescription}
              maxLength={160}
            />
          </label>
          <label>
            Article text
            <textarea
              className={inputStyle}
              name="body"
              rows={9}
              required
              defaultValue={snapshot?.compiledMarkdownBody || work.result}
            />
          </label>
          <button className="rounded bg-blue-700 px-4 py-2" disabled={busy}>
            {busy ? "Reviewing…" : "Run quality checks"}
          </button>
        </form>
      )}
      <p role="status" className="whitespace-pre-wrap">
        {notice}
      </p>
    </section>
  );
}
