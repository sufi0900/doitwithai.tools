"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Download,
  FileUp,
  GitCompareArrows,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import ToolUrlInput from "../tool-ui/ToolUrlInput";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "../tool-ui/ToolRunOverlay";
import {
  requiredInputProblems,
  type DatasetProblems,
  type InputProblems,
} from "./validation";
import {
  buildGap,
  category,
  defaultFilters,
  filterGroups,
  type Filters,
} from "./analyze";
import { ingest, parseTable, readExport } from "./import";
import {
  evidenceCsv,
  exampleInputs,
  gapCsv,
  issuesCsv,
  readProject,
  verificationSources,
  type Project,
} from "./export";
import {
  fieldNames,
  newDataset,
  type DatasetInput,
  type Field,
  type GapReport,
  type Review,
} from "./types";
import styles from "./gap.module.css";

const reviewKey = "doitwithai.backlink-gap-review.v1";
function download(text: string, name: string, type = "text/csv;charset=utf-8") {
  const u = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
function DatasetCard({
  input,
  index,
  disabled,
  onChange,
  onRemove,
  onError,
  problems,
}: {
  input: DatasetInput;
  index: number;
  disabled: boolean;
  onChange: (d: DatasetInput) => void;
  onRemove?: () => void;
  onError: (s: string) => void;
  problems: DatasetProblems;
}) {
  const isOwn = index === 0;
  function preview(text = input.text, override?: boolean) {
    try {
      onChange({
        ...input,
        text,
        table: parseTable(text, override),
        emptyConfirmed: false,
      });
      onError("");
    } catch (e) {
      onError(
        e instanceof Error ? e.message : "The source data could not be read.",
      );
    }
  }
  async function upload(file?: File) {
    if (!file) return;
    try {
      const text = await readExport(file);
      onChange({
        ...input,
        text,
        name: file.name,
        table: parseTable(text),
        emptyConfirmed: false,
      });
      onError("");
    } catch (e) {
      onError(e instanceof Error ? e.message : "The file could not be read.");
    }
  }
  const columns = input.table?.headers || [];
  return (
    <fieldset
      disabled={disabled}
      className={styles.dataset}
      data-dataset-id={input.id}
      aria-label={
        isOwn ? "Your backlink dataset" : `Competitor ${index} dataset`
      }
    >
      <div className={styles.datasetTitle}>
        <span className={styles.number}>{isOwn ? "YOU" : `0${index}`}</span>
        <h3>{isOwn ? "Your website" : `Competitor ${index}`}</h3>
        {onRemove && (
          <button
            type="button"
            className={styles.iconButton}
            aria-label={`Remove competitor ${index}`}
            onClick={onRemove}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <label className={styles.label}>
        {isOwn ? "Your website domain" : "Competitor website domain"}{" "}
        <span className={styles.required}>Required</span>
        <ToolUrlInput
          id={`gap-${input.id}-site`}
          aria-required="true"
          aria-invalid={!!problems.site}
          aria-describedby={
            problems.site ? `gap-${input.id}-site-error` : undefined
          }
          inputMode="url"
          type="text"
          urlKind="domain"
          value={input.site}
          placeholder={
            isOwn ? "https://yourwebsite.com" : "https://competitor.com"
          }
          maxLength={2048}
          onChange={(e) => onChange({ ...input, site: e.target.value })}
        />
      </label>
      {problems.site && (
        <p className={styles.fieldError} id={`gap-${input.id}-site-error`}>
          {problems.site}
        </p>
      )}
      <p className={styles.dataTitle}>
        Backlink data{" "}
        <span className={styles.required}>
          {input.emptyConfirmed ? "Empty list confirmed" : "Required"}
        </span>
      </p>
      <p className={styles.help}>
        Add pages or domains that link to{" "}
        {isOwn ? "your website" : "this competitor"}. A website domain alone
        cannot find its backlinks.
      </p>
      <label className={styles.file}>
        <FileUp size={18} aria-hidden />
        <span>Upload CSV, TSV, or TXT</span>
        <input
          type="file"
          accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
          aria-label={
            isOwn
              ? "Upload your backlink export"
              : `Upload competitor ${index} export`
          }
          onChange={(e) => {
            void upload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      {input.name && <p className={styles.fileName}>{input.name}</p>}
      <label className={styles.label}>
        Or paste linking pages or referring domains
        <textarea
          id={`gap-${input.id}-data`}
          aria-required={!input.emptyConfirmed}
          aria-invalid={!!problems.data}
          aria-describedby={`gap-${input.id}-data-help${problems.data ? ` gap-${input.id}-data-error` : ""}`}
          value={input.text}
          rows={4}
          maxLength={2_000_000}
          placeholder={"publisher.com\nanother-publisher.com"}
          onChange={(e) =>
            onChange({
              ...input,
              text: e.target.value,
              table: null,
              emptyConfirmed: false,
            })
          }
        />
      </label>
      <p className={styles.help} id={`gap-${input.id}-data-help`}>
        One referring domain or page URL per line. Press Enter for another. You
        can also paste CSV or TSV data.
      </p>
      {problems.data && (
        <p className={styles.fieldError} id={`gap-${input.id}-data-error`}>
          {problems.data}
        </p>
      )}
      <div className={styles.inline}>
        <button
          type="button"
          className={styles.smallButton}
          onClick={() => preview()}
          disabled={!input.text.trim()}
        >
          Preview columns
        </button>
        <span className={styles.help}>
          Up to 5,000 records. Columns are detected when you compare.
        </span>
      </div>
      <details className={styles.optional}>
        <summary>
          Optional data details{isOwn ? " and empty-list option" : ""}
        </summary>
        <div className={styles.twoFields}>
          <label className={styles.label}>
            Data provider
            <select
              value={input.provider}
              onChange={(e) => onChange({ ...input, provider: e.target.value })}
            >
              {[
                "Unspecified",
                "Google Search Console",
                "Bing Webmaster Tools",
                "Ahrefs",
                "Semrush",
                "Other export",
                "Illustrative example",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className={styles.label}>
            Export date, if known
            <input
              type="date"
              value={input.date}
              onChange={(e) => onChange({ ...input, date: e.target.value })}
            />
          </label>
        </div>
        {isOwn && (
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={input.emptyConfirmed}
              onChange={(e) =>
                onChange({
                  ...input,
                  emptyConfirmed: e.target.checked,
                  text: e.target.checked ? "" : input.text,
                  table: e.target.checked ? null : input.table,
                })
              }
            />{" "}
            I am deliberately comparing against an empty own-site list.
          </label>
        )}
        {input.emptyConfirmed && (
          <p className={styles.warning}>
            Every competitor-only source can appear missing from this empty
            list. This does not establish that your website has no backlinks.
          </p>
        )}
      </details>
      {input.table && (
        <details
          className={styles.mapping}
          open={input.table.mapping.source < 0 || !!problems.data}
        >
          <summary>
            Review column mapping · {input.table.rows.length} records read
          </summary>
          <div className={styles.inline}>
            <strong>{input.table.rows.length} data records read</strong>
            <span className={styles.help}>
              {input.table.delimiter === "\t"
                ? "TSV"
                : input.table.delimiter === ";"
                  ? "Semicolon-separated"
                  : "CSV / text"}
            </span>
          </div>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={input.table.hasHeader}
              onChange={(e) => preview(input.text, e.target.checked)}
            />{" "}
            First row contains column names
          </label>
          <label className={styles.label}>
            Referring page or domain column{" "}
            <span className={styles.required}>Required</span>
            <select
              value={input.table.mapping.source}
              onChange={(e) =>
                onChange({
                  ...input,
                  table: {
                    ...input.table!,
                    mapping: {
                      ...input.table!.mapping,
                      source: Number(e.target.value),
                    },
                  },
                })
              }
            >
              <option value={-1}>Choose the source column</option>
              {columns.map((header, i) => (
                <option value={i} key={i}>
                  {i + 1}. {header}
                </option>
              ))}
            </select>
          </label>
          <details>
            <summary>Map optional evidence columns</summary>
            <div className={styles.twoFields}>
              {(Object.keys(fieldNames) as Field[])
                .filter((field) => field !== "source")
                .map((field) => (
                  <label className={styles.label} key={field}>
                    {fieldNames[field]}
                    <select
                      value={input.table!.mapping[field]}
                      onChange={(e) =>
                        onChange({
                          ...input,
                          table: {
                            ...input.table!,
                            mapping: {
                              ...input.table!.mapping,
                              [field]: Number(e.target.value),
                            },
                          },
                        })
                      }
                    >
                      <option value={-1}>Not supplied</option>
                      {columns.map((header, i) => (
                        <option value={i} key={i}>
                          {i + 1}. {header}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
            </div>
            <p className={styles.help}>
              Map only what your export actually contains. Missing attributes
              and metrics remain unknown.
            </p>
          </details>
          <details>
            <summary>Inspect the first three source records</summary>
            <div className={styles.preview}>
              {input.table.rows.slice(0, 3).map((row, i) => (
                <div key={i}>
                  <span>Record {i + (input.table!.hasHeader ? 2 : 1)}</span>
                  <code>
                    {input.table!.mapping.source >= 0
                      ? row[input.table!.mapping.source] || "Empty source cell"
                      : "Choose a source column"}
                  </code>
                </div>
              ))}
            </div>
          </details>
        </details>
      )}
    </fieldset>
  );
}
export default function GapClient() {
  const [inputs, setInputs] = useState<DatasetInput[]>([
    newDataset("own"),
    newDataset("competitor-one"),
  ]);
  const [grouping, setGrouping] = useState<GapReport["grouping"]>("domain"),
    [includeInactive, setIncludeInactive] = useState(false);
  const [report, setReport] = useState<GapReport | null>(null),
    [filters, setFilters] = useState<Filters>(defaultFilters);
  const [reviews, setReviews] = useState<Record<string, Review>>({}),
    [open, setOpen] = useState<string | null>(null),
    [page, setPage] = useState(0);
  const [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [manualCopy, setManualCopy] = useState("");
  const [problems, setProblems] = useState<InputProblems>({});
  const [navigation, setNavigation] = useState<
    { id: string } | { result: true } | null
  >(null);
  const [compareStatus, setCompareStatus] = useState("");
  const nextId = useRef(3),
    projectFile = useRef<HTMLInputElement>(null),
    resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (busy || !navigation) return;
    const frame = requestAnimationFrame(() =>
      focusToolSection(
        "result" in navigation
          ? resultRef.current
          : document.getElementById(navigation.id),
      ),
    );
    return () => cancelAnimationFrame(frame);
  }, [busy, navigation]);
  useEffect(() => {
    if (!error) return;
    const frame = requestAnimationFrame(() =>
      focusToolSection(document.getElementById("backlink-gap-errors")),
    );
    return () => cancelAnimationFrame(frame);
  }, [error]);
  const filtered = report ? filterGroups(report, filters, reviews) : [],
    pageSize = 25,
    pages = Math.max(1, Math.ceil(filtered.length / pageSize)),
    safePage = Math.min(page, pages - 1);
  const changeInput = (index: number, value: DatasetInput) => {
    const previous = inputs[index];
    setProblems((current) => {
      const next = { ...current, [value.id]: { ...current[value.id] } };
      if (previous.site !== value.site) delete next[value.id].site;
      if (
        previous.text !== value.text ||
        previous.table !== value.table ||
        previous.emptyConfirmed !== value.emptyConfirmed
      )
        delete next[value.id].data;
      if (!Object.keys(next[value.id]).length) delete next[value.id];
      return next;
    });
    setInputs((prev) => prev.map((d, i) => (i === index ? value : d)));
    setReport(null);
    setError("");
    setMessage("");
  };
  const changeFilter = (patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(0);
  };
  async function compare(source = inputs, isExample = false) {
    if (busy) return;
    setError("");
    setMessage("");
    setManualCopy("");
    setNavigation(null);
    const required = requiredInputProblems(source);
    setProblems(required);
    if (Object.keys(required).length) {
      setReport(null);
      const id = Object.keys(required)[0];
      setNavigation({ id: `gap-${id}-${required[id].site ? "site" : "data"}` });
      return;
    }
    setBusy(true);
    setReport(null);
    setCompareStatus("Reading the backlink data you supplied.");
    const parsed = [...source];
    let activeId = "";
    try {
      const datasets = [];
      for (let i = 0; i < parsed.length; i++) {
        activeId = parsed[i].id;
        setCompareStatus(
          `Reading dataset ${i + 1} of ${parsed.length}. Your data stays in this browser.`,
        );
        await paintToolFeedback();
        const input = parsed[i];
        if (input.text.trim() && !input.table)
          parsed[i] = { ...input, table: parseTable(input.text) };
        if (parsed[i].table && parsed[i].table!.mapping.source < 0)
          throw new Error(
            "Choose the referring-page or domain column under Review column mapping.",
          );
        datasets.push(ingest(parsed[i]));
      }
      activeId = "";
      const next = buildGap(
        datasets,
        isExample ? "domain" : grouping,
        isExample ? false : includeInactive,
      );
      if (isExample) {
        setGrouping("domain");
        setIncludeInactive(false);
      }
      setInputs(parsed);
      setReport(next);
      setFilters(defaultFilters);
      setPage(0);
      setOpen(null);
      setMessage(
        isExample
          ? "Illustrative example loaded. All domains and records in this example are fictional."
          : `${next.groups.length} referring groups compared from the accepted records. Review coverage before choosing outreach targets.`,
      );
      setNavigation({ result: true });
    } catch (e) {
      setReport(null);
      setInputs(parsed);
      const message =
        e instanceof Error ? e.message : "The datasets could not be compared.";
      if (activeId) {
        setProblems({ [activeId]: { data: message } });
        setNavigation({ id: `gap-${activeId}-data` });
      } else {
        setError(message);
        setNavigation({ id: "backlink-gap-errors" });
      }
    } finally {
      setBusy(false);
    }
  }
  function example() {
    const source = exampleInputs.map((d) => ({
      ...newDataset(d.id),
      ...d,
      table: parseTable(d.text),
    }));
    setReviews({});
    void compare(source, true);
  }
  function exportProject() {
    const project: Project = {
      version: 1,
      inputs: inputs.map((d) => ({
        ...d,
        table: d.table ? { ...d.table, rows: [] } : null,
      })),
      grouping,
      includeInactive,
      reviews,
    };
    const text = JSON.stringify(project, null, 2);
    if (new Blob([text]).size > 14_000_000) {
      setError(
        "This project exceeds 14 MB. Reduce the source data before downloading a restorable project.",
      );
      return;
    }
    download(text, "backlink-gap-project.json", "application/json");
    setMessage(
      "Project downloaded. It includes your supplied source data and review notes. Keep the file private when needed.",
    );
  }
  async function restoreProject(file?: File) {
    if (!file) return;
    try {
      if (file.size > 14_000_000)
        throw new Error("Choose a project smaller than 14 MB.");
      const p = readProject(await file.text());
      setInputs(p.inputs);
      setGrouping(p.grouping);
      setIncludeInactive(p.includeInactive);
      setReviews(p.reviews);
      setReport(null);
      setProblems({});
      setError("");
      setMessage(
        "Project restored. Review the inputs and choose Compare supplied backlinks.",
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The project could not be restored.",
      );
    }
    if (projectFile.current) projectFile.current.value = "";
  }
  function saveReview() {
    if (!report) return;
    try {
      const text = JSON.stringify({
        version: 1,
        scope:
          report.datasets.map((d) => d.site).join("|") + "|" + report.grouping,
        reviews,
      });
      if (text.length > 750000)
        throw new Error(
          "This review is too large for browser storage. Download the project instead.",
        );
      localStorage.setItem(reviewKey, text);
      setMessage(
        "Review decisions saved on this device. Exported backlink data was not saved to browser storage.",
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "This browser could not save the review. Download the project instead.",
      );
    }
  }
  function loadReview() {
    if (!report) return;
    try {
      const text = localStorage.getItem(reviewKey) || "";
      if (!text || text.length > 750000)
        throw new Error("No readable review is saved on this device.");
      const value = JSON.parse(text);
      if (
        value.version !== 1 ||
        value.scope !==
          report.datasets.map((d) => d.site).join("|") +
            "|" +
            report.grouping ||
        !value.reviews ||
        typeof value.reviews !== "object" ||
        Array.isArray(value.reviews)
      )
        throw new Error(
          "The saved review belongs to a different set of websites or grouping mode.",
        );
      for (const [key, v] of Object.entries(value.reviews) as [
        string,
        Review,
      ][])
        if (
          key.length > 253 ||
          !v ||
          !["review", "shortlist", "skip"].includes(v.status) ||
          typeof v.note !== "string" ||
          v.note.length > 1000
        )
          throw new Error("The saved review contains invalid fields.");
      setReviews(value.reviews);
      setError("");
      setMessage("Saved review decisions loaded for these websites.");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "The saved review could not be loaded.",
      );
    }
  }
  async function copySources(groups: typeof filtered) {
    const urls = [...new Set(groups.flatMap(verificationSources))];
    if (!urls.length) {
      setMessage(
        "These records contain domains only. Import linking-page URLs before checking live placements.",
      );
      return;
    }
    const text = urls.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setMessage(
        `${urls.length} supplied source URLs copied. The Backlink Verification Tool accepts up to 50 per run.`,
      );
    } catch {
      setManualCopy(text);
      setMessage("Copy the source URLs from the text box below.");
    }
  }
  function review(key: string, patch: Partial<Review>) {
    setReviews((prev) => ({
      ...prev,
      [key]: { status: "review", note: "", ...prev[key], ...patch },
    }));
  }
  const competitors = report?.datasets.slice(1) || [];
  const provenance = report
    ? [...new Set(report.datasets.map((d) => d.provider))]
    : [];
  return (
    <section
      className={styles.workspace}
      id="backlink-gap-workspace"
      aria-label="Backlink gap comparison workspace"
    >
      <ToolRunOverlay
        active={busy}
        title="Comparing your backlink lists"
        description={compareStatus}
      />
      <div className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>COMPARE YOUR SUPPLIED DATA</p>
          <h2>Find the overlap. Keep the evidence.</h2>
          <p>
            Start with your backlink list and one competitor's list. Add more
            competitors when needed.
          </p>
        </div>
        <span className={styles.badge}>No backlink API key required</span>
      </div>
      <ol className={styles.steps} aria-label="How to compare backlinks">
        <li>
          <strong>1. Your website</strong>
          <span>Add your domain and backlink data.</span>
        </li>
        <li>
          <strong>2. A competitor</strong>
          <span>Add their domain and backlink data.</span>
        </li>
        <li>
          <strong>3. Compare</strong>
          <span>Review sources missing from your list.</span>
        </li>
      </ol>
      <details className={styles.dataHelp}>
        <summary>Where do I get backlink data?</summary>
        <p>
          Use a Search Console export for a website you manage. For competitors,
          use a backlink provider's export or your own collected list.
        </p>
        <p>
          Paste linking-page URLs or referring domains, one per line. A domain
          entered above identifies the website; it does not discover backlinks.
        </p>
      </details>
      <div className={styles.topActions}>
        <button
          type="button"
          className={styles.secondary}
          onClick={example}
          disabled={busy}
        >
          Try a worked example
        </button>
        <details className={styles.toolbox}>
          <summary>Templates and saved projects</summary>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={() =>
                download(
                  "Source URL,Target URL,Anchor,Nofollow,Status\r\nhttps://publisher.example/article,https://your-site.example/guide,Example guide,false,Live\r\n",
                  "backlink-gap-template.csv",
                )
              }
            >
              Download CSV template
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => projectFile.current?.click()}
              disabled={busy}
            >
              Restore project
            </button>
            <input
              ref={projectFile}
              className={styles.hidden}
              type="file"
              accept=".json,application/json"
              aria-label="Restore backlink gap project"
              onChange={(e) => void restoreProject(e.target.files?.[0])}
            />
            <button
              type="button"
              className={styles.secondary}
              onClick={exportProject}
              disabled={busy}
            >
              <Download size={16} aria-hidden /> Download project
            </button>
          </div>
        </details>
      </div>
      {(error || Object.keys(problems).length > 0) && (
        <div
          className={styles.error}
          id="backlink-gap-errors"
          tabIndex={-1}
          role="alert"
        >
          <strong>
            {Object.keys(problems).length
              ? "Check the highlighted fields before comparing."
              : error}
          </strong>
          {Object.keys(problems).length > 0 && (
            <ul>
              {inputs.flatMap((input, index) =>
                (["site", "data"] as const).flatMap((field) => {
                  const problem = problems[input.id]?.[field];
                  const id = `gap-${input.id}-${field}`;
                  return problem
                    ? [
                        <li key={id}>
                          <a
                            href={`#${id}`}
                            onClick={(event) => {
                              event.preventDefault();
                              focusToolSection(document.getElementById(id));
                            }}
                          >
                            {index === 0
                              ? "Your website"
                              : `Competitor ${index}`}{" "}
                            ·{" "}
                            {field === "site"
                              ? "Website domain"
                              : "Backlink data"}
                            : {problem}
                          </a>
                        </li>,
                      ]
                    : [];
                }),
              )}
            </ul>
          )}
        </div>
      )}
      <div className={styles.datasets}>
        {inputs.map((input, index) => (
          <DatasetCard
            key={input.id}
            input={input}
            index={index}
            disabled={busy}
            problems={problems[input.id] || {}}
            onError={(message) => {
              if (message) setReport(null);
              setProblems((current) => {
                const next = {
                  ...current,
                  [input.id]: { ...current[input.id] },
                };
                if (message) next[input.id].data = message;
                else delete next[input.id].data;
                if (!Object.keys(next[input.id]).length) delete next[input.id];
                return next;
              });
              if (message) setNavigation({ id: `gap-${input.id}-data` });
            }}
            onChange={(value) => changeInput(index, value)}
            onRemove={
              index === 0 || inputs.length <= 2
                ? undefined
                : () => {
                    setInputs((prev) => prev.filter((d) => d.id !== input.id));
                    setProblems((current) => {
                      const next = { ...current };
                      delete next[input.id];
                      return next;
                    });
                    setReport(null);
                  }
            }
          />
        ))}
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondary}
          disabled={busy || inputs.length >= 6}
          onClick={() => {
            while (inputs.some((d) => d.id === `competitor-${nextId.current}`))
              nextId.current++;
            const id = `competitor-${nextId.current++}`;
            setInputs((prev) => [...prev, newDataset(id)]);
            setReport(null);
          }}
        >
          <Plus size={16} aria-hidden /> Add competitor
        </button>
        <span className={styles.help}>
          {inputs.length - 1} of 5 competitor slots used.
        </span>
      </div>
      <div className={styles.compareBox}>
        <h3 className={styles.compareTitle}>Ready to compare?</h3>
        <p className={styles.help}>
          We detect columns automatically and compare referring domains. Preview
          columns only if you want to check the mapping first.
        </p>
        <details className={styles.optional}>
          <summary>Advanced comparison options</summary>
          <label className={styles.label}>
            Group referring sources by
            <select
              value={grouping}
              disabled={busy}
              onChange={(e) => {
                setGrouping(e.target.value as GapReport["grouping"]);
                setReport(null);
              }}
            >
              <option value="domain">
                Website domain, combining its subdomains
              </option>
              <option value="host">
                Exact host, with www grouped with the root host
              </option>
            </select>
          </label>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={includeInactive}
              disabled={busy}
              onChange={(e) => {
                setIncludeInactive(e.target.checked);
                setReport(null);
              }}
            />{" "}
            Include competitor records marked lost or inactive
          </label>
          <p className={styles.help}>
            Own-site records always retain membership. Relationship filters
            cannot turn an existing own-site record into a missing domain.
          </p>
        </details>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primary}
            onClick={() => void compare()}
            disabled={busy || inputs.length < 2}
          >
            {busy ? (
              <Loader2 className={styles.spin} size={18} aria-hidden />
            ) : (
              <GitCompareArrows size={18} aria-hidden />
            )}
            {busy ? "Comparing records…" : "Compare supplied backlinks"}
          </button>
        </div>
      </div>
      <p className={styles.notice} role="status" aria-live="polite">
        {message}
      </p>
      {manualCopy && (
        <label className={styles.label}>
          Source URLs to copy
          <textarea readOnly value={manualCopy} rows={6} />
        </label>
      )}
      {report && (
        <div
          ref={resultRef}
          tabIndex={-1}
          className={styles.results}
          aria-label="Backlink gap results"
        >
          <div className={styles.resultHeader}>
            <div>
              <p className={styles.eyebrow}>
                MISSING FROM YOUR EXPORT DOES NOT MEAN MISSING FROM THE WEB
              </p>
              <h2>Your referring-source comparison</h2>
              <p>
                Based on {report.datasets.length} supplied datasets. No pages or
                backlink databases were queried.
              </p>
            </div>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => {
                setFilters(defaultFilters);
                setPage(0);
              }}
            >
              Reset filters
            </button>
          </div>
          <div className={styles.stats}>
            {[
              [
                "missing",
                "Missing from your export",
                report.groups.filter((g) => !g.own.length && g.matches).length,
              ],
              [
                "all-competitors",
                "All competitors, missing for you",
                report.groups.filter(
                  (g) => !g.own.length && g.matches === competitors.length,
                ).length,
              ],
              [
                "shared",
                "Shared with competitors",
                report.groups.filter((g) => g.own.length && g.matches).length,
              ],
              [
                "own-only",
                "Only in your export",
                report.groups.filter((g) => g.own.length && !g.matches).length,
              ],
            ].map(([kind, label, count]) => (
              <button
                type="button"
                key={String(kind)}
                aria-pressed={filters.kind === kind}
                onClick={() =>
                  changeFilter({ kind: kind as Filters["kind"], minimum: 1 })
                }
              >
                <strong>{count}</strong>
                <span>{label}</span>
              </button>
            ))}
          </div>
          <div className={styles.coverage}>
            <h3>Check your data coverage first</h3>
            <p>
              Different export dates, providers, filters, and sampling can
              create apparent gaps. Presence here is imported evidence, not live
              verification.
            </p>
            {provenance.length > 1 && (
              <p className={styles.warning}>
                These datasets use different provider labels. Compare their
                coverage before treating an apparent gap as an outreach
                opportunity.
              </p>
            )}
            <div className={styles.tableScroll}>
              <table>
                <caption className={styles.hidden}>
                  Imported dataset coverage
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Website</th>
                    <th scope="col">Provider / export date</th>
                    <th scope="col">Read</th>
                    <th scope="col">Accepted</th>
                    <th scope="col">Duplicates</th>
                    <th scope="col">Skipped</th>
                  </tr>
                </thead>
                <tbody>
                  {report.datasets.map((d) => (
                    <tr key={d.id}>
                      <th scope="row">
                        {d.site}
                        {d.id === "own" && <small>Your site</small>}
                      </th>
                      <td>
                        {d.provider}
                        <small>{d.date || "Date not supplied"}</small>
                      </td>
                      <td>{d.imported}</td>
                      <td>
                        {d.rows.length}
                        <small>
                          {d.rows.filter((r) => !r.sourceUrl).length}{" "}
                          domain-only
                        </small>
                      </td>
                      <td>{d.duplicates}</td>
                      <td>{d.invalid + d.internal + d.foreign}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.help}>
              {report.excludedInactive} inactive competitor records excluded.{" "}
              {report.excludedSites} records from compared websites excluded as
              prospects.
            </p>
            {report.datasets.some((d) => d.issues.length > 0) && (
              <details>
                <summary>Review skipped import records</summary>
                {report.datasets
                  .filter((d) => d.issues.length)
                  .map((d) => (
                    <div key={d.id}>
                      <h4>{d.site}</h4>
                      <ul>
                        {d.issues.slice(0, 8).map((issue, i) => (
                          <li key={i}>
                            Record {issue.record}: {issue.reason}.{" "}
                            <code>{issue.value}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                <p className={styles.help}>
                  Up to 50 issue examples are retained per dataset. Totals above
                  include all skipped records.
                </p>
                <button
                  type="button"
                  className={styles.smallButton}
                  onClick={() =>
                    download(
                      issuesCsv(report.datasets),
                      "backlink-import-issue-examples.csv",
                    )
                  }
                >
                  Export retained issue examples
                </button>
              </details>
            )}
          </div>
          <div className={styles.filters}>
            <label className={styles.label}>
              Comparison view
              <select
                value={filters.kind}
                onChange={(e) =>
                  changeFilter({ kind: e.target.value as Filters["kind"] })
                }
              >
                <option value="missing">Missing from your export</option>
                <option value="all-competitors">
                  All competitors, missing for you
                </option>
                <option value="shared">Shared with competitors</option>
                <option value="own-only">Only in your export</option>
                <option value="all">All supplied referring groups</option>
              </select>
            </label>
            <label className={styles.label}>
              Review status
              <select
                value={filters.review}
                onChange={(e) =>
                  changeFilter({ review: e.target.value as Filters["review"] })
                }
              >
                <option value="any">Any review status</option>
                <option value="review">Needs review</option>
                <option value="shortlist">Shortlisted</option>
                <option value="skip">Skipped</option>
              </select>
            </label>
            <label className={styles.label}>
              Search sources and imported context
              <input
                type="search"
                value={filters.query}
                maxLength={200}
                onChange={(e) => changeFilter({ query: e.target.value })}
                placeholder="Domain, page URL, title, or anchor"
              />
            </label>
          </div>
          <details className={styles.optional}>
            <summary>
              More filters
              {filters.minimum > 1 ||
              filters.relationship !== "any" ||
              filters.excluded.trim()
                ? " · Active"
                : ""}
            </summary>
            <div className={styles.filters}>
              <label className={styles.label}>
                Minimum competitors
                <select
                  value={filters.minimum}
                  disabled={filters.kind === "own-only"}
                  onChange={(e) =>
                    changeFilter({ minimum: Number(e.target.value) })
                  }
                >
                  {competitors.map((_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.label}>
                Competitor relationship evidence
                <select
                  value={filters.relationship}
                  disabled={filters.kind === "own-only"}
                  onChange={(e) =>
                    changeFilter({
                      relationship: e.target.value as Filters["relationship"],
                    })
                  }
                >
                  <option value="any">Any supplied relationship</option>
                  <option value="qualified">
                    nofollow, sponsored, or ugc recorded
                  </option>
                  <option value="no-nofollow-recorded">
                    No nofollow recorded
                  </option>
                  <option value="unknown">Relationship unknown</option>
                </select>
              </label>
              <label className={styles.label}>
                Exclude referring domains or hosts
                <input
                  value={filters.excluded}
                  maxLength={10000}
                  onChange={(e) => changeFilter({ excluded: e.target.value })}
                  placeholder="publisher.com, another-site.com"
                />
              </label>
            </div>
            <p className={styles.help}>
              Relationship filters select groups with matching competitor
              evidence. Counts and exports retain all accepted evidence for
              those groups.
            </p>
          </details>
          <div className={styles.toolbar}>
            <span>
              {filtered.length} of {report.groups.length} referring groups shown
            </span>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondary}
                onClick={() =>
                  download(
                    gapCsv(report, filtered, reviews),
                    "backlink-gap-summary.csv",
                  )
                }
              >
                <Download size={15} aria-hidden /> Export filtered summary
              </button>
              <button
                type="button"
                className={styles.secondary}
                onClick={() =>
                  download(
                    evidenceCsv(report, filtered),
                    "backlink-gap-evidence.csv",
                  )
                }
              >
                Export filtered evidence
              </button>
              <button
                type="button"
                className={styles.secondary}
                onClick={saveReview}
              >
                <Save size={15} aria-hidden /> Save review
              </button>
              <button
                type="button"
                className={styles.secondary}
                onClick={loadReview}
              >
                Load saved review
              </button>
            </div>
          </div>
          <div className={styles.tableScroll}>
            <table className={styles.matrix}>
              <caption>
                Counts are accepted imported records per website, not total
                backlinks or authority scores.
              </caption>
              <thead>
                <tr>
                  <th scope="col">
                    Referring {report.grouping === "domain" ? "domain" : "host"}
                  </th>
                  <th scope="col">Your site</th>
                  {competitors.map((d) => (
                    <th scope="col" key={d.id}>
                      {d.site}
                    </th>
                  ))}
                  <th scope="col">Review decision</th>
                </tr>
              </thead>
              <tbody>
                {filtered
                  .slice(safePage * pageSize, (safePage + 1) * pageSize)
                  .map((group, i) => (
                    <React.Fragment key={group.key}>
                      <tr>
                        <th scope="row">
                          <button
                            type="button"
                            className={styles.domainButton}
                            aria-expanded={open === group.key}
                            aria-controls={`gap-evidence-${i}`}
                            onClick={() =>
                              setOpen(open === group.key ? null : group.key)
                            }
                          >
                            {group.key}{" "}
                            <span aria-hidden>
                              {open === group.key ? "−" : "+"}
                            </span>
                          </button>
                          <small>
                            {category(group)} · {group.matches}{" "}
                            {group.matches === 1 ? "competitor" : "competitors"}
                          </small>
                        </th>
                        <td>
                          <span
                            className={
                              group.own.length ? styles.present : styles.missing
                            }
                          >
                            {group.own.length || "Not supplied"}
                          </span>
                        </td>
                        {competitors.map((d) => (
                          <td key={d.id}>
                            <span
                              className={
                                group.competitors[d.id]?.length
                                  ? styles.present
                                  : styles.absent
                              }
                            >
                              {group.competitors[d.id]?.length || "0"}
                            </span>
                          </td>
                        ))}
                        <td>
                          <label
                            className={styles.hidden}
                            htmlFor={`review-${i}`}
                          >
                            Review decision for {group.key}
                          </label>
                          <select
                            id={`review-${i}`}
                            value={reviews[group.key]?.status || "review"}
                            onChange={(e) =>
                              review(group.key, {
                                status: e.target.value as Review["status"],
                              })
                            }
                          >
                            <option value="review">Needs review</option>
                            <option value="shortlist">Shortlist</option>
                            <option value="skip">Skip</option>
                          </select>
                        </td>
                      </tr>
                      {open === group.key && (
                        <tr>
                          <td
                            colSpan={competitors.length + 3}
                            id={`gap-evidence-${i}`}
                            className={styles.expanded}
                          >
                            <div className={styles.evidenceHeader}>
                              <div>
                                <h3>Imported evidence for {group.key}</h3>
                                <p>
                                  {group.own.length
                                    ? "Your export contains a record for this referring group."
                                    : "No accepted record for this group appeared in your own supplied dataset."}
                                </p>
                              </div>
                              <button
                                type="button"
                                className={styles.secondary}
                                disabled={!verificationSources(group).length}
                                onClick={() => void copySources([group])}
                              >
                                <Copy size={15} aria-hidden /> Copy supplied
                                source URLs
                              </button>
                            </div>
                            <label className={styles.label}>
                              Your review note
                              <textarea
                                value={reviews[group.key]?.note || ""}
                                maxLength={1000}
                                rows={2}
                                onChange={(e) =>
                                  review(group.key, { note: e.target.value })
                                }
                                placeholder="Record relevance, a possible resource, or your next review step."
                              />
                            </label>
                            {[
                              ...group.own,
                              ...Object.values(group.competitors).flat(),
                            ]
                              .slice(0, 50)
                              .map((record, j) => {
                                const dataset = report.datasets.find(
                                  (d) => d.id === record.datasetId,
                                )!;
                                return (
                                  <div className={styles.evidence} key={j}>
                                    <div className={styles.evidenceMeta}>
                                      <strong>{dataset.site}</strong>
                                      <span>
                                        {dataset.provider} ·{" "}
                                        {dataset.date || "Date not supplied"} ·
                                        Record {record.record}
                                      </span>
                                    </div>
                                    <p>
                                      {record.sourceUrl ? (
                                        <a
                                          href={record.sourceUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {record.sourceUrl} ↗
                                        </a>
                                      ) : (
                                        <strong>
                                          Domain-only record: {record.host}
                                        </strong>
                                      )}
                                    </p>
                                    {record.target && (
                                      <p>Supplied target: {record.target}</p>
                                    )}
                                    {record.anchor && (
                                      <p>
                                        Supplied anchor:{" "}
                                        <strong>{record.anchor}</strong>
                                      </p>
                                    )}
                                    {record.title && (
                                      <p>Supplied title: {record.title}</p>
                                    )}
                                    <div className={styles.tags}>
                                      <span>
                                        {record.relationship === "unknown"
                                          ? "Relationship unknown"
                                          : record.rel.join(", ") ||
                                            "No nofollow recorded"}
                                      </span>
                                      <span>
                                        {record.state === "inactive"
                                          ? "Marked lost or inactive"
                                          : record.state === "unknown"
                                            ? "Link status unknown"
                                            : "Not marked inactive"}
                                      </span>
                                      <span>Not live verified</span>
                                    </div>
                                    {record.metric && (
                                      <p>
                                        Imported {record.metricName}:{" "}
                                        {record.metric} · Provider:{" "}
                                        {dataset.provider}. This metric is not
                                        used to rank prospects.
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            {group.records > 50 && (
                              <p className={styles.help}>
                                Showing the first 50 accepted records. Export
                                filtered evidence for all records in the current
                                selection.
                              </p>
                            )}
                            {!verificationSources(group).length && (
                              <p className={styles.warning}>
                                This group has domain-only competitor records.
                                Import linking-page URLs before trying to verify
                                the placements.
                              </p>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>
          {!filtered.length && (
            <p className={styles.empty}>
              No referring groups match these filters. Reset filters or review
              the imported coverage.
            </p>
          )}
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.secondary}
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            >
              Previous
            </button>
            <span>
              Page {safePage + 1} of {pages}
            </span>
            <button
              type="button"
              className={styles.secondary}
              disabled={safePage >= pages - 1}
              onClick={() => setPage(safePage + 1)}
            >
              Next
            </button>
          </div>
          <aside className={styles.nextStep}>
            <div>
              <h3>Verify a shortlist before outreach</h3>
              <p>
                Copy supplied competitor source URLs, then check the exact
                placements in our backlink verifier.
              </p>
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondary}
                onClick={() =>
                  void copySources(
                    report.groups.filter(
                      (g) => reviews[g.key]?.status === "shortlist",
                    ),
                  )
                }
              >
                Copy shortlisted source URLs
              </button>
              <Link
                className={styles.primary}
                href="/tools/backlink-verification-tool"
              >
                Open Backlink Verification Tool ↗
              </Link>
            </div>
          </aside>
        </div>
      )}
      <p className={styles.privacy}>
        Your imports are processed in this browser. Downloaded projects include
        source data. Saving a review stores only decisions and notes on this
        device.
      </p>
    </section>
  );
}
