"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  CheckCheck,
  Download,
  FileUp,
  Link2,
  Loader2,
  Search,
  ShieldCheck,
  Square,
  Trash2,
} from "lucide-react";
import {
  comparison,
  exampleHtml,
  importSourceCsv,
  inputUrl,
  readSavedRun,
  reportCsv,
  settingsKey,
  sourceList,
} from "./io";
import {
  defaultOptions,
  labels,
  type Options,
  type Report,
  type SavedRun,
} from "./types";
import styles from "./backlinks.module.css";
import ToolUrlInput from "../tool-ui/ToolUrlInput";

const key = "doitwithai.backlink-baseline.v1";
function download(text: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function BacklinkClient() {
  const [options, setOptions] = useState<Options>(defaultOptions),
    [sources, setSources] = useState("");
  const [mode, setMode] = useState<"live" | "pasted">("live"),
    [html, setHtml] = useState("");
  const [reports, setReports] = useState<Report[]>([]),
    [runOptions, setRunOptions] = useState<Options>(defaultOptions);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const [filter, setFilter] = useState("all"),
    [search, setSearch] = useState(""),
    [planned, setPlanned] = useState(0);
  const [baseline, setBaseline] = useState<SavedRun | null>(null),
    [isExample, setIsExample] = useState(false);
  const controller = useRef<AbortController | null>(null),
    file = useRef<HTMLInputElement>(null),
    results = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) setBaseline(readSavedRun(saved));
    } catch {
      /* Optional storage can be unavailable. */
    }
    return () => controller.current?.abort();
  }, []);
  const change = (field: keyof Options, value: string | boolean) =>
    setOptions((prev) => ({ ...prev, [field]: value }));
  const comparable =
    !!baseline && settingsKey(baseline.options) === settingsKey(runOptions);
  const filtered = reports.filter(
    (r) =>
      (filter === "all" || r.status === filter) &&
      (
        r.sourceUrl +
        " " +
        r.title +
        " " +
        r.links.map((l) => l.anchor).join(" ")
      )
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  async function run(example = false) {
    if (busy) return;
    setError("");
    setMessage("");
    setFilter("all");
    setSearch("");
    let urls: string[], submitted: Options;
    const evidence = example ? "pasted" : mode;
    try {
      submitted = example
        ? {
            ...defaultOptions,
            target: "https://example.com/guide",
            mode: "page",
            expectedAnchor: "Example guide",
            expectedRel: "unqualified",
          }
        : { ...options, target: inputUrl(options.target) };
      urls = example
        ? ["https://publisher.example/resources"]
        : sourceList(sources);
      if (
        evidence === "pasted" &&
        (urls.length !== 1 || !(example ? exampleHtml : html).trim())
      )
        throw new Error(
          "Pasted HTML needs one source URL and the HTML to inspect.",
        );
      if (evidence === "pasted" && html.length > 750000)
        throw new Error("Keep pasted HTML below 750,000 characters.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Check your inputs.");
      return;
    }
    if (example) {
      setOptions(submitted);
      setSources(urls.join("\n"));
      setHtml(exampleHtml);
      setMode("pasted");
    }
    setIsExample(example);
    setRunOptions(submitted);
    setPlanned(urls.length);
    setReports([]);
    setBusy(true);
    const abort = new AbortController();
    controller.current = abort;
    let completed = 0;
    try {
      for (let i = 0; i < urls.length; i += 5) {
        const response = await fetch("/api/ai-tools/backlink-verifier", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abort.signal,
          body: JSON.stringify({
            ...submitted,
            sources: urls.slice(i, i + 5),
            ...(evidence === "pasted"
              ? { html: example ? exampleHtml : html }
              : {}),
          }),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok || !Array.isArray(data?.reports))
          throw new Error(
            data?.error?.message ||
              "The batch could not be checked. Try again later.",
          );
        completed += data.reports.length;
        setReports((prev) => [...prev, ...data.reports]);
        setMessage(`${completed} of ${urls.length} source pages checked.`);
      }
      setMessage(
        example
          ? "Example complete. This supplied HTML contains three links. No external websites were fetched."
          : `${completed} source pages checked. Review the evidence and export your results.`,
      );
    } catch (e) {
      if (abort.signal.aborted)
        setMessage(
          `Stopped after ${completed} of ${urls.length} pages. Remaining pages were not checked.`,
        );
      else
        setError(
          `${e instanceof Error ? e.message : "The request failed."} ${completed} of ${urls.length} pages completed. Remaining pages were not checked.`,
        );
    } finally {
      controller.current = null;
      setBusy(false);
    }
  }
  async function importFile(selected?: File) {
    if (!selected) return;
    try {
      if (selected.size > 250000)
        throw new Error("Use a CSV smaller than 250 KB.");
      const urls = importSourceCsv(await selected.text());
      setSources(urls.join("\n"));
      setMessage(
        `${urls.length} unique source URLs imported. Review them before checking.`,
      );
      setError("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "This CSV could not be imported.",
      );
    }
    if (file.current) file.current.value = "";
  }
  function saveBaseline() {
    const value: SavedRun = {
      version: 1,
      options: runOptions,
      reports,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setBaseline(value);
      setMessage(
        "Baseline saved in this browser. Run a new check to compare observed changes.",
      );
    } catch {
      setError(
        "This browser could not save the baseline. Export your results instead.",
      );
    }
  }
  function clearBaseline() {
    try {
      localStorage.removeItem(key);
      setBaseline(null);
      setMessage("Saved baseline removed.");
    } catch {
      setError("The saved baseline could not be removed from browser storage.");
    }
  }
  return (
    <section
      className={styles.workspace}
      aria-label="Backlink verification workspace"
      id="backlink-checker"
    >
      <div className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>CHECK THE EVIDENCE</p>
          <h2>Is your backlink still there?</h2>
          <p>
            Bring the pages that should link to you. We check their HTML and
            show what we can verify.
          </p>
        </div>
        <span className={styles.badge}>
          <ShieldCheck size={16} aria-hidden /> Manual verification
        </span>
      </div>
      <div className={styles.layout}>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            void run();
          }}
        >
          <fieldset disabled={busy}>
            <legend className={styles.srOnly}>Backlink check settings</legend>
            <div
              className={styles.switcher}
              role="group"
              aria-label="Evidence method"
            >
              <button
                type="button"
                aria-pressed={mode === "live"}
                onClick={() => setMode("live")}
              >
                Live page checks
              </button>
              <button
                type="button"
                aria-pressed={mode === "pasted"}
                onClick={() => setMode("pasted")}
              >
                Paste HTML
              </button>
            </div>
            <label className={styles.label}>
              Your target website or page
              <ToolUrlInput
                type="text"
                inputMode="url"
                autoComplete="url"
                value={options.target}
                maxLength={2048}
                onChange={(e) => change("target", e.target.value)}
                placeholder="https://yourwebsite.com/guide"
                required
              />
            </label>
            <p className={styles.help}>
              This is your website, not the page that should contain the link.
            </p>
            <label className={styles.label}>
              What should the link match?
              <select
                value={options.mode}
                onChange={(e) => change("mode", e.target.value)}
              >
                <option value="domain">Any page on this domain</option>
                <option value="page">This exact page URL</option>
              </select>
            </label>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={options.includeSubdomains}
                onChange={(e) => change("includeSubdomains", e.target.checked)}
              />{" "}
              Include subdomains when matching domains
            </label>
            <p className={styles.help}>
              Domain matching groups the root host and www. Exact-page matching
              preserves protocol, path, and query.
            </p>
            <label className={styles.label}>
              Pages that should link to you
              <textarea
                value={sources}
                onChange={(e) => setSources(e.target.value)}
                rows={6}
                maxLength={110000}
                placeholder={
                  "https://publisher.com/article\nhttps://resources.com/useful-links"
                }
                required
              />
            </label>
            <div className={styles.imports}>
              <button type="button" onClick={() => file.current?.click()}>
                <FileUp size={15} aria-hidden /> Import source CSV
              </button>
              <button
                type="button"
                onClick={() =>
                  download(
                    "Source URL\r\nhttps://publisher.example/article\r\n",
                    "backlink-source-template.csv",
                    "text/csv",
                  )
                }
              >
                CSV template
              </button>
            </div>
            <input
              ref={file}
              className={styles.srOnly}
              type="file"
              accept=".csv,text/csv"
              aria-label="Import source URLs"
              onChange={(e) => void importFile(e.target.files?.[0])}
            />
            <p className={styles.help}>
              {mode === "live"
                ? "Up to 50 unique source pages. Large lists run in batches of five."
                : "Use one source URL so relative links resolve correctly."}
            </p>
            {mode === "pasted" && (
              <label className={styles.label}>
                Source page HTML
                <textarea
                  className={styles.codeInput}
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  rows={7}
                  maxLength={750000}
                  placeholder="Paste the page HTML here"
                  required
                />
                <span className={styles.help}>
                  Supplied HTML is parsed without opening its scripts or links.
                </span>
              </label>
            )}
            <details className={styles.advanced}>
              <summary>Optional link expectations</summary>
              <label className={styles.label}>
                Expected anchor text
                <input
                  value={options.expectedAnchor}
                  onChange={(e) => change("expectedAnchor", e.target.value)}
                  maxLength={300}
                  placeholder="Leave blank to accept any anchor"
                />
              </label>
              <label className={styles.label}>
                Expected relationship
                <select
                  value={options.expectedRel}
                  onChange={(e) => change("expectedRel", e.target.value)}
                >
                  <option value="any">Any relationship</option>
                  <option value="unqualified">
                    No nofollow, sponsored, or ugc qualification
                  </option>
                  <option value="nofollow">nofollow</option>
                  <option value="sponsored">sponsored</option>
                  <option value="ugc">ugc</option>
                </select>
              </label>
              <p className={styles.help}>
                Anchor matching ignores letter case and repeated spaces. A
                difference is a review item, not an SEO verdict.
              </p>
            </details>
            <div className={styles.actions}>
              <button type="submit" className={styles.primary}>
                <Search size={17} aria-hidden />
                {mode === "pasted"
                  ? "Inspect supplied HTML"
                  : "Verify backlinks"}
              </button>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => void run(true)}
              >
                Try an example
              </button>
            </div>
          </fieldset>
          {busy && (
            <div className={styles.progress}>
              <Loader2 size={18} className={styles.spin} aria-hidden />
              <span>
                Checking {reports.length} of {planned} source pages…
              </span>
              <button type="button" onClick={() => controller.current?.abort()}>
                <Square size={14} aria-hidden /> Stop
              </button>
            </div>
          )}
        </form>
        <aside className={styles.explainer}>
          <span className={styles.icon}>
            <Link2 aria-hidden />
          </span>
          <h3>A useful answer, with proof</h3>
          <ol>
            <li>
              <strong>Confirm the placement</strong>
              <span>
                See each matching link, its anchor, surrounding text, and page
                section.
              </span>
            </li>
            <li>
              <strong>Review what changed</strong>
              <span>
                Compare a new check with a baseline you saved on this device.
              </span>
            </li>
            <li>
              <strong>Decide the next step</strong>
              <span>
                Export the evidence before contacting a publisher or updating
                your records.
              </span>
            </li>
          </ol>
          <div className={styles.boundary}>
            <strong>What this check can establish</strong>
            <p>
              Link presence in fetched HTML, observed attributes, and limited
              HTTP checks.
            </p>
            <p>
              Google index status, ranking value, domain authority, and all
              backlinks to your site remain unmeasured.
            </p>
          </div>
          {baseline && (
            <div className={styles.baseline}>
              <strong>Saved baseline</strong>
              <p>
                {baseline.reports.length} sources ·{" "}
                {new Date(baseline.savedAt).toLocaleDateString("en-GB")}
              </p>
              <p className={styles.help}>
                Stored in this browser. No automatic rechecks or alerts.
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setOptions(baseline.options);
                  setSources(
                    baseline.reports.map((r) => r.sourceUrl).join("\n"),
                  );
                  setMode("live");
                  setMessage(
                    "Saved sources loaded. Choose Verify backlinks to run a fresh live check.",
                  );
                }}
              >
                Load saved sources
              </button>
              <button type="button" disabled={busy} onClick={clearBaseline}>
                <Trash2 size={14} aria-hidden /> Remove baseline
              </button>
            </div>
          )}
        </aside>
      </div>
      <p className={styles.notice} role="status" aria-live="polite">
        {message}
      </p>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {!!reports.length && (
        <div
          ref={results}
          className={styles.results}
          aria-label="Verification results"
        >
          <div className={styles.resultHeader}>
            <div>
              <p className={styles.eyebrow}>
                {isExample
                  ? "ILLUSTRATIVE EXAMPLE"
                  : "YOUR VERIFICATION SNAPSHOT"}
              </p>
              <h2>Review the observed links</h2>
              <p>
                {reports.length} of {planned} sources checked for{" "}
                <strong className={styles.break}>{runOptions.target}</strong>
              </p>
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondary}
                onClick={() =>
                  download(
                    reportCsv(reports, runOptions),
                    "backlink-verification.csv",
                    "text/csv;charset=utf-8",
                  )
                }
              >
                <Download size={16} aria-hidden /> Export CSV
              </button>
              <button
                type="button"
                className={styles.secondary}
                disabled={
                  busy || isExample || reports.some((r) => r.method !== "live")
                }
                onClick={saveBaseline}
              >
                <CheckCheck size={16} aria-hidden /> Save live baseline
              </button>
            </div>
          </div>
          <div className={styles.stats}>
            {(
              ["found", "not-found", "different-page", "unverified"] as const
            ).map((status) => (
              <button
                type="button"
                key={status}
                aria-pressed={filter === status}
                onClick={() => setFilter(filter === status ? "all" : status)}
              >
                <span>{reports.filter((r) => r.status === status).length}</span>
                {labels[status]}
              </button>
            ))}
          </div>
          {baseline && !comparable && (
            <p className={styles.help}>
              The saved baseline uses different target settings. Changes are not
              compared across different settings.
            </p>
          )}
          <div className={styles.filters}>
            <label className={styles.label}>
              Filter source results
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All source pages</option>
                {Object.entries(labels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.label}>
              Search results
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Source URL, title, or anchor"
              />
            </label>
          </div>
          <p className={styles.help}>
            {filtered.length} source results shown. A successful fetch does not
            confirm Google indexing.
          </p>
          {!filtered.length && (
            <p className={styles.empty}>
              No results match these filters. Choose All source pages or clear
              your search.
            </p>
          )}
          {filtered.map((r, index) => (
            <details
              key={r.sourceUrl}
              className={styles.source}
              open={index === 0}
            >
              <summary>
                <span className={styles.status} data-status={r.status}>
                  {labels[r.status]}
                </span>
                <span className={styles.sourceName}>
                  {r.title || r.sourceUrl}
                  <small>
                    {r.links.length} matching links ·{" "}
                    {r.httpStatus ? `HTTP ${r.httpStatus}` : "HTTP not checked"}{" "}
                    · {r.method === "live" ? "Live check" : "Supplied HTML"}
                  </small>
                </span>
                <span aria-hidden>⌄</span>
              </summary>
              <div className={styles.evidence}>
                <p className={styles.break}>
                  <strong>Source </strong>
                  <a
                    href={r.finalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {r.finalUrl} ↗
                  </a>
                </p>
                <p className={styles.help}>
                  Checked {new Date(r.checkedAt).toLocaleString("en-GB")}
                  {comparable
                    ? ` · ${comparison(
                        r,
                        baseline?.reports.find(
                          (p) => p.sourceUrl === r.sourceUrl,
                        ),
                      )}`
                    : ""}
                </p>
                {r.error && <p className={styles.error}>{r.error}</p>}
                <div className={styles.signals}>
                  <span>
                    Source noindex{" "}
                    <strong>
                      {r.noindex
                        ? "Observed"
                        : r.status === "unverified"
                          ? "Unknown"
                          : "Not observed"}
                    </strong>
                  </span>
                  <span>
                    Page nofollow{" "}
                    <strong>
                      {r.pageNofollow
                        ? "Observed"
                        : r.status === "unverified"
                          ? "Unknown"
                          : "Not observed"}
                    </strong>
                  </span>
                  <span>
                    Googlebot robots policy <strong>{r.crawlAccess}</strong>
                  </span>
                </div>
                <p className={styles.help}>{r.crawlNote}</p>
                {r.canonical && (
                  <p className={styles.break}>
                    <strong>Declared canonical </strong>
                    {r.canonical}
                  </p>
                )}
                {r.redirects.length > 0 && (
                  <details className={styles.chain}>
                    <summary>
                      Source redirect chain ({r.redirects.length})
                    </summary>
                    <ol>
                      {r.redirects.map((hop, i) => (
                        <li className={styles.break} key={i}>
                          {hop.url} → <strong>{hop.status}</strong> →{" "}
                          {hop.location}
                        </li>
                      ))}
                    </ol>
                  </details>
                )}
                {!!r.notes.length && (
                  <ul className={styles.notes}>
                    {r.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                )}
                {r.otherTargets.length > 0 && (
                  <details className={styles.chain}>
                    <summary>
                      Other pages on the target domain ({r.otherTargets.length})
                    </summary>
                    <ul>
                      {r.otherTargets.map((u) => (
                        <li className={styles.break} key={u}>
                          {u}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                {r.links.map((link, i) => (
                  <div key={`${link.href}:${i}`} className={styles.link}>
                    <div className={styles.linkTitle}>
                      <span>Placement {i + 1}</span>
                      <span>
                        {link.external ? "External link" : "Same-site link"}
                      </span>
                    </div>
                    <p className={styles.break}>
                      <strong>Destination </strong>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.href} ↗
                      </a>
                    </p>
                    <dl className={styles.details}>
                      <div>
                        <dt>Anchor</dt>
                        <dd>
                          {link.anchor || "Empty"}{" "}
                          <small>({link.anchorSource})</small>
                        </dd>
                      </div>
                      <div>
                        <dt>Link attributes</dt>
                        <dd>
                          {link.rel.length
                            ? link.rel.join(", ")
                            : "No rel values present"}
                        </dd>
                      </div>
                      <div>
                        <dt>Page section</dt>
                        <dd>{link.placement}</dd>
                      </div>
                      <div>
                        <dt>Destination response</dt>
                        <dd>
                          {link.destination?.status
                            ? `HTTP ${link.destination.status}`
                            : link.destination?.error ||
                              "Not checked in this batch"}
                        </dd>
                      </div>
                    </dl>
                    {link.destination &&
                      link.destination.finalUrl !== link.href && (
                        <p className={styles.break}>
                          <strong>Final destination </strong>
                          {link.destination.finalUrl}
                        </p>
                      )}
                    {!!link.destination?.redirects.length && (
                      <details className={styles.chain}>
                        <summary>Destination redirect chain</summary>
                        <ol>
                          {link.destination.redirects.map((h, j) => (
                            <li className={styles.break} key={j}>
                              {h.url} → {h.status} → {h.location}
                            </li>
                          ))}
                        </ol>
                      </details>
                    )}
                    {link.context && <blockquote>{link.context}</blockquote>}
                    {!!link.issues.length && (
                      <ul className={styles.notes}>
                        {link.issues.map((issue) => (
                          <li key={issue}>{issue}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
      <p className={styles.privacy}>
        Live checks request the source pages and up to six matching destinations
        per batch. Saved baselines stay in this browser until removed.
      </p>
    </section>
  );
}
