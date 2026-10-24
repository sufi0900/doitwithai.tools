"use client";
import { useRef, useState } from "react";
import { Copy } from "lucide-react";
import { fillPreview, type PromptPreview } from "./catalog";
import styles from "./prompts.module.css";
export default function PromptBuilder({
  prompt,
  example,
}: {
  prompt: PromptPreview;
  example: Record<string, string>;
}) {
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
            className={styles.textLink}
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
          className={styles.textLink}
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
        <label className={styles.srOnly} htmlFor="compiled-prompt">
          Customized prompt
        </label>
        <textarea
          id="compiled-prompt"
          ref={output}
          className={styles.promptText}
          rows={15}
          readOnly
          value={text}
        />
        <button className={styles.primary} onClick={copy}>
          <Copy size={16} aria-hidden="true" />
          Copy prompt
        </button>
        <p className={styles.copyStatus} role="status">
          {message || "Unfilled fields remain visible as {{placeholders}}."}
        </p>
      </div>
    </div>
  );
}
