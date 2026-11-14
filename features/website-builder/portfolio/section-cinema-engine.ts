import type { MotionMode } from "@/features/website-builder/domain/site-document";
import { damp, sectionProgress, tiltFromPointer, toSigned } from "./section-cinema-math";

/**
 * Section Cinema engine.
 *
 * One controller per rendered portfolio. It never mounts a WebGL context; it only writes a handful of
 * CSS custom properties (progress, pointer parallax, card tilt) and data-attributes (in view / seen).
 * All visual work is done by GPU-composited CSS 3D transforms defined in section-cinema.css.
 *
 * - Container relative: works in the Studio's bounded canvas scrollbar and on the public page (window scroll).
 * - Progressive enhancement: nothing is hidden until `data-cinema-ready` is set, so SSR/no-JS/still
 *   motion always render complete, readable content.
 * - Only sections that are in view are updated; off-screen scenes have their animations paused via CSS.
 */

const TILT_TARGETS = ".work-grid article, .capability-grid article, .about-headshot";
const MAX_TILT_DEGREES = 7;
const SCENE_SELECTOR = ":scope > .cine-scene";

type SectionState = {
  scene: HTMLElement | null;
  visible: boolean;
  progress: number;
  mx: number;
  my: number;
  tx: number;
  ty: number;
};

function findScroller(root: HTMLElement): HTMLElement | null {
  for (let node = root.parentElement; node && node !== document.body; node = node.parentElement) {
    const overflowY = getComputedStyle(node).overflowY;
    if (/(auto|scroll|overlay|hidden)/.test(overflowY) && node.scrollHeight - node.clientHeight > 1) return node;
  }
  return null;
}

export function startCinema(root: HTMLElement, motion: MotionMode): () => void {
  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const states = new Map<HTMLElement, SectionState>();

  let active = false;
  let frameId = 0;
  let lastTime = 0;
  let scroller: HTMLElement | null = null;
  let sections: HTMLElement[] = [];
  let tiltedCard: HTMLElement | null = null;
  let observer: IntersectionObserver | null = null;
  let mutations: MutationObserver | null = null;

  const frameBox = () => scroller ? scroller.getBoundingClientRect() : { top: 0, height: window.innerHeight };

  const stateFor = (section: HTMLElement): SectionState => {
    let state = states.get(section);
    if (!state) { state = { scene: null, visible: false, progress: -1, mx: 0, my: 0, tx: 0, ty: 0 }; states.set(section, state); }
    state.scene = section.querySelector<HTMLElement>(SCENE_SELECTOR);
    return state;
  };

  const markVisibility = (section: HTMLElement, visible: boolean) => {
    const state = stateFor(section);
    state.visible = visible;
    if (visible) { section.dataset.inview = "true"; section.dataset.seen = "true"; }
    else delete section.dataset.inview;
  };

  const schedule = () => { if (active && !frameId) frameId = window.requestAnimationFrame(tick); };

  function tick(now: number) {
    frameId = 0;
    if (!active) return;
    const dt = Math.min(0.05, lastTime ? (now - lastTime) / 1000 : 1 / 60);
    lastTime = now;
    const frame = frameBox();
    const live = sections.filter((section) => states.get(section)?.visible);

    // Read phase: measure every live section before writing anything (avoids layout thrash).
    const measured = live.map((section) => {
      const rect = section.getBoundingClientRect();
      return { section, progress: sectionProgress(frame.top, frame.height, rect.top, rect.height) };
    });

    // Write phase.
    let needsAnotherFrame = false;
    for (const { section, progress } of measured) {
      const state = stateFor(section);
      const scene = state.scene;
      if (!scene) continue;
      if (Math.abs(progress - state.progress) > 0.0004) {
        state.progress = progress;
        scene.style.setProperty("--cp", progress.toFixed(4));
        scene.style.setProperty("--cs", toSigned(progress).toFixed(4));
      }
      const mx = damp(state.mx, state.tx, dt), my = damp(state.my, state.ty, dt);
      if (Math.abs(mx - state.mx) > 0.0006 || Math.abs(my - state.my) > 0.0006) {
        state.mx = mx; state.my = my;
        scene.style.setProperty("--cmx", mx.toFixed(4));
        scene.style.setProperty("--cmy", my.toFixed(4));
        needsAnotherFrame = true;
      }
    }
    if (needsAnotherFrame) schedule(); else lastTime = 0;
  }

  const collect = () => {
    sections = Array.from(root.querySelectorAll<HTMLElement>(":scope > .portfolio-section"));
    observer?.disconnect();
    for (const section of sections) { stateFor(section); observer?.observe(section); }
    for (const known of Array.from(states.keys())) if (!sections.includes(known)) states.delete(known);
  };

  const markInitiallyVisible = () => {
    const frame = frameBox();
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.bottom > frame.top && rect.top < frame.top + frame.height) markVisibility(section, true);
    }
  };

  const onIntersect: IntersectionObserverCallback = (entries) => {
    for (const entry of entries) markVisibility(entry.target as HTMLElement, entry.isIntersecting);
    schedule();
  };

  const onScroll = (event: Event) => {
    const target = event.target;
    if (target === document) { scroller = null; schedule(); return; }
    if (target instanceof HTMLElement && target.contains(root)) { scroller = target; schedule(); }
  };

  const onResize = () => { scroller = findScroller(root); schedule(); };

  const resetTilt = () => {
    if (!tiltedCard) return;
    for (const property of ["--tx", "--ty", "--gx", "--gy"]) tiltedCard.style.removeProperty(property);
    delete tiltedCard.dataset.tilting;
    tiltedCard = null;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    const target = event.target instanceof Element ? event.target : null;
    const section = target?.closest<HTMLElement>(".portfolio-section") ?? null;
    for (const candidate of sections) {
      const state = states.get(candidate);
      if (!state) continue;
      if (candidate === section) {
        const rect = candidate.getBoundingClientRect();
        state.tx = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
        state.ty = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
      } else { state.tx = 0; state.ty = 0; }
    }
    const card = target?.closest<HTMLElement>(TILT_TARGETS) ?? null;
    if (card !== tiltedCard) resetTilt();
    if (card) {
      const rect = card.getBoundingClientRect();
      const tilt = tiltFromPointer((event.clientX - rect.left) / Math.max(1, rect.width), (event.clientY - rect.top) / Math.max(1, rect.height), MAX_TILT_DEGREES);
      card.style.setProperty("--tx", tilt.tx.toFixed(2));
      card.style.setProperty("--ty", tilt.ty.toFixed(2));
      card.style.setProperty("--gx", tilt.gx.toFixed(1));
      card.style.setProperty("--gy", tilt.gy.toFixed(1));
      card.dataset.tilting = "true";
      tiltedCard = card;
    }
    schedule();
  };

  const onPointerLeave = () => {
    for (const state of states.values()) { state.tx = 0; state.ty = 0; }
    resetTilt();
    schedule();
  };

  const attach = () => {
    if (active) return;
    active = true;
    scroller = findScroller(root);
    observer = new IntersectionObserver(onIntersect, { rootMargin: "60px 0px 60px 0px" });
    mutations = new MutationObserver(() => { collect(); markInitiallyVisible(); schedule(); });
    mutations.observe(root, { childList: true });
    collect();
    markInitiallyVisible();
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    if (finePointer.matches) {
      root.addEventListener("pointermove", onPointerMove, { passive: true });
      root.addEventListener("pointerleave", onPointerLeave);
    }
    root.dataset.cinemaReady = "true";
    schedule();
  };

  const detach = () => {
    if (!active) return;
    active = false;
    window.cancelAnimationFrame(frameId);
    frameId = 0;
    lastTime = 0;
    observer?.disconnect(); observer = null;
    mutations?.disconnect(); mutations = null;
    document.removeEventListener("scroll", onScroll, { capture: true });
    window.removeEventListener("resize", onResize);
    root.removeEventListener("pointermove", onPointerMove);
    root.removeEventListener("pointerleave", onPointerLeave);
    resetTilt();
    delete root.dataset.cinemaReady;
  };

  const sync = () => { if (motion === "still" || reducedQuery.matches) detach(); else attach(); };
  reducedQuery.addEventListener("change", sync);
  sync();

  return () => {
    reducedQuery.removeEventListener("change", sync);
    detach();
  };
}
