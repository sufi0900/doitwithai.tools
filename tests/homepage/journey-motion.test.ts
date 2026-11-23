import test from "node:test";
import assert from "node:assert/strict";
import {
  samplePose,
  READ_CYCLE,
  BAG_CYCLE,
  WRITE_CYCLE,
  type Point,
} from "../../features/homepage/journey-motion";
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

test("projected joint chains remain finite and within the updated rig's reach", () => {
  for (const stage of [0, 1, 2]) {
    const base = samplePose(stage, 0);
    for (let t = 0; t < 24; t += 0.02) {
      const p = samplePose(stage, t);
      assert.equal(p.bodyAngle, base.bodyAngle);
      for (const key of ["leftShoulder", "rightShoulder"] as const)
        assert.ok(
          distance(p[key], base[key]) <= 0.61,
          "Only the small breathing lift should move the shoulders",
        );
      // The rig solves in 3D. Projected lengths may shorten, but cannot exceed
      // their physical lengths, unlike the previous flat angle-driven rig.
      for (const [s, e, h] of [
        [p.leftShoulder, p.leftElbow, p.leftHand],
        [p.rightShoulder, p.rightElbow, p.rightHand],
      ]) {
        for (const v of [s, e, h])
          assert.ok(Number.isFinite(v.x) && Number.isFinite(v.y));
        assert.ok(distance(s, e) <= 43 + 1e-8);
        assert.ok(distance(e, h) <= 41 + 1e-8);
        assert.ok(distance(s, h) <= 84 * 0.97 + 1e-8);
      }
    }
  }
});
test("reading page turns within the book and hides outside the turn", () => {
  assert.equal(samplePose(0, 1).pageVisible, false);
  assert.equal(samplePose(0, 5).pageVisible, false);
  for (let t = 2.5; t < 4.4; t += 0.01) {
    const p = samplePose(0, t);
    assert.equal(p.pageVisible, true);
    assert.ok(p.pageEdge.x >= 120 && p.pageEdge.x <= 210);
    assert.ok(p.pageEdge.y >= 142 && p.pageEdge.y <= 158);
  }
  assert.ok(samplePose(0, 2.5).pageEdge.x > samplePose(0, 4.39).pageEdge.x);
});
test("resources appear during pickup, drop into the bag, and cycle through assets", () => {
  assert.equal(samplePose(1, 0).resourceVisible, false);
  assert.equal(samplePose(1, 0.5).resourceVisible, true);
  assert.equal(samplePose(1, 1.6).resourceVisible, false);
  assert.ok(
    distance(samplePose(1, 0.5).resource, samplePose(1, 0.5).rightHand) < 6,
  );
  assert.ok(samplePose(1, 1.35).resource.y > samplePose(1, 1.13).resource.y);
  for (let i = 0; i < 8; i++)
    assert.equal(samplePose(1, i * BAG_CYCLE + 0.5).resourceIndex, i % 4);
});
test("writing progresses through three lines and fades before restarting", () => {
  assert.ok(
    samplePose(2, 0.8).writingProgress > samplePose(2, 0.2).writingProgress,
  );
  assert.ok(samplePose(2, 2).writingProgress > 1);
  assert.ok(samplePose(2, 3.5).writingProgress > 2);
  assert.equal(samplePose(2, 4.6).writingProgress, 3);
  assert.ok(samplePose(2, 4.6).lineFade < samplePose(2, 4).lineFade);
  for (let t = 0; t < WRITE_CYCLE; t += 0.01) {
    const p = samplePose(2, t);
    assert.ok(
      distance(p.penTip, p.rightHand) < 16,
      "Pencil should remain close to the writing wrist",
    );
  }
});
test("joint motion stays continuous across action and cycle boundaries", () => {
  for (const [stage, boundaries] of [
    [0, [1.9, 2.5, 3.25, 4.15, 4.4, READ_CYCLE]],
    [1, [0.28, 0.4, 1, 1.2, BAG_CYCLE]],
    [2, [1, 1.3, 2.3, 2.6, 3.6, 3.9, 4.4, WRITE_CYCLE]],
  ] as const)
    for (const t of boundaries)
      for (const joint of [
        "leftElbow",
        "rightElbow",
        "leftHand",
        "rightHand",
      ] as const)
        assert.ok(
          distance(
            samplePose(stage, t - 0.00001)[joint],
            samplePose(stage, t + 0.00001)[joint],
          ) < 1,
          `stage ${stage}, ${joint}, time ${t}`,
        );
});
