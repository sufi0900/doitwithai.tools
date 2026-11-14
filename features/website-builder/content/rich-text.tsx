"use client";

import { Bold, Italic, Link2, Underline } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { renderInlineText } from "./inline-text";

type Props = {
  label: string;
  value: string;
  maxLength: number;
  allowEmpty?: boolean;
  singleLine?: boolean;
  onCommit: (value: string) => void;
};

export function RichTextField({ label, value, maxLength, allowEmpty = true, singleLine = false, onCommit }: Props) {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  useEffect(() => setDraft(value), [value]);
  const normalized = useMemo(() => draft.trim(), [draft]);
  useEffect(() => {
    if (normalized === value || (!allowEmpty && !normalized)) return;
    const timer = window.setTimeout(() => onCommit(normalized), 5_000);
    return () => window.clearTimeout(timer);
  }, [allowEmpty, normalized, onCommit, value]);

  function commit() {
    if (!allowEmpty && !normalized) setDraft(value);
    else if (normalized !== value) onCommit(normalized);
  }

  function wrap(prefix: string, suffix = prefix, placeholder = "text") {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart ?? draft.length;
    const end = input.selectionEnd ?? start;
    const selected = draft.slice(start, end) || placeholder;
    const next = `${draft.slice(0, start)}${prefix}${selected}${suffix}${draft.slice(end)}`.slice(0, maxLength);
    setDraft(next);
    requestAnimationFrame(() => { input.focus(); input.setSelectionRange(start + prefix.length, start + prefix.length + selected.length); });
  }

  function link() {
    const url = window.prompt("Paste an https:// link");
    if (!url || !/^https:\/\//i.test(url.trim())) return;
    wrap("[", `](${url.trim()})`, "linked text");
  }

  return <div className="rich-field">
    <div className="rich-field-label"><span>{label}</span><small>{draft.length}/{maxLength}</small></div>
    <div className="rich-toolbar" aria-label={`${label} formatting`}>
      <button type="button" title="Bold" aria-label="Bold selected text" onClick={() => wrap("**")}><Bold size={14} /></button>
      <button type="button" title="Italic" aria-label="Italicize selected text" onClick={() => wrap("*")}><Italic size={14} /></button>
      <button type="button" title="Underline" aria-label="Underline selected text" onClick={() => wrap("++")}><Underline size={14} /></button>
      <button type="button" title="Link" aria-label="Link selected text" onClick={link}><Link2 size={14} /></button>
    </div>
    {singleLine
      ? <input ref={inputRef as React.RefObject<HTMLInputElement>} value={draft} maxLength={maxLength} onChange={(event) => setDraft(event.target.value)} onBlur={commit} />
      : <textarea ref={inputRef as React.RefObject<HTMLTextAreaElement>} value={draft} maxLength={maxLength} rows={7} onChange={(event) => setDraft(event.target.value)} onBlur={commit} />}
    {draft && <div className="rich-preview"><small>Formatting preview</small><p>{renderInlineText(draft)}</p></div>}
  </div>;
}
