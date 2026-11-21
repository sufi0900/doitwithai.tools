"use client";

import React, { useState } from "react";
import { CheckCircle2, Code2, ShieldCheck, Upload } from "lucide-react";
import { MICROTOOL_VERTICALS, type MicroToolVerticalId } from "../tools/microtool-catalog-48";

export function CustomToolSubmissionPanel({
  workspaceId,
  projectId,
}: {
  workspaceId: string;
  projectId: string;
}) {
  const [open, setOpen] = useState(false);
  const [toolName, setToolName] = useState("");
  const [vertical, setVertical] = useState<MicroToolVerticalId>("b2b-saas-consultants");
  const [framework, setFramework] = useState<"react_tsx" | "html_css_js" | "vue" | "nextjs" | "python_streamlit" | "json_schema" | "other">("react_tsx");
  const [visibility, setVisibility] = useState<"private_to_site" | "global_directory_opt_in">("private_to_site");
  const [description, setDescription] = useState("");
  const [rawCode, setRawCode] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = toolName.trim().length >= 2 && description.trim().length >= 10 && rawCode.trim().length >= 20;

  return (
    <section
      aria-label="Submit Custom Tool Code"
      style={{
        borderRadius: "12px",
        border: "1px solid rgba(148, 163, 184, 0.25)",
        background: "rgba(15, 23, 42, 0.82)",
        padding: "12px 14px",
        display: "grid",
        gap: "10px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: "2px" }}>
          <span style={{ fontSize: "10px", fontWeight: 800, color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            PATH C · CUSTOM CODE INTAKE PIPELINE
          </span>
          <strong style={{ fontSize: "12.5px", color: "#f8fafc" }}>
            Have Your Own Tool Code? Submit for Backend Decode
          </strong>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            setSubmitted(false);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 11px",
            borderRadius: "8px",
            border: "1px solid rgba(56, 189, 248, 0.4)",
            background: "rgba(37, 99, 235, 0.22)",
            color: "#f8fafc",
            fontSize: "11.5px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <Code2 size={13} /> {open ? "Close Form" : "Submit Custom Tool"}
        </button>
      </div>

      {open && (
        <div style={{ display: "grid", gap: "10px", paddingTop: "6px", borderTop: "1px solid rgba(148, 163, 184, 0.16)" }}>
          <p style={{ margin: 0, fontSize: "11.5px", color: "#94a3b8", lineHeight: 1.5 }}>
            Paste code from any framework (React, HTML/JS, Vue, Next.js, or Python). Your submission is stored safely in our backend queue—never executed raw—and decoded into a brand-styled native Builder component.
          </p>

          {submitted ? (
            <div
              role="status"
              style={{
                padding: "12px",
                borderRadius: "10px",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.35)",
                display: "grid",
                gap: "4px",
                color: "#d1fae5",
                fontSize: "12px",
              }}
            >
              <strong style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#34d399" }}>
                <CheckCircle2 size={15} /> Custom Tool Queued for Backend Decode
              </strong>
              <span>
                Queued <strong>{toolName}</strong> ({framework}) for project <code>{projectId.slice(0, 8)}</code>. Once decoded and security-verified, it will appear in your Builder Tool Directory.
              </span>
            </div>
          ) : (
            <>
              <label style={{ display: "grid", gap: "4px", fontSize: "11.5px", fontWeight: 700, color: "#cbd5e1" }}>
                <span>Tool Name</span>
                <input
                  value={toolName}
                  maxLength={120}
                  placeholder="e.g., Commercial Solar Battery Payback Estimator"
                  onChange={(e) => setToolName(e.target.value)}
                  style={{
                    padding: "7px 10px",
                    borderRadius: "7px",
                    border: "1px solid rgba(148, 163, 184, 0.28)",
                    background: "rgba(9, 14, 28, 0.9)",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <label style={{ display: "grid", gap: "4px", fontSize: "11.5px", fontWeight: 700, color: "#cbd5e1" }}>
                  <span>Industry Vertical</span>
                  <select
                    value={vertical}
                    onChange={(e) => setVertical(e.target.value as MicroToolVerticalId)}
                    style={{
                      padding: "7px 8px",
                      borderRadius: "7px",
                      border: "1px solid rgba(148, 163, 184, 0.28)",
                      background: "rgba(9, 14, 28, 0.9)",
                      color: "#f8fafc",
                      fontSize: "11.5px",
                    }}
                  >
                    {MICROTOOL_VERTICALS.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ display: "grid", gap: "4px", fontSize: "11.5px", fontWeight: 700, color: "#cbd5e1" }}>
                  <span>Source Framework</span>
                  <select
                    value={framework}
                    onChange={(e) => setFramework(e.target.value as typeof framework)}
                    style={{
                      padding: "7px 8px",
                      borderRadius: "7px",
                      border: "1px solid rgba(148, 163, 184, 0.28)",
                      background: "rgba(9, 14, 28, 0.9)",
                      color: "#f8fafc",
                      fontSize: "11.5px",
                    }}
                  >
                    <option value="react_tsx">React / TSX</option>
                    <option value="html_css_js">HTML / CSS / JS</option>
                    <option value="nextjs">Next.js Component</option>
                    <option value="vue">Vue SFC</option>
                    <option value="python_streamlit">Python / Formula Logic</option>
                    <option value="json_schema">3-Engine JSON Config</option>
                    <option value="other">Other Framework</option>
                  </select>
                </label>
              </div>

              <label style={{ display: "grid", gap: "4px", fontSize: "11.5px", fontWeight: 700, color: "#cbd5e1" }}>
                <span>Directory Visibility After Approval</span>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as typeof visibility)}
                  style={{
                    padding: "7px 8px",
                    borderRadius: "7px",
                    border: "1px solid rgba(148, 163, 184, 0.28)",
                    background: "rgba(9, 14, 28, 0.9)",
                    color: "#f8fafc",
                    fontSize: "11.5px",
                  }}
                >
                  <option value="private_to_site">Private to My Website Only</option>
                  <option value="global_directory_opt_in">Allow Listing in Global Builder Directory</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: "4px", fontSize: "11.5px", fontWeight: 700, color: "#cbd5e1" }}>
                <span>Inputs, Formula / Logic &amp; Expected Output</span>
                <input
                  value={description}
                  maxLength={1200}
                  placeholder="Describe what inputs the visitor enters and how the result is calculated..."
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    padding: "7px 10px",
                    borderRadius: "7px",
                    border: "1px solid rgba(148, 163, 184, 0.28)",
                    background: "rgba(9, 14, 28, 0.9)",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: "4px", fontSize: "11.5px", fontWeight: 700, color: "#cbd5e1" }}>
                <span>Paste Tool Source Code (Stored Inert for Backend Decode)</span>
                <textarea
                  rows={5}
                  value={rawCode}
                  maxLength={150000}
                  placeholder="// Paste your component, HTML snippet, or formula code here..."
                  onChange={(e) => setRawCode(e.target.value)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "7px",
                    border: "1px solid rgba(148, 163, 184, 0.28)",
                    background: "rgba(9, 14, 28, 0.9)",
                    color: "#f8fafc",
                    fontFamily: "monospace",
                    fontSize: "11.5px",
                  }}
                />
              </label>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "10.5px", color: "#94a3b8" }}>
                  <ShieldCheck size={13} style={{ color: "#34d399" }} /> Workspace <code>{workspaceId.slice(0, 8)}</code> · Zero raw execution
                </span>
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={() => setSubmitted(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: canSubmit ? "#2563eb" : "rgba(148, 163, 184, 0.2)",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: canSubmit ? "pointer" : "not-allowed",
                  }}
                >
                  <Upload size={13} /> Submit to Backend Decode Queue
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
