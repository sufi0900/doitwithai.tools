"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Download,
  FileUp,
  Search,
  ShieldCheck,
} from "lucide-react";
import ToolUrlInput from "../tool-ui/ToolUrlInput";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "../tool-ui/ToolRunOverlay";
import {
  defaultSettings,
  labels,
  type Settings,
  type MentionReport,
  type Status,
} from "./types";
import {
  validateSetup,
  importSourceCsv,
  mentionCsv,
  exampleHtml,
  exampleSettings,
  type Fields,
} from "./io";
import shared from "../backlink-verifier/backlinks.module.css";
import styles from "./mentions.module.css";

type Filter = Status | "all" | "has-link" | "shortlist";
const editable = new Set(["unlinked", "mixed", "elsewhere", "review"]);
export default function MentionClient() {
  const [settings, setSettings] = useState<Settings>(defaultSettings),
    [sources, setSources] = useState(""),
    [html, setHtml] = useState(""),
    [aliases, setAliases] = useState("");
  const [mode, setMode] = useState<"live" | "pasted">("live"),
    [advanced, setAdvanced] = useState(false);
  const [errors, setErrors] = useState<Fields>({}),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const [reports, setReports] = useState<MentionReport[]>([]),
    [runSettings, setRunSettings] = useState<Settings>(defaultSettings),
    [shortlist, setShortlist] = useState<string[]>([]);
  const [busy, setBusy] = useState(false),
    [planned, setPlanned] = useState(0),
    [filter, setFilter] = useState<Filter>("all"),
    [query, setQuery] = useState("");
  const [copy, setCopy] = useState(""),
    [navigation, setNavigation] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null),
    file = useRef<HTMLInputElement>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (busy || !navigation) return;
    const frame = requestAnimationFrame(() =>
      focusToolSection(document.getElementById(navigation)),
    );
    return () => cancelAnimationFrame(frame);
  }, [busy, navigation]);
  const clear = (field: keyof Fields) => {
    setErrors((previous) => {
      const next = { ...previous };
      delete next[field];
      return next;
    });
    setError("");
  };
  const visible = reports.filter((report) => {
    if (
      filter === "has-link" &&
      !["linked", "mixed", "elsewhere"].includes(report.status)
    )
      return false;
    if (filter === "shortlist" && !shortlist.includes(report.sourceUrl))
      return false;
    if (
      !["all", "has-link", "shortlist"].includes(filter) &&
      report.status !== filter
    )
      return false;
    return `${report.sourceUrl} ${report.title} ${report.mentions.map((m) => m.before + m.text + m.after).join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase());
  });
  async function run(example = false) {
    if (busy) return;
    setError("");
    setMessage("");
    setNavigation(null);
    setCopy("");
    const checked = validateSetup(
      example ? exampleSettings : settings,
      example ? "https://publisher.example/resources" : sources,
      example ? "pasted" : mode,
      example ? exampleHtml : html,
      example ? exampleSettings.aliases.join("\n") : aliases,
    );
    setErrors(checked.errors);
    if (Object.keys(checked.errors).length) {
      if (checked.errors.aliases) setAdvanced(true);
      setNavigation(`mentions-${Object.keys(checked.errors)[0]}`);
      return;
    }
    if (example) {
      setSettings(checked.settings);
      setSources(checked.sources.join("\n"));
      setMode("pasted");
      setHtml(exampleHtml);
      setAliases(exampleSettings.aliases.join("\n"));
    }
    const evidence = example ? "pasted" : mode,
      inputHtml = example ? exampleHtml : html;
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    setPlanned(checked.sources.length);
    setReports([]);
    setShortlist([]);
    setFilter("all");
    setQuery("");
    setRunSettings(checked.settings);
    let completed = 0;
    try {
      await paintToolFeedback();
      for (let i = 0; i < checked.sources.length; i += 5) {
        if (abort.signal.aborted) break;
        const response = await fetch("/api/ai-tools/brand-mentions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abort.signal,
          body: JSON.stringify({
            ...checked.settings,
            sources: checked.sources.slice(i, i + 5),
            ...(evidence === "pasted" ? { html: inputHtml } : {}),
          }),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok || !Array.isArray(data?.reports))
          throw new Error(
            data?.error?.message ||
              "This batch could not be checked. Try again later.",
          );
        completed += data.reports.length;
        setReports((previous) => [...previous, ...data.reports]);
        setMessage(
          `${completed} of ${checked.sources.length} source pages checked.`,
        );
      }
      setMessage(
        abort.signal.aborted
          ? `Stopped after ${completed} results were received. Remaining pages have no returned result.`
          : example
            ? "Example complete. Two mentions appear in fictional supplied HTML. No publisher website was fetched."
            : `${completed} source pages checked. Review the evidence before choosing a next step.`,
      );
    } catch (failure) {
      if (abort.signal.aborted)
        setMessage(
          `Stopped after ${completed} results were received. Remaining pages have no returned result.`,
        );
      else
        setError(
          `${failure instanceof Error ? failure.message : "The request failed."} ${completed} results were received.`,
        );
    } finally {
      controller.current = null;
      setBusy(false);
      setNavigation(completed ? "mentions-results" : "mentions-feedback");
    }
  }
  async function upload(selected?: File) {
    if (!selected) return;
    try {
      if (selected.size > 250000)
        throw new Error("Use a source CSV smaller than 250 KB.");
      const urls = importSourceCsv(await selected.text());
      setSources(urls.join("\n"));
      clear("sources");
      setMessage(`${urls.length} unique source page URLs imported.`);
    } catch (failure) {
      setErrors((previous) => ({
        ...previous,
        sources:
          failure instanceof Error
            ? failure.message
            : "This CSV could not be imported.",
      }));
      setNavigation("mentions-sources");
    }
    if (file.current) file.current.value = "";
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([mentionCsv(visible, runSettings, shortlist)], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "brand-mention-evidence.csv";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function copyShortlist() {
    const text = shortlist.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setMessage(`${shortlist.length} shortlisted source URLs copied.`);
    } catch {
      setCopy(text);
      setMessage("Copy your shortlisted source URLs from the text box.");
    }
  }
  const fieldError = (field: keyof Fields) =>
    errors[field] ? (
      <p className={styles.fieldError} id={`mentions-${field}-error`}>
        {errors[field]}
      </p>
    ) : null;
  return (
    <section
      id="brand-mention-checker"
      className={`${shared.workspace} ${styles.workspace}`}
      aria-label="Brand mention checker workspace"
    >
      <ToolRunOverlay
        active={busy}
        title={
          mode === "pasted"
            ? "Inspecting your supplied HTML"
            : "Checking your brand mentions"
        }
        description="Looking for brand text and direct website links on your supplied pages."
        progress={{ completed: reports.length, total: planned }}
        onCancel={() => controller.current?.abort()}
      />
      <div className={shared.intro}>
        <div>
          <p className={shared.eyebrow}>CHECK SUPPLIED PAGES</p>
          <h2>Is your brand mentioned without a link?</h2>
          <p>
            Add your brand, your website, and the external pages to inspect.
            This checker does not search the web for new mentions.
          </p>
        </div>
        <span className={shared.badge}>
          <ShieldCheck size={16} aria-hidden />
          Evidence first
        </span>
      </div>
      <div className={shared.layout}>
        <form
          className={shared.form}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void run();
          }}
        >
          {Object.keys(errors).length > 0 && (
            <div className={shared.error} role="alert">
              <strong>Check the highlighted fields.</strong>
              <ul>
                {Object.entries(errors).map(([field, text]) => (
                  <li key={field}>
                    <a
                      href={`#mentions-${field}`}
                      onClick={(event) => {
                        event.preventDefault();
                        focusToolSection(
                          document.getElementById(`mentions-${field}`),
                        );
                      }}
                    >
                      {text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <fieldset disabled={busy}>
            <legend className={shared.srOnly}>
              Brand mention check settings
            </legend>
            <div
              className={shared.switcher}
              role="group"
              aria-label="Evidence method"
            >
              {(["live", "pasted"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={mode === value}
                  onClick={() => {
                    setMode(value);
                    setErrors({});
                    setError("");
                  }}
                >
                  {value === "live" ? "Live page checks" : "Paste HTML"}
                </button>
              ))}
            </div>
            <label className={shared.label} htmlFor="mentions-brand">
              Brand name <span className={shared.required}>Required</span>
              <input
                id="mentions-brand"
                value={settings.brand}
                maxLength={100}
                aria-required="true"
                aria-invalid={!!errors.brand}
                aria-describedby={
                  errors.brand ? "mentions-brand-error" : undefined
                }
                placeholder="Do It With AI Tools"
                onChange={(event) => {
                  setSettings((previous) => ({
                    ...previous,
                    brand: event.target.value,
                  }));
                  clear("brand");
                }}
              />
            </label>
            {fieldError("brand")}
            <label className={shared.label} htmlFor="mentions-target">
              Your website <span className={shared.required}>Required</span>
              <ToolUrlInput
                id="mentions-target"
                value={settings.target}
                maxLength={2048}
                aria-required="true"
                aria-invalid={!!errors.target}
                aria-describedby={`mentions-target-help${errors.target ? " mentions-target-error" : ""}`}
                placeholder="https://yourwebsite.com"
                onChange={(event) => {
                  setSettings((previous) => ({
                    ...previous,
                    target: event.target.value,
                  }));
                  clear("target");
                }}
              />
            </label>
            <p id="mentions-target-help" className={shared.help}>
              We check for direct links to any page on this website.
            </p>
            {fieldError("target")}
            <label className={shared.label} htmlFor="mentions-sources">
              External pages to check{" "}
              <span className={shared.required}>Required</span>
              <textarea
                id="mentions-sources"
                value={sources}
                rows={5}
                maxLength={110000}
                aria-required="true"
                aria-invalid={!!errors.sources}
                aria-describedby={`mentions-source-help${errors.sources ? " mentions-sources-error" : ""}`}
                placeholder={
                  "https://publisher.com/article\nhttps://another-site.com/resources"
                }
                onChange={(event) => {
                  setSources(event.target.value);
                  clear("sources");
                }}
              />
            </label>
            <p className={shared.help} id="mentions-source-help">
              Paste one page URL per line. Press Enter for another page,
              including pages from different websites. Up to 50 unique pages.
            </p>
            {fieldError("sources")}
            <div className={shared.imports}>
              <button type="button" onClick={() => file.current?.click()}>
                <FileUp size={15} aria-hidden />
                Import source CSV
              </button>
              <input
                className={shared.srOnly}
                ref={file}
                type="file"
                accept=".csv,text/csv"
                aria-label="Import mention source URLs"
                onChange={(event) => void upload(event.target.files?.[0])}
              />
            </div>
            {mode === "pasted" && (
              <>
                <label className={shared.label} htmlFor="mentions-html">
                  Source page HTML{" "}
                  <span className={shared.required}>Required</span>
                  <textarea
                    id="mentions-html"
                    className={styles.code}
                    rows={6}
                    value={html}
                    maxLength={750000}
                    aria-required="true"
                    aria-invalid={!!errors.html}
                    aria-describedby={
                      errors.html ? "mentions-html-error" : undefined
                    }
                    placeholder="Paste the source page HTML here"
                    onChange={(event) => {
                      setHtml(event.target.value);
                      clear("html");
                    }}
                  />
                </label>
                <p className={shared.help}>
                  Use one source URL. Scripts are not executed, and supplied
                  HTML does not verify a live page.
                </p>
                {fieldError("html")}
              </>
            )}
            <details
              className={shared.advanced}
              open={advanced}
              onToggle={(event) => setAdvanced(event.currentTarget.open)}
            >
              <summary>Optional matching settings</summary>
              <label className={shared.label} htmlFor="mentions-aliases">
                Alternate brand names
                <textarea
                  id="mentions-aliases"
                  rows={3}
                  value={aliases}
                  maxLength={600}
                  aria-invalid={!!errors.aliases}
                  aria-describedby={
                    errors.aliases ? "mentions-aliases-error" : undefined
                  }
                  placeholder={"DoItWithAI\nDo It With AI"}
                  onChange={(event) => {
                    setAliases(event.target.value);
                    clear("aliases");
                  }}
                />
              </label>
              {fieldError("aliases")}
              <p className={shared.help}>
                One alternate name per line, up to five. Use names that clearly
                identify your brand.
              </p>
              <label className={shared.check}>
                <input
                  type="checkbox"
                  checked={settings.caseSensitive}
                  onChange={(event) =>
                    setSettings((previous) => ({
                      ...previous,
                      caseSensitive: event.target.checked,
                    }))
                  }
                />
                Match letter case exactly
              </label>
              <label className={shared.check}>
                <input
                  type="checkbox"
                  checked={settings.includeSubdomains}
                  onChange={(event) =>
                    setSettings((previous) => ({
                      ...previous,
                      includeSubdomains: event.target.checked,
                    }))
                  }
                />
                Count links to your website's subdomains
              </label>
            </details>
            <div className={shared.actions}>
              <button type="submit" className={shared.primary}>
                <Search size={17} aria-hidden />
                Check brand mentions
              </button>
              <button
                type="button"
                className={shared.secondary}
                onClick={() => void run(true)}
              >
                Try an example
              </button>
            </div>
          </fieldset>
        </form>
        <aside className={shared.explainer}>
          <h3>Read the mention and the link together</h3>
          <ol>
            <li>
              <strong>Find the matching text</strong>
              <span>
                Review the brand name, alternate name, and surrounding words.
              </span>
            </li>
            <li>
              <strong>Inspect its destination</strong>
              <span>
                See whether the mention links to your website, somewhere else,
                or nowhere.
              </span>
            </li>
            <li>
              <strong>Check the whole page</strong>
              <span>
                A plain mention can coexist with a website link elsewhere on the
                page.
              </span>
            </li>
          </ol>
          <div className={shared.boundary}>
            <strong>Where do I get source pages?</strong>
            <p>
              Bring URLs from search results, mention alerts, PR records, or
              your own research.
            </p>
            <p>
              Same-name brands can create false matches. Review the context
              before choosing an outreach opportunity.
            </p>
          </div>
        </aside>
      </div>
      <div id="mentions-feedback" tabIndex={-1} className={styles.feedback}>
        {error && (
          <p className={shared.error} role="alert">
            {error}
          </p>
        )}
        <p className={shared.notice} role="status" aria-live="polite">
          {message}
        </p>
      </div>
      {!!reports.length && (
        <div
          id="mentions-results"
          tabIndex={-1}
          className={shared.results}
          aria-label="Brand mention results"
        >
          <div className={shared.resultHeader}>
            <div>
              <p className={shared.eyebrow}>YOUR HTML EVIDENCE</p>
              <h2>Review your brand mentions</h2>
              <p>
                {reports.length} of {planned} source pages returned results for{" "}
                <strong>{runSettings.brand}</strong>. Each result describes the
                inspected HTML.
              </p>
            </div>
            <button
              type="button"
              className={shared.secondary}
              disabled={busy}
              onClick={download}
            >
              <Download size={16} aria-hidden />
              Export filtered evidence
            </button>
          </div>
          <div className={shared.stats}>
            {(
              [
                [
                  "unlinked",
                  "Without a website link",
                  reports.filter((r) => r.status === "unlinked").length,
                ],
                [
                  "has-link",
                  "Website link present",
                  reports.filter((r) =>
                    ["linked", "mixed", "elsewhere"].includes(r.status),
                  ).length,
                ],
                [
                  "not-mentioned",
                  "No mention in HTML",
                  reports.filter((r) => r.status === "not-mentioned").length,
                ],
                [
                  "unverified",
                  "Unable to verify",
                  reports.filter((r) => r.status === "unverified").length,
                ],
              ] as const
            ).map(([value, label, count]) => (
              <button
                type="button"
                key={value}
                aria-pressed={filter === value}
                onClick={() => setFilter(filter === value ? "all" : value)}
              >
                <span>{count}</span>
                {label}
              </button>
            ))}
          </div>
          <div className={shared.filters}>
            <label className={shared.label}>
              Filter results
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value as Filter)}
              >
                <option value="all">All supplied pages</option>
                <option value="has-link">Website link present</option>
                <option value="shortlist">Shortlisted pages</option>
                {Object.entries(labels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className={shared.label}>
              Search sources and context
              <input
                type="search"
                value={query}
                maxLength={200}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Page URL, title, or surrounding text"
              />
            </label>
          </div>
          <p className={shared.help}>
            {visible.length} source results shown.{" "}
            {reports.filter((r) => r.status === "review").length} need
            destination review.{" "}
            {reports.filter((r) => r.status === "own-site").length} own-site
            sources excluded.
          </p>
          {!visible.length && (
            <p className={shared.empty}>
              No pages match these filters. Choose All supplied pages or clear
              the search.
            </p>
          )}
          {visible.map((report, index) => (
            <details
              key={report.sourceUrl}
              className={shared.source}
              open={index === 0}
            >
              <summary>
                <span className={styles.status} data-status={report.status}>
                  {labels[report.status]}
                </span>
                <span className={shared.sourceName}>
                  {report.title || report.sourceUrl}
                  <small>
                    {report.mentions.length}{" "}
                    {report.mentions.length === 1
                      ? "matching mention"
                      : "matching mentions"}{" "}
                    · {report.siteLinks.length} direct website{" "}
                    {report.siteLinks.length === 1
                      ? "destination"
                      : "destinations"}{" "}
                    ·{" "}
                    {report.method === "pasted"
                      ? "Supplied HTML"
                      : "Fetched HTML"}
                  </small>
                </span>
                <span className={shared.disclosure} aria-hidden>
                  <ChevronDown size={19} />
                </span>
              </summary>
              <div className={shared.evidence}>
                <p className={shared.break}>
                  <strong>Source </strong>
                  <a
                    href={report.finalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {report.finalUrl} ↗
                  </a>
                </p>
                <p className={shared.help}>
                  Checked {new Date(report.checkedAt).toLocaleString("en-GB")} ·{" "}
                  {report.httpStatus
                    ? `HTTP ${report.httpStatus}`
                    : "HTTP not checked"}{" "}
                  ·{" "}
                  {report.complete
                    ? "Within analysis limits"
                    : "Incomplete or excluded"}
                </p>
                {report.error && <p className={shared.error}>{report.error}</p>}
                {editable.has(report.status) && (
                  <label className={shared.check}>
                    <input
                      type="checkbox"
                      checked={shortlist.includes(report.sourceUrl)}
                      onChange={(event) =>
                        setShortlist((previous) =>
                          event.target.checked
                            ? [...previous, report.sourceUrl]
                            : previous.filter(
                                (url) => url !== report.sourceUrl,
                              ),
                        )
                      }
                    />
                    Shortlist this page for manual review
                  </label>
                )}
                {report.mentions.map((mention, i) => (
                  <div key={i} className={shared.link}>
                    <div className={shared.linkTitle}>
                      <span>Mention {i + 1}</span>
                      <span>
                        {mention.kind === "website-link"
                          ? "Links to your website"
                          : mention.kind === "other-link"
                            ? "Links elsewhere"
                            : mention.kind === "partial-link"
                              ? "Partly linked · review"
                              : "Plain text"}
                      </span>
                    </div>
                    <p className={styles.context}>
                      {mention.before}
                      <mark>{mention.text}</mark>
                      {mention.after}
                    </p>
                    <p className={shared.help}>
                      Page section: {mention.section}.{" "}
                      {mention.rel.length
                        ? `Link rel: ${mention.rel.join(", ")}.`
                        : ""}
                    </p>
                    {mention.destinations.map((destination) => (
                      <p className={shared.break} key={destination}>
                        <strong>Mention destination </strong>
                        <a
                          href={destination}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {destination} ↗
                        </a>
                      </p>
                    ))}
                  </div>
                ))}
                {!!report.siteLinks.length && (
                  <details className={shared.chain}>
                    <summary>
                      Direct website links on this page (
                      {report.siteLinks.length})
                    </summary>
                    <ul>
                      {report.siteLinks.map((link) => (
                        <li className={shared.break} key={link.href}>
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {link.href} ↗
                          </a>
                          {link.rel.length ? ` · ${link.rel.join(", ")}` : ""}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                <ul className={shared.notes}>
                  {report.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
          <aside className={styles.nextStep}>
            <h3>Review the source before outreach</h3>
            <p>
              Confirm that the mention refers to your brand and that a website
              reference would help the reader. No outreach is sent
              automatically.
            </p>
            <div className={shared.actions}>
              <button
                type="button"
                className={shared.secondary}
                disabled={!shortlist.length}
                onClick={() => void copyShortlist()}
              >
                Copy shortlisted source URLs ({shortlist.length})
              </button>
              <Link
                className={shared.primary}
                href="/tools/backlink-verification-tool"
              >
                Open Backlink Verification Tool ↗
              </Link>
            </div>
            {copy && (
              <label className={shared.label}>
                Shortlisted source URLs
                <textarea readOnly value={copy} rows={4} />
              </label>
            )}
          </aside>
        </div>
      )}
      <p className={shared.privacy}>
        Live checks request only supplied source pages and their robots
        policies. This tool has no automatic discovery or scheduled monitoring.
        Exports contain your input and evidence.
      </p>
    </section>
  );
}
