"use client";
import { useEffect, useRef } from "react";
import { renderScene } from "./journey-scene";

export default function JourneyCharacter({
  stage,
  active,
}: {
  stage: number;
  active: boolean;
}) {
  const svg = useRef<SVGSVGElement>(null),
    clock = useRef(0),
    previous = useRef(stage);
  useEffect(() => {
    const root = svg.current;
    if (!root) return;
    if (previous.current !== stage) {
      clock.current = 0;
      previous.current = stage;
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const draw = (time: number) => {
      root.innerHTML = renderScene(stage, time);
    };
    const still = () => draw(stage === 1 ? 3.4 : stage === 2 ? 2.4 : 1);
    let frame = 0,
      last: number | undefined,
      paint = 0;
    const tick = (now: number) => {
      if (last !== undefined)
        clock.current += Math.min((now - last) / 1000, 0.05);
      last = now;
      if (now - paint >= 1000 / 24) {
        draw(clock.current);
        paint = now;
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      last = undefined;
      if (media.matches) still();
      else {
        draw(clock.current);
        if (active) frame = requestAnimationFrame(tick);
      }
    };
    sync();
    media.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", sync);
    };
  }, [stage, active]);
  return (
    <div className={`journey-character character-stage-${stage}`}>
      <svg
        ref={svg}
        width="360"
        height="300"
        viewBox="0 0 360 300"
        aria-hidden="true"
      />
      <span className="jc-caption">
        {
          [
            "Read the guide. Turn the page.",
            "Close the book. Pack your resources.",
            "Bring your learning to the desk.",
          ][stage]
        }
      </span>
    </div>
  );
}
