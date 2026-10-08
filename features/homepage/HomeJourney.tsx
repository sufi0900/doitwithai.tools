"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Layers3,
  WandSparkles,
  ArrowRight,
  Check,
  Sparkles,
  Pause,
  Play,
  MousePointer2,
} from "lucide-react";
const steps = [
  {
    title: "Understand the task",
    label: "Read the guides",
    description:
      "Start with a practical article to understand the steps, choices, and examples behind your task.",
    href: "/ai-seo",
    Icon: BookOpen,
    short: "Learn",
    detail: "Know what a useful result looks like",
    note: "Follow an example, understand the choices, and bring your own ideas to the task.",
    items: ["Clear steps", "Practical examples", "Human judgment"],
  },
  {
    title: "Gather your starting points",
    label: "Explore free resources",
    description:
      "Find prompts and learning resources you can adapt to your project before you begin.",
    href: "/free-ai-resources",
    Icon: Layers3,
    short: "Prepare",
    detail: "Give your project a useful starting point",
    note: "Collect a relevant prompt or learning resource, then adapt it to your goal and audience.",
    items: ["Adaptable prompts", "Learning visuals", "Useful resources"],
  },
  {
    title: "Put what you learned to work",
    label: "Choose your AI tool",
    description:
      "Use a tool to generate or evaluate your work, then review and refine the results with your own judgment.",
    href: "/tools",
    Icon: WandSparkles,
    short: "Do",
    detail: "Turn your preparation into a working draft",
    note: "Bring your context into a tool, compare the output, and refine it before putting it to use.",
    items: ["Your context", "Editable results", "Review and refine"],
  },
];
export default function HomeJourney() {
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const step = steps[selected];
  return (
    <section
      aria-labelledby="workflow-title"
      className="home-section home-journey-section"
    >
      <div className="home-shell">
        <div className="home-journey-heading">
          <p className="home-eyebrow">One connected approach</p>
          <h2 id="workflow-title" className="home-title">
            Learn it. Prepare it. Do it with AI.
          </h2>
          <p className="home-description">
            Guidance, resources, and tools work together to help you move from
            understanding a task to doing it.
          </p>
        </div>
        <div className={`home-journey-board ${paused ? "is-paused" : ""}`}>
          <div className="home-project-node">
            <Sparkles aria-hidden size={18} />
            <span>Your next project</span>
            <span className="home-node-signal" aria-hidden />
          </div>
          <div className="home-journey-route" aria-hidden>
            <svg viewBox="0 0 1000 70" preserveAspectRatio="none">
              <path d="M500 0V20Q500 35 485 35H182Q166 35 166 52V70M500 35V70M500 35H818Q834 35 834 52V70" />
              <path
                className="home-route-flow"
                d="M500 0V20Q500 35 485 35H182Q166 35 166 52V70M500 35V70M500 35H818Q834 35 834 52V70"
              />
            </svg>
          </div>
          <div
            role="tablist"
            aria-label="Explore the learning journey"
            className="home-journey-nodes"
          >
            {steps.map(({ title, short, Icon }, i) => (
              <button
                key={short}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`journey-tab-${i}`}
                aria-controls="journey-preview"
                aria-selected={selected === i}
                tabIndex={selected === i ? 0 : -1}
                className={`home-journey-step home-journey-node ${selected === i ? "is-active" : ""}`}
                onClick={() => setSelected(i)}
                onKeyDown={(e) => {
                  let next = i;
                  if (e.key === "ArrowRight" || e.key === "ArrowDown")
                    next = (i + 1) % 3;
                  else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
                    next = (i + 2) % 3;
                  else if (e.key === "Home") next = 0;
                  else if (e.key === "End") next = 2;
                  else return;
                  e.preventDefault();
                  setSelected(next);
                  tabs.current[next]?.focus();
                }}
              >
                <span className="home-node-icon">
                  <Icon aria-hidden />
                </span>
                <span className="home-node-copy">
                  <span className="home-node-label">
                    0{i + 1} / {short}
                  </span>
                  <span className="home-node-title">{title}</span>
                </span>
                <ArrowRight aria-hidden size={18} />
              </button>
            ))}
          </div>
          <div
            id="journey-preview"
            role="tabpanel"
            aria-labelledby={`journey-tab-${selected}`}
            tabIndex={0}
            className="home-journey-preview"
          >
            <div className="home-preview-copy" key={selected}>
              <p className="home-eyebrow">Step 0{selected + 1}</p>
              <h3>{step.detail}</h3>
              <p>{step.note}</p>
              <div className="home-preview-chips">
                {step.items.map((item) => (
                  <span key={item}>
                    <Check aria-hidden size={14} />
                    {item}
                  </span>
                ))}
              </div>
              <Link href={step.href} className="home-primary-button">
                {step.label}
                <ArrowRight aria-hidden size={16} />
              </Link>
            </div>
            <div
              className={`home-preview-scene home-preview-scene-${selected}`}
              aria-hidden
            >
              <div className="home-scene-orbit" />
              <div className="home-scene-orbit home-scene-orbit-inner" />
              <span className="home-scene-badge">
                <step.Icon size={16} />
                {step.short} with confidence
              </span>
              <div className="home-scene-window">
                <div className="home-window-bar">
                  <i />
                  <i />
                  <i />
                  <span>Workflow preview</span>
                </div>
                {selected === 0 ? (
                  <div className="home-scene-document">
                    <span className="home-mock-label">A practical guide</span>
                    <strong>From an idea to a clear plan</strong>
                    <div className="home-mock-lines">
                      <i />
                      <i />
                      <i />
                    </div>
                    <div className="home-mock-callout">
                      <BookOpen size={18} />
                      Understand the steps before you begin
                    </div>
                    <div className="home-mock-lines">
                      <i />
                      <i />
                    </div>
                  </div>
                ) : selected === 1 ? (
                  <div className="home-scene-document">
                    <span className="home-mock-label">
                      Your starting points
                    </span>
                    <strong>A prompt you can make your own</strong>
                    <div className="home-mock-prompt">
                      <span>[Your task]</span>
                      <span>[Your audience]</span>
                      <span>[Your context]</span>
                    </div>
                    <div className="home-mock-callout">
                      <Layers3 size={18} />
                      Adapt the resources to your project
                    </div>
                  </div>
                ) : (
                  <div className="home-scene-document">
                    <span className="home-mock-label">An editable draft</span>
                    <strong>Your idea, shaped with AI</strong>
                    <div className="home-mock-lines">
                      <i />
                      <i />
                      <i />
                    </div>
                    <div className="home-mock-result">
                      <Check size={17} />
                      Compare. Review. Refine.
                    </div>
                    <div className="home-mock-lines">
                      <i />
                      <i />
                    </div>
                  </div>
                )}
              </div>
              <MousePointer2 className="home-scene-cursor" size={30} />
              <span className="home-scene-bottom">
                <Check size={14} />
                Your judgment connects every step
              </span>
            </div>
          </div>
          <div className="home-journey-footer">
            <span>Select a step to explore the workflow.</span>
            <button
              type="button"
              onClick={() => setPaused(!paused)}
              aria-pressed={paused}
            >
              {paused ? (
                <Play size={14} aria-hidden />
              ) : (
                <Pause size={14} aria-hidden />
              )}
              {paused ? "Play visuals" : "Pause visuals"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
