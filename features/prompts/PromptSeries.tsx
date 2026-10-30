"use client";
import { useRef, useState } from "react";
import {
  Copy,
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
  ChevronDown,
} from "lucide-react";
import { fillPreview } from "./catalog";
import {
  chatGPTLink,
  contextFields,
  exampleContext,
  metaPromptSeries,
  promptCount,
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
  const brief = useRef<HTMLDetailsElement>(null);
  const firstField = useRef<HTMLTextAreaElement>(null);
  const filledFields = contextFields.filter((name) =>
    values[name]?.trim(),
  ).length;
  function openBrief() {
    if (brief.current) brief.current.open = true;
    firstField.current?.focus({ preventScroll: true });
  }
  return (
    <>
      <div className={styles.context} id="prompt-customizer">
        <div>
          <p className={styles.kicker}>START HERE · YOUR PROMPT WORKSPACE</p>
          <h3>Customize all {promptCount} prompts with one page brief</h3>
          <p>
            Add the details you have. The prompts use the matching details as
            you type. Start with the example if you want to try it first.
          </p>
          <a className={styles.browsePrompts} href="#prompt-chooser">
            Browse all {promptCount} prompts first
            <ArrowDown size={16} aria-hidden="true" />
          </a>
        </div>
        <div className={styles.contextActions}>
          <button onClick={() => setValues({ ...exampleContext })}>
            Load illustrative example
          </button>
          <button onClick={() => setValues({})}>Clear</button>
        </div>
        <p className={styles.contextProgress} role="status">
          {filledFields} of {contextFields.length} context fields added. Your
          details fill the matching fields in the prompts below.
        </p>
        <details open ref={brief}>
          <summary>
            Your page brief <ChevronDown size={16} aria-hidden="true" />
          </summary>
          <div className={styles.contextGrid}>
            {contextFields.map((name) => (
              <label key={name}>
                {name}
                {name === "Related pages" ? (
                  <small>
                    For the page-group prompt. Include identifiers, summaries,
                    titles, and descriptions.
                  </small>
                ) : name === "Current title" ||
                  name === "Current description" ? (
                  <small>
                    Used by review and editing prompts. Add your selected draft
                    here.
                  </small>
                ) : null}
                <textarea
                  ref={name === "Page content" ? firstField : undefined}
                  rows={
                    name === "Page content" || name === "Related pages" ? 5 : 2
                  }
                  maxLength={
                    name === "Page content" || name === "Related pages"
                      ? 4000
                      : 600
                  }
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
      <nav
        className={styles.promptNavigator}
        id="prompt-chooser"
        aria-label="Choose a prompt"
      >
        <h3>Choose your starting point</h3>
        <div>
          {metaPromptSeries.map((item, index) => (
            <a key={item.id} href={`#${item.id}`}>
              {index + 1}. {item.label}
            </a>
          ))}
        </div>
      </nav>
      {metaPromptSeries.map((item, index) => (
        <PromptBlock key={item.id} item={item} values={values} index={index} />
      ))}
      <aside
        className={styles.customizeReturn}
        aria-labelledby="customize-return-title"
      >
        <div>
          <p className={styles.kicker}>MAKE THE PROMPTS YOURS</p>
          <h3 id="customize-return-title">
            One page brief. All {promptCount} prompts tailored.
          </h3>
          <p>
            Add or update your page details in the workspace above. Your
            existing entries stay in place while you explore.
          </p>
        </div>
        <a
          href="#prompt-customizer"
          className={styles.customizeLink}
          onClick={openBrief}
        >
          Customize all {promptCount} prompts
          <ArrowUp size={17} aria-hidden="true" />
        </a>
      </aside>
    </>
  );
}
