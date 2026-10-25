"use client";
import { useId, useRef, useState } from "react";
import { chatGPTLink } from "./meta-workflow";
import { Copy, ArrowUpRight } from "lucide-react";
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
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const output = useRef<HTMLTextAreaElement>(null);
  const text = fillPreview(prompt.template, values);
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
  return (
    <div className={styles.workspaceGrid}>
      <div className={styles.inputPanel}>
        <div className={styles.outputTitle}>
          <h3>1. Add your context</h3>
          <button
            className={styles.utilityAction}
            onClick={() => {
              setValues({ ...example });
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
          className={styles.utilityAction}
          onClick={() => {
            setValues({});
            setMessage("Inputs cleared.");
          }}
        >
          Clear inputs
        </button>
      </div>
      <div className={styles.outputPanel}>
        <h3>2. Copy your prompt</h3>
        <label className={styles.srOnly} htmlFor={outputId}>
          Customized prompt
        </label>
        <textarea
          id={outputId}
          ref={output}
          className={styles.promptText}
          rows={15}
          readOnly
          value={text}
        />
        <div className={styles.promptActions}>
          <button type="button" className={styles.primary} onClick={copy}>
            <Copy size={16} aria-hidden="true" />
            Copy prompt
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
