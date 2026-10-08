import test from "node:test";
import assert from "node:assert/strict";
import {
  scenePose,
  length,
  renderScene,
  type Vec,
} from "../../features/homepage/journey-scene";
const distance = (a: Vec, b: Vec) =>
  length({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
test("three-dimensional arms retain human proportions in every scene", () => {
  for (const stage of [0, 1, 2])
    for (let t = 0; t < 24; t += 0.02) {
      const p = scenePose(stage, t);
      for (const [s, e, h] of [
        [p.ls, p.le, p.left],
        [p.rs, p.re, p.right],
      ]) {
        assert.ok(
          distance(s, h) < 0.65,
          `unreachable stage ${stage}, time ${t}`,
        );
        assert.ok(Math.abs(distance(s, e) - 0.34) < 1e-8);
        assert.ok(Math.abs(distance(e, h) - 0.31) < 1e-8);
      }
    }
});
test("page corner and pencil grip stay attached to the hand", () => {
  for (let t = 2; t < 4; t += 0.02) {
    const p = scenePose(0, t),
      angle = Math.PI * p.page;
    assert.ok(
      distance(p.right, {
        x: 0.22 * Math.cos(angle),
        y: 1.025 + 0.22 * Math.sin(angle),
        z: 0.4,
      }) < 1e-8,
    );
  }
  for (let t = 0; t < 12; t += 0.02) {
    const p = scenePose(2, t);
    assert.ok(
      Math.abs(distance(p.pen, p.right) - Math.hypot(0.012, 0.082, 0.018)) <
        1e-8,
    );
  }
});
test("motion stays continuous at handoff boundaries and rendered geometry is finite", () => {
  for (const [stage, bounds] of [
    [0, [2, 4, 5.4, 6]],
    [1, [0.9, 1.5, 2.5, 2.95, 4.45, 4.85, 6.1]],
    [2, [1.15, 1.6, 2.75, 3.2, 4.35, 4.8, 5.4]],
  ] as const) {
    for (const t of bounds)
      assert.ok(
        distance(
          scenePose(stage, t - 0.00001).right,
          scenePose(stage, t + 0.00001).right,
        ) < 0.001,
        `jump ${stage} ${t}`,
      );
    for (const t of [0, 1, 2, 3, 4, 5])
      assert.doesNotMatch(renderScene(stage, t), /NaN|Infinity/);
  }
});
