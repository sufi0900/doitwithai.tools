"use client";
import { useRef, useState } from "react";
import { Copy, ArrowUpRight, ChevronDown } from "lucide-react";
import { fillPreview } from "./catalog";
import {
  chatGPTLink,
  contextFields,
  exampleContext,
  metaPromptSeries,
} from "./meta-workflow";
import styles from "./editorial.module.css";
function PromptBlock({
  item,
  values,
  index,
}: {
  item: (typeof metaPromptSeries)[number];
  values: Record<string, string>;
  index: number;
}) {
  const [status, setStatus] = useState({ text: "", message: "" });
  const text = fillPreview(item.template, values);
  const field = useRef<HTMLTextAreaElement>(null);
  const href = chatGPTLink(text);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus({ text, message: "Prompt copied. Review it before sending." });
    } catch {
      field.current?.focus();
      field.current?.select();
      setStatus({
        text,
        message:
          "Select and copy the highlighted prompt using your device’s copy command.",
      });
    }
  }
  return (
    <section
      className={styles.promptBlock}
      id={item.id}
      aria-labelledby={`${item.id}-title`}
    >
      <div className={styles.promptTop}>
        <span className={styles.number}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <p>{item.label}</p>
      </div>
      <h3 id={`${item.id}-title`}>{item.title}</h3>
      <p className={styles.blockIntro}>{item.intro}</p>
      <label className={styles.srOnly} htmlFor={`${item.id}-text`}>
        Prompt {index + 1}: {item.title}
      </label>
      <textarea
        id={`${item.id}-text`}
        ref={field}
        className={styles.promptCode}
        value={text}
        readOnly
        rows={12}
      />
      <div className={styles.promptActions}>
        <button onClick={copy} className={styles.copy}>
          <Copy size={16} aria-hidden="true" />
          Copy prompt
        </button>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.use}
          >
            Use in ChatGPT
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        ) : (
          <span className={styles.longNote}>
            This prompt is long. Copy it, then{" "}
            <a
              href="https://chatgpt.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              open ChatGPT
            </a>
            .
          </span>
        )}
      </div>
      <p className={styles.status} role="status">
        {status.text === text ? status.message : ""}
      </p>
      <div className={styles.after}>
        <strong>What to do with the result</strong>
        <p>{item.after}</p>
      </div>
    </section>
  );
}
export default function PromptSeries() {
  const [values, setValues] = useState<Record<string, string>>({});
  return (
    <>
      <div className={styles.context}>
        <div>
          <p className={styles.kicker}>ONE BRIEF FOR ALL FIVE PROMPTS</p>
          <h3>Add your page context</h3>
          <p>
            These optional fields replace the placeholders below. You can also
            copy a prompt and edit it in ChatGPT.
          </p>
        </div>
        <div className={styles.contextActions}>
          <button onClick={() => setValues({ ...exampleContext })}>
            Load illustrative example
          </button>
          <button onClick={() => setValues({})}>Clear</button>
        </div>
        <details>
          <summary>
            Customize the prompts <ChevronDown size={16} aria-hidden="true" />
          </summary>
          <div className={styles.contextGrid}>
            {contextFields.map((name) => (
              <label key={name}>
                {name}
                <textarea
                  rows={name === "Page content" ? 5 : 2}
                  maxLength={name === "Page content" ? 4000 : 600}
                  value={values[name] || ""}
                  placeholder={`Add ${name.toLowerCase()}…`}
                  onChange={(e) =>
                    setValues((previous) => ({
                      ...previous,
                      [name]: e.target.value,
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </details>
        <p className={styles.small}>
          Use in ChatGPT opens a new tab and shares that prompt with ChatGPT.
          Avoid confidential information.
        </p>
        <p className={styles.small}>
          If your session does not prefill the message, use Copy prompt and
          paste it. Review before sending.
        </p>
      </div>
      {metaPromptSeries.map((item, index) => (
        <PromptBlock key={item.id} item={item} values={values} index={index} />
      ))}
    </>
  );
}
