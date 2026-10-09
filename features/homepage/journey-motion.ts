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
  pageEdge: Point;
  pageContact: boolean;
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
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
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
// Each stage has a lateral (non-crossing) rest pose for the upper arm, so the
// elbow sits to the side of the torso instead of swinging toward the
// centerline. The shoulder joint is now coupled to the forearm's motion (not
// frozen), clamped to a human-safe window, so the whole arm moves as one
// chain instead of only the wrist pivoting. The idle (left) arm gets a small
// continuous sway so it never reads as a dead/static limb.
export function samplePose(stage: number, seconds: number): Pose {
  const bodyAngle = stage === 1 ? 8 : stage === 2 ? 3 : 0;
  const leftShoulder = rotate({ x: 139, y: 125 }, bodyAngle),
    rightShoulder = rotate({ x: 190, y: 125 }, bodyAngle);

  const leftElbowBase = stage === 0 ? 132 : stage === 1 ? 120 : 106;
  const leftHandAngle = stage === 0 ? 50 : stage === 1 ? 80 : 58;
  // Subtle idle breathing sway so the resting arm never freezes dead.
  const idleSway = 1.5 * Math.sin(seconds * 0.6 + 1.3);
  const leftElbow = around(leftShoulder, 46, leftElbowBase + idleSway);
  const leftHand = around(leftElbow, 42, leftHandAngle);

  // Lateral (non-crossing) upper-arm rest angles for the active arm.
  const rightElbowBase = stage === 0 ? 104 : stage === 1 ? 78 : 112;
  const handRest = stage === 0 ? 10 : stage === 1 ? 4 : 22;
  // How strongly the upper arm follows the forearm's motion (0-1). Keeps the
  // two joints moving together without letting the shoulder swing wildly.
  const shoulderFollow = stage === 0 ? 0.25 : stage === 1 ? 0.3 : 0.2;

  let angle = handRest,
    page = 0,
    pageVisible = false,
    pageContact = false,
    resourceVisible = false,
    resourceIndex = 0,
    writingProgress = 0;
  let pageEdge = { x: 210, y: 158 },
    resource = { x: 250, y: 145 };

  if (stage === 0) {
    const t = seconds % 6;
    if (t < 2) angle = 10;
    else if (t < 2.5) angle = mix(10, -10, ease((t - 2) / 0.5));
    else if (t < 4.4) {
      page = ease((t - 2.5) / 1.9);
      pageVisible = true;
      const flick = ease(page / 0.16);
      angle =
        page < 0.16
          ? mix(-10, -22, flick)
          : mix(-22, 10, ease((page - 0.16) / 0.84));
    } else angle = 10;
  } else if (stage === 1) {
    // Faster cycle (2.6s vs the previous 4.6s) with shorter holds, so the
    // motion reads as deliberate rather than slow/lazy.
    const t = seconds % 2.6;
    resourceIndex = Math.floor(seconds / 2.6) % 4;
    if (t < 0.35) angle = mix(4, -20, ease(t / 0.35));
    else if (t < 0.65) angle = -20;
    else if (t < 1.5) angle = mix(-20, 14, ease((t - 0.65) / 0.85));
    else if (t < 1.75) angle = 14;
    else angle = mix(14, 4, ease((t - 1.75) / 0.85));
    resourceVisible = t >= 0.35 && t < 1.85;
  } else {
    const t = seconds % 5.2;
    if (t < 4.2) {
      const line = Math.min(2, Math.floor(t / 1.4)),
        phase = (t - line * 1.4) / 1.4,
        progress = ease(phase / 0.8);
      angle = 22 + line * 6 + 6 * progress;
      writingProgress = line + progress;
    } else {
      angle = mix(40, 22, ease((t - 4.2) / 1));
      writingProgress = 3;
    }
  }

  // Shoulder follows the forearm proportionally, clamped to a human-safe
  // window so the upper arm can never swing into an implausible pose.
  const rightElbowAngle = Math.max(
    rightElbowBase - 16,
    Math.min(rightElbowBase + 16, rightElbowBase + shoulderFollow * (angle - handRest)),
  );
  const rightElbow = around(rightShoulder, 46, rightElbowAngle);
  const rightHand = around(rightElbow, 42, angle);
  const penTip = { x: rightHand.x + 5, y: rightHand.y + 12 };

  if (stage === 0) {
    const t = seconds % 6;
    if (t >= 2.5 && t < 4.4) {
      const release = around(rightElbow, 42, -22);
      pageContact = page <= 0.16;
      if (pageContact) pageEdge = rightHand;
      else {
        const p = ease((page - 0.16) / 0.84);
        pageEdge = {
          x: mix(release.x, 120, p),
          y: mix(release.y, 158, p) - 9 * Math.sin(Math.PI * p),
        };
      }
    }
  } else if (stage === 1) {
    const t = seconds % 2.6;
    // Resource is carried in the hand, then settles onto the desk just
    // before the arm fully withdraws (same proportion as the original).
    const dropStart = 1.6;
    if (t < dropStart) resource = rightHand;
    else {
      const drop = around(rightElbow, 42, 14);
      resource = { x: drop.x, y: drop.y + 150 * (t - dropStart) ** 2 };
    }
  }

  const blinkTime = seconds % 5.1,
    blink =
      blinkTime > 3.8 && blinkTime < 4
        ? Math.max(0.08, Math.abs((blinkTime - 3.9) / 0.1))
        : 1;
  return {
    leftShoulder,
    rightShoulder,
    leftElbow,
    rightElbow,
    leftHand,
    rightHand,
    page,
    pageVisible,
    pageEdge,
    pageContact,
    closedBook: stage === 0 ? 0 : 1,
    bagOpen: stage === 1 ? 1 : 0,
    resource,
    resourceVisible,
    resourceIndex,
    penTip,
    writingProgress,
    bodyAngle,
    headAngle: stage === 1 ? 15 : stage === 2 ? 8 : 4 + 0.4 * Math.sin(seconds),
    gaze: stage === 1 ? 1 : stage === 2 ? 0.35 : 0,
    blink,
  };
}
