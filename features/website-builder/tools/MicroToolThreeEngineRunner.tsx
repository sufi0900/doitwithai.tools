"use client";

import React, { useMemo, useState } from "react";
import { Calculator, CheckCircle2, Mail, Sparkles } from "lucide-react";
import { evaluateSafeFormula, type MathVariables } from "./safe-math-ast";
import type { BuilderMicroToolConfig } from "./microtool-catalog-48";

function formatMetricValue(val: number, fmt: "currency" | "percent" | "number" | "years" | "months"): string {
  if (!Number.isFinite(val)) return "—";
  if (fmt === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: val >= 100 ? 0 : 2,
    }).format(val);
  }
  if (fmt === "percent") return `${val}%`;
  if (fmt === "years") return `${val} yrs`;
  if (fmt === "months") return `${val} mos`;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(val);
}

export function MicroToolThreeEngineRunner({
  config,
  accentHex = "#2563eb",
  surfaceHex = "#0f172a",
  textPrimary = "#f8fafc",
  textSecondary = "#cbd5e1",
  isLight = false,
}: {
  config: BuilderMicroToolConfig;
  accentHex?: string;
  surfaceHex?: string;
  textPrimary?: string;
  textSecondary?: string;
  isLight?: boolean;
}) {
  // Engine 1: Calculator state
  const initialVars = useMemo(() => {
    const map: MathVariables = {};
    for (const inp of config.calculator?.inputs ?? []) {
      map[inp.id] = inp.defaultValue;
    }
    return map;
  }, [config]);

  const [calcVars, setCalcVars] = useState<MathVariables>(initialVars);

  // Engine 2: Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const q of config.quiz?.questions ?? []) {
      init[q.id] = q.options[1]?.points ?? q.options[0]?.points ?? 20;
    }
    return init;
  });

  // Engine 3: AI Wrapper state
  const [aiFields, setAiFields] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of config.aiWrapper?.fields ?? []) {
      init[f.id] = f.defaultValue;
    }
    return init;
  });
  const [aiGenerated, setAiGenerated] = useState(false);

  // Shared lead-capture email gate
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCaptured, setLeadCaptured] = useState(false);

  const borderColor = isLight ? "#e2e8f0" : "rgba(148, 163, 184, 0.22)";
  const inputBg = isLight ? "#f8fafc" : "rgba(9, 14, 28, 0.85)";

  return (
    <section
      className="wb-microtool-engine-shell"
      aria-label={config.title}
      style={{
        background: surfaceHex,
        border: `1px solid ${borderColor}`,
        borderRadius: "16px",
        padding: "24px",
        color: textPrimary,
        display: "grid",
        gap: "20px",
      }}
    >
      <header style={{ display: "grid", gap: "8px", borderBottom: `1px solid ${borderColor}`, paddingBottom: "16px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: accentHex,
            }}
          >
            {config.eyebrow}
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: "999px",
              background: isLight ? "#eff6ff" : "rgba(37, 99, 235, 0.18)",
              color: accentHex,
            }}
          >
            {config.engine === "calculator_ast"
              ? "Engine 1 · Safe Formula AST ($0 Runtime)"
              : config.engine === "scored_quiz"
                ? "Engine 2 · Scored Diagnostic ($0 Runtime)"
                : "Engine 3 · AI Prompt-Wrapper"}
          </span>
        </div>
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: textPrimary }}>{config.title}</h2>
        <p style={{ margin: 0, fontSize: "14px", color: textSecondary, lineHeight: 1.6 }}>{config.summary}</p>
      </header>

      {/* ENGINE 1: SAFE FORMULA CALCULATOR */}
      {config.engine === "calculator_ast" && config.calculator && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "20px",
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: "14px" }}>
            {config.calculator.inputs.map((inp) => {
              const current = calcVars[inp.id] ?? inp.defaultValue;
              return (
                <label key={inp.id} style={{ display: "grid", gap: "6px", fontSize: "13px", fontWeight: 700 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{inp.label}</span>
                    <span style={{ color: accentHex, fontFamily: "monospace", fontSize: "13.5px" }}>
                      {inp.unit === "$" ? `$${current.toLocaleString()}` : `${current.toLocaleString()} ${inp.unit ?? ""}`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={inp.min}
                    max={inp.max}
                    step={inp.step}
                    value={current}
                    onChange={(e) =>
                      setCalcVars((prev) => ({
                        ...prev,
                        [inp.id]: Number(e.target.value),
                      }))
                    }
                    style={{ width: "100%", accentColor: accentHex, cursor: "pointer" }}
                  />
                </label>
              );
            })}
          </div>

          <div
            style={{
              display: "grid",
              gap: "12px",
              padding: "18px",
              borderRadius: "12px",
              background: inputBg,
              border: `1px solid ${borderColor}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 800, color: accentHex, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <Calculator size={14} /> Instant Calculated Breakdown
            </div>
            {config.calculator.outputs.map((out) => {
              const val = evaluateSafeFormula(out.formula, calcVars);
              return (
                <div
                  key={out.id}
                  style={{
                    padding: out.highlight ? "14px" : "10px 12px",
                    borderRadius: "10px",
                    background: out.highlight
                      ? isLight
                        ? "#eff6ff"
                        : "rgba(37, 99, 235, 0.16)"
                      : "transparent",
                    border: out.highlight ? `1px solid ${accentHex}` : `1px solid ${borderColor}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span style={{ fontSize: "13px", color: textSecondary, fontWeight: 600 }}>{out.label}</span>
                  <strong style={{ fontSize: out.highlight ? "20px" : "15px", color: textPrimary, fontFamily: "monospace" }}>
                    {formatMetricValue(val, out.format)}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ENGINE 2: SCORED QUIZ & AUDIT ENGINE */}
      {config.engine === "scored_quiz" && config.quiz && (
        <div style={{ display: "grid", gap: "18px" }}>
          <div style={{ display: "grid", gap: "14px" }}>
            {config.quiz.questions.map((q, qIndex) => (
              <fieldset
                key={q.id}
                style={{
                  border: `1px solid ${borderColor}`,
                  borderRadius: "12px",
                  padding: "14px 16px",
                  background: inputBg,
                  display: "grid",
                  gap: "10px",
                }}
              >
                <legend style={{ fontSize: "13.5px", fontWeight: 700, color: textPrimary, padding: "0 4px" }}>
                  {qIndex + 1}. {q.question}
                </legend>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {q.options.map((opt) => {
                    const selected = quizAnswers[q.id] === opt.points;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: opt.points }))}
                        style={{
                          padding: "8px 13px",
                          borderRadius: "8px",
                          border: selected ? `1.5px solid ${accentHex}` : `1px solid ${borderColor}`,
                          background: selected
                            ? isLight
                              ? "#eff6ff"
                              : "rgba(37, 99, 235, 0.22)"
                            : "transparent",
                          color: textPrimary,
                          fontSize: "12.5px",
                          fontWeight: selected ? 700 : 500,
                          cursor: "pointer",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          {(() => {
            const totalScore = Object.values(quizAnswers).reduce((acc, v) => acc + v, 0);
            const matchedTier =
              config.quiz.tiers.find((t) => totalScore >= t.minScore && totalScore <= t.maxScore) ??
              config.quiz.tiers[config.quiz.tiers.length - 1];
            return (
              <div
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  border: `1.5px solid ${accentHex}`,
                  background: isLight ? "#eff6ff" : "rgba(37, 99, 235, 0.14)",
                  display: "grid",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: accentHex, letterSpacing: "0.08em" }}>
                    {matchedTier.badge}
                  </span>
                  <strong style={{ fontSize: "18px", fontFamily: "monospace", color: textPrimary }}>
                    Score: {totalScore} / 100
                  </strong>
                </div>
                <strong style={{ fontSize: "16px", color: textPrimary }}>{matchedTier.headline}</strong>
                <p style={{ margin: 0, fontSize: "13.5px", color: textSecondary }}>{matchedTier.recommendation}</p>
              </div>
            );
          })()}
        </div>
      )}

      {/* ENGINE 3: AI PROMPT-WRAPPER ENGINE */}
      {config.engine === "ai_prompt_wrapper" && config.aiWrapper && (
        <div style={{ display: "grid", gap: "16px" }}>
          <div style={{ display: "grid", gap: "12px" }}>
            {config.aiWrapper.fields.map((field) => (
              <label key={field.id} style={{ display: "grid", gap: "5px", fontSize: "13px", fontWeight: 700 }}>
                <span>{field.label}</span>
                <input
                  value={aiFields[field.id] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(e) => setAiFields((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                    background: inputBg,
                    color: textPrimary,
                    fontSize: "13px",
                  }}
                />
              </label>
            ))}
            <button
              type="button"
              onClick={() => setAiGenerated(true)}
              style={{
                justifySelf: "start",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "10px 18px",
                borderRadius: "9px",
                border: "none",
                background: accentHex,
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <Sparkles size={15} /> {config.ctaLabel}
            </button>
          </div>

          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              background: inputBg,
              border: `1px solid ${borderColor}`,
              display: "grid",
              gap: "8px",
            }}
          >
            <strong style={{ fontSize: "15px", color: textPrimary }}>
              {aiGenerated ? `Generated: ${config.aiWrapper.sampleOutputTitle}` : config.aiWrapper.sampleOutputTitle}
            </strong>
            <ul style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "6px" }}>
              {config.aiWrapper.sampleOutputBullets.map((b, i) => (
                <li key={i} style={{ fontSize: "13px", color: textSecondary, lineHeight: 1.55 }}>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* BUILT-IN LEAD CAPTURE HOOK */}
      <footer
        style={{
          borderTop: `1px solid ${borderColor}`,
          paddingTop: "14px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: textSecondary }}>
          <Mail size={15} style={{ color: accentHex }} />
          <span>{config.leadMagnetHook}</span>
        </div>
        {leadCaptured ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: 700, color: "#10b981" }}>
            <CheckCircle2 size={15} /> Sent to {leadEmail}
          </span>
        ) : (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input
              type="email"
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
              placeholder="Enter email for full report..."
              aria-label="Email for full report"
              style={{
                padding: "7px 11px",
                borderRadius: "7px",
                border: `1px solid ${borderColor}`,
                background: inputBg,
                color: textPrimary,
                fontSize: "12.5px",
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (leadEmail.includes("@")) setLeadCaptured(true);
              }}
              style={{
                padding: "7px 13px",
                borderRadius: "7px",
                border: "none",
                background: accentHex,
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Send Report
            </button>
          </div>
        )}
      </footer>
    </section>
  );
}
