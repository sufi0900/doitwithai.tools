"use client";

import { useState } from "react";
import { GUIDED_INTERVIEW_STEPS, type GuidedInterview, type GuidedInterviewKey } from "@/features/website-builder/domain/guided-interview";

export function GuidedInterviewPanel({ value, onChange, groundedFactCount }: {
  value: Partial<GuidedInterview>;
  onChange: (value: Partial<GuidedInterview>) => void;
  groundedFactCount: number;
}) {
  const [step, setStep] = useState(0);
  const current = GUIDED_INTERVIEW_STEPS[step];
  const answered = Object.keys(value).length;
  const selected = value[current.key];

  function answer(key: GuidedInterviewKey, option: string) {
    onChange({ ...value, [key]: option });
  }

  return <section className="design-interview" aria-labelledby="design-interview-title">
    <header className="interview-header">
      <div><span className="eyebrow">CV-GROUNDED DESIGN INTERVIEW</span><h2 id="design-interview-title">Turn your evidence into a clear direction</h2></div>
      <strong>{answered}/{GUIDED_INTERVIEW_STEPS.length}</strong>
    </header>
    <div className="interview-progress" aria-label={`Interview ${Math.round(answered / GUIDED_INTERVIEW_STEPS.length * 100)} percent complete`}><i style={{ width: `${answered / GUIDED_INTERVIEW_STEPS.length * 100}%` }} /></div>
    <div className="interview-context"><span>{groundedFactCount ? `${groundedFactCount} approved CV facts available` : "Manual profile facts"}</span><p>The interview controls presentation only. It cannot invent experience, credentials, skills, or results.</p></div>
    <div className="interview-turn" role="group" aria-labelledby={`interview-prompt-${step}`}>
      <small>Question {step + 1} of {GUIDED_INTERVIEW_STEPS.length}</small>
      <h3 id={`interview-prompt-${step}`}>{current.prompt}</h3>
      <p>{current.help}</p>
      <div className="interview-options">{current.options.map((option) => <button
        type="button"
        key={option.value}
        className={selected === option.value ? "selected" : ""}
        aria-pressed={selected === option.value}
        onClick={() => answer(current.key, option.value)}
      ><strong>{option.label}</strong><span>{option.description}</span></button>)}</div>
    </div>
    <footer className="interview-navigation">
      <button type="button" className="text-action" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>← Previous</button>
      <div>{GUIDED_INTERVIEW_STEPS.map((item, index) => <button type="button" aria-label={`Open question ${index + 1}: ${item.prompt}`} className={index === step ? "active" : value[item.key] ? "complete" : ""} key={item.key} onClick={() => setStep(index)} />)}</div>
      <button type="button" className="text-action" disabled={!selected || step === GUIDED_INTERVIEW_STEPS.length - 1} onClick={() => setStep((value) => value + 1)}>Next →</button>
    </footer>
    {answered === GUIDED_INTERVIEW_STEPS.length && <p className="interview-ready" role="status">Direction complete. Your answers will configure the starting portfolio and remain editable in Studio.</p>}
  </section>;
}
