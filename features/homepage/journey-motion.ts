export type Point = { x: number; y: number };
export type Pose = {
  leftShoulder: Point;
  rightShoulder: Point;
  leftHand: Point;
  rightHand: Point;
  leftElbow: Point;
  rightElbow: Point;
  page: number;
  pageVisible: boolean;
  closedBook: number;
  resource: Point;
  resourceVisible: boolean;
  resourceIndex: number;
  bagOpen: number;
  penTip: Point;
  writingProgress: number;
  headAngle: number;
  bodyAngle: number;
  gaze: number;
  blink: number;
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => {
  const t = clamp(v);
  return t * t * (3 - 2 * t);
};
function between(a: Point, b: Point, t: number): Point {
  return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) };
}
// Solve both bones together. Forearm start always equals upper-arm end.
export function elbowFor(
  shoulder: Point,
  hand: Point,
  upper = 46,
  lower = 42,
  bend = 1,
): Point {
  const dx = hand.x - shoulder.x,
    dy = hand.y - shoulder.y;
  const distance = Math.min(
    upper + lower - 0.001,
    Math.max(0.001, Math.hypot(dx, dy)),
  );
  const angle =
    Math.atan2(dy, dx) +
    bend *
      Math.acos(
        Math.max(
          -1,
          Math.min(
            1,
            (upper * upper + distance * distance - lower * lower) /
              (2 * upper * distance),
          ),
        ),
      );
  return {
    x: shoulder.x + upper * Math.cos(angle),
    y: shoulder.y + upper * Math.sin(angle),
  };
}
export function samplePose(stage: number, seconds: number): Pose {
  let leftShoulder = { x: 139, y: 125 },
    rightShoulder = { x: 190, y: 125 };
  let leftHand = { x: 128, y: 192 },
    rightHand = { x: 206, y: 173 };
  let page = 0,
    pageVisible = false,
    closedBook = 0,
    resourceVisible = false,
    bagOpen = 0;
  let resource = { x: 251, y: 127 },
    resourceIndex = 0,
    headAngle = 4,
    writingProgress = 0;
  let bodyAngle = 0,
    gaze = 0;
  let penTip = { x: 198, y: 203 };
  if (stage === 0) {
    const time = seconds % 6;
    const rest = { x: 206, y: 181 },
      grip = { x: 206, y: 158 };
    if (time < 2) rightHand = rest;
    else if (time < 2.7)
      rightHand = between(rest, grip, ease((time - 2) / 0.7));
    else if (time < 4.3) {
      page = ease((time - 2.7) / 1.6);
      pageVisible = true;
      // The finger follows the turning page's outer corner throughout the turn.
      rightHand = {
        x: mix(206, 124, page),
        y: 158 - 19 * Math.sin(Math.PI * page),
      };
    } else if (time < 5.2)
      rightHand = between({ x: 124, y: 158 }, rest, ease((time - 4.3) / 0.9));
    else rightHand = rest;
    headAngle = 3 + 3 * Math.sin(seconds * 1.2);
  } else if (stage === 1) {
    closedBook = ease((seconds - 0.2) / 0.6);
    bagOpen = ease((seconds - 0.8) / 0.5);
    leftHand = between({ x: 128, y: 192 }, { x: 134, y: 203 }, closedBook);
    if (seconds < 0.2)
      rightHand = between(
        { x: 206, y: 181 },
        { x: 206, y: 158 },
        ease(seconds / 0.2),
      );
    else if (seconds < 0.8) rightHand = { x: 206 - 82 * closedBook, y: 158 };
    else {
      const cycle = Math.max(0, seconds - 1.4),
        t = cycle % 4;
      resourceIndex = Math.floor(cycle / 4) % 4;
      const ready = { x: 218, y: 176 },
        pick = { x: 251, y: 127 },
        drop = { x: 251, y: 187 };
      if (t < 0.8) rightHand = between(ready, pick, ease(t / 0.8));
      else if (t < 1.25) rightHand = pick;
      else if (t < 2.6) {
        const p = ease((t - 1.25) / 1.35);
        rightHand = between(pick, drop, p);
        rightHand.y -= 18 * Math.sin(Math.PI * p);
      } else if (t < 3) rightHand = drop;
      else rightHand = between(drop, ready, ease((t - 3) / 1));
      resourceVisible = cycle > 0 && t >= 0.8 && t < 3.25;
      // The card is held at the wrist until release, then falls into the bag.
      resource =
        t < 2.8
          ? rightHand
          : { x: drop.x, y: drop.y + 220 * Math.pow(t - 2.8, 2) };
      headAngle =
        t < 3 ? mix(-7, 8, ease((t - 1.2) / 1.4)) : mix(8, -7, ease(t - 3));
      if (seconds < 1.4) headAngle = mix(4, -7, ease(seconds / 1.4));
    }
  } else {
    closedBook = 1;
    leftHand = { x: 164, y: 204 };
    const t = Math.max(0, seconds - 0.6) % 5;
    const line = Math.min(2, Math.floor(t / 1.35)),
      phase = (t - line * 1.35) / 1.35;
    if (t < 4.05) {
      const progress = ease(phase / 0.8);
      const y = 199 + line * 5;
      if (phase < 0.8)
        penTip = {
          x: 196 + 28 * progress,
          y: y + 0.3 * Math.sin(((Math.PI * phase) / 0.8) * 8),
        };
      else {
        const lift = clamp((phase - 0.8) / 0.2);
        penTip = between(
          { x: 224, y },
          { x: line < 2 ? 196 : 224, y: line < 2 ? y + 5 : y },
          ease(lift),
        );
        penTip.y -= 8 * Math.sin(Math.PI * lift);
      }
      writingProgress = line + progress;
    } else {
      penTip = between(
        { x: 224, y: 209 },
        { x: 196, y: 199 },
        ease((t - 4.05) / 0.95),
      );
      penTip.y -= 10 * Math.sin((Math.PI * (t - 4.05)) / 0.95);
      writingProgress = 3;
    }
    // The tip and hand share one trajectory. No independent forearm translation.
    rightHand = { x: penTip.x - 5, y: penTip.y - 12 };
    headAngle = 3 + 1.5 * Math.sin(seconds * 1.4);
  }
  if (stage === 1 && seconds >= 0.8 && seconds < 1.4)
    rightHand = between(
      { x: 124, y: 158 },
      { x: 218, y: 176 },
      ease((seconds - 0.8) / 0.6),
    );
  if (stage === 1) {
    gaze = ease((seconds - 0.8) / 0.6);
    const t = Math.max(0, seconds - 1.4) % 4;
    const pack =
      t < 1.25
        ? 0
        : t < 2.6
          ? ease((t - 1.25) / 1.35)
          : t < 3
            ? 1
            : 1 - ease(t - 3);
    bodyAngle = gaze * (7 + 5 * pack);
    headAngle = gaze * (12 + 6 * pack);
  } else if (stage === 2) {
    bodyAngle = 3;
    headAngle = 8 + Math.sin(seconds * 1.4);
    gaze = 0.35;
  }
  const rotate = (point: Point): Point => {
    const a = (bodyAngle * Math.PI) / 180,
      x = point.x - 165,
      y = point.y - 210;
    return {
      x: 165 + x * Math.cos(a) - y * Math.sin(a),
      y: 210 + x * Math.sin(a) + y * Math.cos(a),
    };
  };
  leftShoulder = rotate(leftShoulder);
  rightShoulder = rotate(rightShoulder);
  const blinkTime = seconds % 5.1;
  const blink =
    blinkTime > 3.8 && blinkTime < 4
      ? Math.max(0.08, Math.abs((blinkTime - 3.9) / 0.1))
      : 1;
  return {
    leftShoulder,
    rightShoulder,
    leftHand,
    rightHand,
    leftElbow: elbowFor(leftShoulder, leftHand, 46, 42, 1),
    rightElbow: elbowFor(rightShoulder, rightHand, 46, 42, 1),
    page,
    pageVisible,
    closedBook,
    resource,
    resourceVisible,
    resourceIndex,
    bagOpen,
    penTip,
    writingProgress,
    headAngle,
    bodyAngle,
    gaze,
    blink,
  };
}
