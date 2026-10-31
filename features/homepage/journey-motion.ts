export type Point = { x: number; y: number };
type V3 = Point & { z: number };
export type Pose = {
  leftShoulder: Point;
  rightShoulder: Point;
  leftElbow: Point;
  rightElbow: Point;
  leftHand: Point;
  rightHand: Point;
  pageVisible: boolean;
  pageEdge: Point;
  closedBook: number;
  resource: Point;
  resourceVisible: boolean;
  resourceAlpha: number;
  resourceIndex: number;
  bagOpen: number;
  penTip: Point;
  writingProgress: number;
  lineFade: number;
  headAngle: number;
  bodyAngle: number;
  gaze: number;
  blink: number;
  breath: number;
};

/* ------------------------------------------------------------------ */
/* Small math helpers                                                  */
/* ------------------------------------------------------------------ */
const clamp = (n: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));
// Smootherstep: zero velocity AND zero acceleration at both ends, so every
// reach starts and stops the way a relaxed human arm does.
const glide = (n: number) => {
  const t = clamp(n);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
const ease = (n: number) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mix3 = (a: V3, b: V3, t: number): V3 => ({
  x: mix(a.x, b.x, t),
  y: mix(a.y, b.y, t),
  z: mix(a.z, b.z, t),
});
const v3 = (x: number, y: number, z = 0): V3 => ({ x, y, z });

export const around = (p: Point, r: number, degrees: number): Point => ({
  x: p.x + r * Math.cos((degrees * Math.PI) / 180),
  y: p.y + r * Math.sin((degrees * Math.PI) / 180),
});

function rotate(p: Point, degrees: number): Point {
  const a = (degrees * Math.PI) / 180,
    x = p.x - 165,
    y = p.y - 210;
  return {
    x: 165 + x * Math.cos(a) - y * Math.sin(a),
    y: 210 + x * Math.sin(a) + y * Math.cos(a),
  };
}

/* ------------------------------------------------------------------ */
/* Arm model: two-bone IK with fixed bone lengths                      */
/* ------------------------------------------------------------------ */
// The old rig drove the forearm with an angle around a *moving* elbow, so the
// elbow could land inside the torso and bone lengths looked inconsistent.
// Here every arm is solved from the hand target instead:
//   - upper arm and forearm ALWAYS keep the same length,
//   - the hand can never be pulled beyond a natural (slightly bent) reach,
//   - the elbow is chosen with a "pole" that points down, slightly outward and
//     backward, which is where a real elbow sits when the hands are in front.
// A depth value (z, towards the viewer) is used so that a hand held in front of
// the body gets the natural foreshortening of a real arm in a front view.
const UPPER = 43;
const FORE = 41;
const MAX_REACH = (UPPER + FORE) * 0.97;
const MIN_REACH = Math.abs(UPPER - FORE) + 14;
const POLE_RIGHT = v3(0.55, 0.8, -0.45);
const POLE_LEFT = v3(-0.55, 0.8, -0.45);

function solveArm(shoulder: Point, target: V3, pole: V3) {
  const dx = target.x - shoulder.x,
    dy = target.y - shoulder.y,
    dz = target.z;
  const dist = Math.hypot(dx, dy, dz) || 1;
  const d = clamp(dist, MIN_REACH, MAX_REACH);
  const ux = dx / dist,
    uy = dy / dist,
    uz = dz / dist;
  const a = (UPPER * UPPER - FORE * FORE + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, UPPER * UPPER - a * a));
  const dot = pole.x * ux + pole.y * uy + pole.z * uz;
  let px = pole.x - ux * dot,
    py = pole.y - uy * dot,
    pz = pole.z - uz * dot;
  const pl = Math.hypot(px, py, pz) || 1;
  px /= pl;
  py /= pl;
  pz /= pl;
  return {
    elbow: { x: shoulder.x + ux * a + px * h, y: shoulder.y + uy * a + py * h },
    hand: { x: shoulder.x + ux * d, y: shoulder.y + uy * d },
  };
}

// Tiny, slow, never-repeating-looking drift so a resting hand is alive.
const drift = (s: number, k: number, amp = 1): V3 =>
  v3(
    amp * (0.9 * Math.sin(s * 0.8 + k) + 0.4 * Math.sin(s * 1.9 + k * 2)),
    amp * (0.7 * Math.sin(s * 1.1 + k * 1.7) + 0.3 * Math.sin(s * 2.3 + k)),
  );
const add = (a: V3, b: V3): V3 => v3(a.x + b.x, a.y + b.y, a.z + b.z);

/* ------------------------------------------------------------------ */
/* Timing + resting poses                                              */
/* ------------------------------------------------------------------ */
export const READ_CYCLE = 6;
export const BAG_CYCLE = 1.9; // was 2.6s: faster, no dead holds
export const WRITE_CYCLE = 4.8;
// Used for prefers-reduced-motion: a calm, natural-looking still frame.
export const STATIC_TIME = [0.8, 0, 1.9];

// Line positions for the writing stage (absolute, on the paper).
export const LINE_X0 = 196;
export const LINE_X1 = 224;
export const LINE_Y = [198.5, 204, 209.5];

const BOOK_L = v3(129, 191, 5);
const BOOK_R = v3(206, 182, 5);
const PAGE_GRAB = v3(213, 180, 5);

const GUIDE_L = v3(130, 186, 5);
const BAG_REST = v3(205, 184, 5);
const BAG_GRAB = v3(231, 151, 3);
const BAG_MOUTH = v3(249, 171, 3);
const BAG_DIP = v3(250, 181, 3);

const DESK_L = v3(137, 201, 4);
const WRITE_REST = v3(214, 207, 0);

export function samplePose(stage: number, seconds: number): Pose {
  const bodyAngle = stage === 1 ? 7 : stage === 2 ? 4 : 0;
  const breath = Math.sin(seconds * 1.7);
  const lift = -0.6 * breath;
  const shoulderOf = (x: number): Point => {
    const s = rotate({ x, y: 123 }, bodyAngle);
    return { x: s.x, y: s.y + lift };
  };
  const leftShoulder = shoulderOf(132),
    rightShoulder = shoulderOf(197);

  let leftTarget: V3 = BOOK_L;
  let rightTarget: V3 = BOOK_R;
  let pageVisible = false,
    pageEdge: Point = { x: 210, y: 158 },
    resource: Point = { x: 250, y: 145 },
    resourceVisible = false,
    resourceAlpha = 0,
    resourceIndex = 0,
    penTip: Point = { x: 210, y: 204 },
    writingProgress = 0,
    lineFade = 1,
    headAngle = 4 + 0.4 * Math.sin(seconds);

  if (stage === 0) {
    /* ---------------- Reading: hold the book, turn a page -------------- */
    const t = seconds % READ_CYCLE;
    const T_GRAB = 1.9,
      T_FLIP = 2.5,
      T_RELEASE = 3.25,
      T_END = 4.4;
    leftTarget = add(BOOK_L, drift(seconds, 0.4, 0.7));
    rightTarget = add(BOOK_R, drift(seconds, 2.1, 0.7));

    if (t >= T_FLIP && t < T_END) {
      // Page swings over the spine. The hand holds the corner for the first
      // part of the turn, lets go, and the page finishes the arc on its own.
      const u = (t - T_FLIP) / (T_END - T_FLIP);
      const page = ease(u);
      const th = page * Math.PI;
      pageVisible = true;
      pageEdge = {
        x: 165 + 45 * Math.cos(th),
        y: 158 - 16 * Math.sin(th),
      };
    }
    const edgeAt = (time: number) => {
      const th = ease((time - T_FLIP) / (T_END - T_FLIP)) * Math.PI;
      return v3(
        165 + 45 * Math.cos(th) + 3,
        158 - 16 * Math.sin(th) + 22,
        5 + 4 * Math.sin(th),
      );
    };
    if (t >= T_GRAB && t < T_FLIP)
      rightTarget = mix3(rightTarget, PAGE_GRAB, glide((t - T_GRAB) / 0.6));
    else if (t >= T_FLIP && t < T_RELEASE) rightTarget = edgeAt(t);
    else if (t >= T_RELEASE && t < T_RELEASE + 0.9)
      rightTarget = mix3(
        edgeAt(T_RELEASE),
        rightTarget,
        glide((t - T_RELEASE) / 0.9),
      );
    // Eyes and head follow the page while it turns.
    if (t >= T_FLIP && t < T_END)
      headAngle += 2.2 * Math.sin(((t - T_FLIP) / (T_END - T_FLIP)) * Math.PI);
  } else if (stage === 1) {
    /* ---------------- Preparing: pick a resource, drop in the bag ------ */
    const t = seconds % BAG_CYCLE;
    resourceIndex = Math.floor(seconds / BAG_CYCLE) % 4;
    leftTarget = add(GUIDE_L, drift(seconds, 0.9, 0.6));
    let hand: V3;
    if (t < 0.28) hand = mix3(BAG_REST, BAG_GRAB, glide(t / 0.28));
    else if (t < 0.4) hand = BAG_GRAB;
    else if (t < 1.0) {
      const u = glide((t - 0.4) / 0.6);
      hand = mix3(BAG_GRAB, BAG_MOUTH, u);
      hand.y -= 7 * Math.sin(Math.PI * u);
    } else if (t < 1.2) hand = mix3(BAG_MOUTH, BAG_DIP, glide((t - 1) / 0.2));
    else hand = mix3(BAG_DIP, BAG_REST, glide((t - 1.2) / 0.7));
    rightTarget = hand;

    const DROP = 1.12;
    resourceVisible = t >= 0.22 && t < 1.38;
    resourceAlpha = Math.min(clamp((t - 0.22) / 0.12), clamp((1.38 - t) / 0.1));
    if (t < DROP) resource = { x: hand.x - 3, y: hand.y - 2 };
    else resource = { x: BAG_DIP.x - 3 - 0.5, y: BAG_DIP.y - 2 + 140 * (t - DROP) ** 2 };
    headAngle = 10 + (hand.x - 205) / 9;
  } else {
    /* ---------------- Doing: writing three lines ----------------------- */
    const t = seconds % WRITE_CYCLE;
    const PER_LINE = 1.3,
      WRITE = 1.0;
    leftTarget = add(DESK_L, drift(seconds, 1.4, 0.5));
    const start = (i: number) => v3(LINE_X0, LINE_Y[i], 0);
    let tip: V3;
    let penLift = 0;
    if (t < PER_LINE * 3) {
      const line = Math.floor(t / PER_LINE),
        lt = t - line * PER_LINE;
      if (lt < WRITE) {
        const raw = lt / WRITE;
        const prog = mix(raw, ease(raw), 0.35);
        writingProgress = line + prog;
        const wiggle =
          0.8 * Math.sin(prog * 38 + line) + 0.4 * Math.sin(prog * 21);
        tip = v3(
          mix(LINE_X0, LINE_X1, prog),
          LINE_Y[line] + wiggle * 0.5,
          0,
        );
      } else {
        // Pen lifts and travels back to the start of the next line.
        const r = glide((lt - WRITE) / (PER_LINE - WRITE));
        writingProgress = line + 1;
        const to = line < 2 ? start(line + 1) : v3(WRITE_REST.x, WRITE_REST.y, 0);
        tip = mix3(v3(LINE_X1, LINE_Y[line], 0), to, r);
        penLift = Math.sin(Math.PI * r);
      }
    } else {
      // Hold the finished page for a moment, then glide back to line one while
      // the writing fades, so the loop restarts without a jump.
      const r = glide((t - 4.4) / (WRITE_CYCLE - 4.4));
      writingProgress = 3;
      tip = mix3(WRITE_REST, start(0), r);
      penLift = Math.sin(Math.PI * r) * 0.6;
      lineFade = 1 - glide((t - 4.15) / 0.4);
    }
    penTip = { x: tip.x, y: tip.y - penLift * 3 };
    rightTarget = v3(penTip.x - 5, penTip.y - 12, 4 + penLift * 6);
    headAngle = 8 + 2.5 * ((tip.x - LINE_X0) / (LINE_X1 - LINE_X0));
  }

  const left = solveArm(leftShoulder, leftTarget, POLE_LEFT);
  const right = solveArm(rightShoulder, rightTarget, POLE_RIGHT);

  const blinkTime = seconds % 5.1,
    blink =
      blinkTime > 3.8 && blinkTime < 4
        ? Math.max(0.08, Math.abs((blinkTime - 3.9) / 0.1))
        : 1;
  return {
    leftShoulder,
    rightShoulder,
    leftElbow: left.elbow,
    leftHand: left.hand,
    rightElbow: right.elbow,
    rightHand: right.hand,
    pageVisible,
    pageEdge,
    closedBook: stage === 0 ? 0 : 1,
    bagOpen: stage === 1 ? 1 : 0,
    resource,
    resourceVisible,
    resourceAlpha,
    resourceIndex,
    penTip,
    writingProgress,
    lineFade,
    bodyAngle,
    headAngle,
    gaze: stage === 1 ? 1 : stage === 2 ? 0.35 : 0,
    blink,
    breath,
  };
}
