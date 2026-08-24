"use client";

import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Download,
  ExternalLink,
  FileCode2,
  Globe2,
  Info,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import ScoreRing from "@/components/ai-tools/ScoreRing";
import {
  schemaDownloadName,
  serializeJsonLd,
  serializeSchemaScript,
} from "../compiler";
import { getSchemaDefinition } from "../config";
import type { SchemaEvaluation, SchemaFormState } from "../types";

type Props = {
  state: SchemaFormState;
  evaluation: SchemaEvaluation;
};

const issueStyles = {
  error: {
    icon: AlertCircle,
    className:
      "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200",
  },
  warning: {
    icon: AlertCircle,
    className:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200",
  },
  recommendation: {
    icon: Info,
    className:
      "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200",
  },
  pass: {
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200",
  },
} as const;

export default function SchemaCodePanel({ state, evaluation }: Props) {
  const [format, setFormat] = useState<"script" | "json">("script");
  const [notice, setNotice] = useState("");
  const jsonCode = useMemo(() => serializeJsonLd(state), [state]);
  const scriptCode = useMemo(() => serializeSchemaScript(state), [state]);
  const code = format === "script" ? scriptCode : jsonCode;
  const definition = getSchemaDefinition(state.schemaType);
  const canGoogleTest =
    definition.support === "google" || definition.support === "limited";

  async function copyCode(message = "Code copied to your clipboard.") {
    try {
      await navigator.clipboard.writeText(scriptCode);
      setNotice(message);
      window.setTimeout(() => setNotice(""), 3_200);
    } catch {
      setNotice(
        "Clipboard access was blocked. Select the code and copy it manually.",
      );
    }
  }

  function download(content: string, extension: "jsonld" | "html") {
    const blob = new Blob([content], {
      type:
        extension === "jsonld"
          ? "application/ld+json;charset=utf-8"
          : "text/html;charset=utf-8",
    });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = schemaDownloadName(state, extension);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(href);
    setNotice(
      `${extension === "jsonld" ? "JSON-LD" : "HTML"} file downloaded.`,
    );
  }

  function openLiveTest(kind: "google" | "schema") {
    if (!/^https?:\/\//i.test(state.pageUrl)) {
      setNotice("Add a valid live page URL first.");
      return;
    }
    const target =
      kind === "google"
        ? `https://search.google.com/test/rich-results?url=${encodeURIComponent(state.pageUrl)}`
        : `https://validator.schema.org/#url=${encodeURIComponent(state.pageUrl)}`;
    window.open(target, "_blank", "noopener,noreferrer");
  }

  function copyAndOpen(target: "google" | "schema") {
    const url =
      target === "google"
        ? "https://search.google.com/test/rich-results"
        : "https://validator.schema.org/";
    window.open(url, "_blank", "noopener,noreferrer");
    void copyCode(
      target === "google"
        ? "Code copied. Choose Code in Google’s tool, paste, and run the test."
        : "Code copied. Paste it into Schema.org Validator and run the test.",
    );
  }

  const visibleIssues = evaluation.issues.slice(0, 12);

  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      <section className="overflow-hidden rounded-[26px] border border-slate-800 bg-slate-950 text-white shadow-[0_28px_80px_-36px_rgba(15,23,42,0.85)]">
        <div className="border-b border-white/10 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.15em] text-blue-200">
                <Code2 className="h-3.5 w-3.5" /> Live JSON-LD compiler
              </div>
              <h2 className="mt-3 text-xl font-black">
                Publish-ready workspace
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Empty optional properties are omitted. Connected nodes reuse
                stable @id references.
              </p>
            </div>
            <ScoreRing score={evaluation.score} label="Schema readiness" />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              [
                `${evaluation.requiredComplete}/${evaluation.requiredTotal}`,
                "Required",
              ],
              [
                `${evaluation.recommendedComplete}/${evaluation.recommendedTotal}`,
                "Recommended",
              ],
              [String(evaluation.nodeCount), "Graph nodes"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 bg-white/[0.05] p-3 text-center"
              >
                <p className="text-sm font-black text-white">{value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div
            className={`mt-4 flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold ${
              evaluation.publishReady
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                : "border-amber-400/20 bg-amber-400/10 text-amber-200"
            }`}
          >
            {evaluation.publishReady ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {evaluation.publishReady
              ? "Ready for external validation"
              : "Complete the required checks before publishing"}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="flex rounded-lg bg-white/[0.06] p-1">
            <button
              type="button"
              onClick={() => setFormat("script")}
              className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition ${
                format === "script"
                  ? "bg-white text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Script tag
            </button>
            <button
              type="button"
              onClick={() => setFormat("json")}
              className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition ${
                format === "json"
                  ? "bg-white text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Raw JSON-LD
            </button>
          </div>
          <button
            type="button"
            onClick={() => void copyCode()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#5271ff] px-3 py-2 text-xs font-extrabold text-white transition hover:bg-[#6682ff]"
          >
            <ClipboardCheck className="h-3.5 w-3.5" /> Copy code
          </button>
        </div>

        <div className="max-h-[560px] overflow-auto bg-[#07101f] py-4 font-mono text-[11px] leading-5 sm:text-xs">
          {code.split("\n").map((line, index) => (
            <div
              key={`${index}-${line}`}
              className="grid min-w-max grid-cols-[46px_minmax(0,1fr)] px-3 hover:bg-white/[0.035]"
            >
              <span className="select-none pr-3 text-right text-slate-600">
                {index + 1}
              </span>
              <span className="whitespace-pre pr-5 text-blue-100">{line}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-2 border-t border-white/10 p-4 sm:grid-cols-2 sm:p-5">
          <button
            type="button"
            onClick={() => download(jsonCode, "jsonld")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10"
          >
            <Download className="h-4 w-4" /> Download .jsonld
          </button>
          <button
            type="button"
            onClick={() => download(scriptCode, "html")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10"
          >
            <FileCode2 className="h-4 w-4" /> Download .html
          </button>
        </div>
      </section>

      {notice && (
        <div
          className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-semibold leading-5 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200"
          role="status"
        >
          {notice}
        </div>
      )}

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-[#5271ff]" />
          <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
            Validate and test
          </h3>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
          Schema.org Validator checks general vocabulary and syntax. Google’s
          tool checks only supported rich-result features. External tools do not
          publish the code for you.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => copyAndOpen("schema")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:border-[#5271ff]/40 hover:text-[#5271ff] dark:border-slate-700 dark:text-slate-200"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Copy & open validator
          </button>
          <button
            type="button"
            onClick={() => copyAndOpen("google")}
            disabled={!canGoogleTest}
            title={
              canGoogleTest
                ? "Copy the code and open Google Rich Results Test"
                : "This type has no current dedicated Google rich-result test"
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:border-[#5271ff]/40 hover:text-[#5271ff] disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
          >
            <Sparkles className="h-3.5 w-3.5" /> Copy & open Google test
          </button>
          <button
            type="button"
            onClick={() => openLiveTest("schema")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Validate live URL
          </button>
          <button
            type="button"
            onClick={() => openLiveTest("google")}
            disabled={!canGoogleTest}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5271ff] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#4662df] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Test live rich results
          </button>
        </div>
        <p className="mt-3 text-[11px] leading-4 text-slate-400">
          Modern Google tools do not document a stable cross-site code-prefill
          interface. The code action therefore copies the snippet and opens the
          official Code tab workflow safely.
        </p>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
          Readiness checks
        </h3>
        <div className="mt-4 max-h-[390px] space-y-2 overflow-auto pr-1">
          {visibleIssues.map((entry) => {
            const style = issueStyles[entry.severity];
            const Icon = style.icon;
            return (
              <div
                key={entry.id}
                className={`rounded-xl border p-3 ${style.className}`}
              >
                <div className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="text-xs font-extrabold">{entry.title}</p>
                    <p className="mt-1 text-[11px] leading-4 opacity-90">
                      {entry.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
