"use client";
import { useId, useRef, useState } from "react";
import { chatGPTLink } from "./meta-workflow";
import { Copy, ArrowUpRight, Download, RotateCcw } from "lucide-react";
import { fillPreview, type PromptPreview } from "./catalog";
import styles from "./prompts.module.css";

export default function PromptBuilder({
  prompt,
  example,
}: {
  prompt: PromptPreview;
  example: Record<string, string>;
}) {
  const outputId = useId();
  const [values, setValues] = useState<Record<string, string>>(() => ({
    ...example,
  }));
  const [customOutput, setCustomOutput] = useState<string | null>(null);
  const [message, setMessage] = useState(
    "Sample context pre-loaded. Edit your context fields on the left or customize the prompt text directly on the right.",
  );
  const output = useRef<HTMLTextAreaElement>(null);
  const generatedText = fillPreview(prompt.template, values);
  const text = customOutput ?? generatedText;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Copied. Paste this into your preferred AI assistant.");
    } catch {
      output.current?.focus();
      output.current?.select();
      setMessage(
        "The prompt is selected. Copy it manually using your device’s copy command.",
      );
    }
  }

  function downloadTxt() {
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prompt.id || "seo-prompt"}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Downloaded customized prompt as .TXT.");
  }

  return (
    <div className={styles.workspaceGrid}>
      <div className={styles.inputPanel}>
        <div className={styles.outputTitle}>
          <h3>1. Add your context</h3>
          <button
            type="button"
            className={styles.utilityAction}
            onClick={() => {
              setValues({ ...example });
              setCustomOutput(null);
              setMessage(
                "Illustrative example loaded. Replace it with your own details.",
              );
            }}
          >
            Try example
          </button>
        </div>
        <p>
          Use real details from your content. Inputs stay here while this page
          is open.
        </p>
        {prompt.inputs.map((input) => (
          <label key={input}>
            {input}
            <textarea
              rows={4}
              maxLength={6000}
              value={values[input] || ""}
              placeholder={`Add ${input.toLowerCase()}…`}
              onChange={(event) => {
                setCustomOutput(null);
                setValues((previous) => ({
                  ...previous,
                  [input]: event.target.value,
                }));
                setMessage("");
              }}
            />
          </label>
        ))}
        <button
          type="button"
          className={styles.utilityAction}
          onClick={() => {
            setValues({});
            setCustomOutput(null);
            setMessage("Inputs cleared.");
          }}
        >
          Clear inputs
        </button>
      </div>
      <div className={styles.outputPanel}>
        <div className={styles.outputTitle}>
          <h3>2. Review, edit &amp; copy your prompt</h3>
          {customOutput !== null && (
            <button
              type="button"
              className={styles.utilityAction}
              onClick={() => {
                setCustomOutput(null);
                setMessage("Restored template-synced prompt.");
              }}
            >
              <RotateCcw size={13} aria-hidden="true" /> Reset edits
            </button>
          )}
        </div>
        <label className={styles.srOnly} htmlFor={outputId}>
          Customized prompt
        </label>
        <textarea
          id={outputId}
          ref={output}
          className={styles.promptText}
          rows={15}
          value={text}
          onChange={(e) => setCustomOutput(e.target.value)}
        />
        <p className={styles.copyStatus}>
          {text.length.toLocaleString()} characters · {wordCount} words{" "}
          {customOutput !== null ? "· Custom edited" : "· Live synced"}
        </p>
        <div className={styles.promptActions}>
          <button type="button" className={styles.primary} onClick={copy}>
            <Copy size={16} aria-hidden="true" />
            Copy prompt
          </button>
          <button
            type="button"
            className={styles.secondaryAction}
            onClick={downloadTxt}
          >
            <Download size={16} aria-hidden="true" />
            Download .TXT
          </button>
          {chatGPTLink(text) ? (
            <a
              className={styles.secondaryAction}
              href={chatGPTLink(text)!}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in ChatGPT
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ) : (
            <p>Copy this longer prompt into your assistant.</p>
          )}
        </div>
        <p className={styles.copyStatus} role="status">
          {message || "Unfilled fields remain visible as {{placeholders}}."}
        </p>
      </div>
    </div>
  );
}
