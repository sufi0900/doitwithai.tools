import test from "node:test";
import assert from "node:assert/strict";
import { samplePose, type Point } from "../../features/homepage/journey-motion";
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
test("shoulders and elbows remain fixed throughout every stage", () => {
  for (const stage of [0, 1, 2]) {
    const base = samplePose(stage, 0);
    for (let t = 0; t < 24; t += 0.02) {
      const p = samplePose(stage, t);
      for (const key of [
        "leftShoulder",
        "rightShoulder",
        "leftElbow",
        "rightElbow",
        "leftHand",
        "bodyAngle",
      ] as const)
        assert.deepEqual(p[key], base[key]);
      for (const [s, e, h] of [
        [p.leftShoulder, p.leftElbow, p.leftHand],
        [p.rightShoulder, p.rightElbow, p.rightHand],
      ]) {
        assert.ok(Math.abs(distance(s, e) - 46) < 1e-8);
        assert.ok(Math.abs(distance(e, h) - 42) < 1e-8);
      }
    }
  }
});
test("hand movement stays inside a small forearm sweep", () => {
  for (const [stage, max] of [
    [0, 24],
    [1, 25],
    [2, 14],
  ]) {
    const points = Array.from(
      { length: 121 },
      (_, i) => samplePose(stage, i * 0.05).rightHand,
    );
    for (const a of points)
      for (const b of points) assert.ok(distance(a, b) < max, `stage ${stage}`);
  }
});
test("page corner follows the finger while gripped, then releases", () => {
  let contacts = 0,
    releases = 0;
  for (let t = 2.5; t < 4.4; t += 0.01) {
    const p = samplePose(0, t);
    if (p.pageContact) {
      assert.deepEqual(p.pageEdge, p.rightHand);
      contacts++;
    } else releases++;
  }
  assert.ok(contacts > 0 && releases > 0);
});
test("carried resources and pencil stay attached to the wrist", () => {
  for (let t = 0.6; t < 2.8; t += 0.01) {
    const p = samplePose(1, t);
    assert.deepEqual(p.resource, p.rightHand);
  }
  for (let t = 0; t < 12; t += 0.01) {
    const p = samplePose(2, t);
    assert.equal(p.penTip.x - p.rightHand.x, 5);
    assert.equal(p.penTip.y - p.rightHand.y, 12);
  }
});
test("small actions remain continuous at their loop boundaries", () => {
  for (const [stage, bounds] of [
    [0, [2, 2.5, 4.4, 6]],
    [1, [0.6, 1.1, 2.5, 3, 4.6]],
    [2, [1.4, 2.8, 4.2, 5.2]],
  ] as const)
    for (const t of bounds)
      assert.ok(
        distance(
          samplePose(stage, t - 0.00001).rightHand,
          samplePose(stage, t + 0.00001).rightHand,
        ) < 0.01,
      );
  const p = samplePose(1, 2);
  assert.equal(p.gaze, 1);
  assert.equal(p.bodyAngle, 8);
  assert.equal(p.headAngle, 15);
});
