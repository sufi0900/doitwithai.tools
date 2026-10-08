import test from "node:test";
import assert from "node:assert/strict";
import { samplePose, type Point } from "../../features/homepage/journey-motion";
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
test("arm bones keep their length and share one elbow across every motion", () => {
  for (const stage of [0, 1, 2])
    for (let time = 0; time <= 24; time += 0.02) {
      const p = samplePose(stage, time);
      for (const [s, e, h] of [
        [p.leftShoulder, p.leftElbow, p.leftHand],
        [p.rightShoulder, p.rightElbow, p.rightHand],
      ]) {
        assert.ok(Math.abs(distance(s, e) - 54) < 0.0001);
        assert.ok(
          Math.abs(distance(e, h) - 54) < 0.0001,
          `stage ${stage}, time ${time}`,
        );
      }
    }
});
test("turning finger stays on the page corner and carried cards stay at the hand", () => {
  for (let t = 2.7; t < 4.3; t += 0.02) {
    const p = samplePose(0, t);
    assert.equal(p.rightHand.x, 218 - 106 * p.page);
    assert.equal(p.rightHand.y, 158 - 19 * Math.sin(Math.PI * p.page));
  }
  for (let t = 2.2; t < 4.2; t += 0.02) {
    const p = samplePose(1, t);
    assert.ok(distance(p.resource, p.rightHand) < 0.00001);
  }
});
test("pen stays in the writing hand and moves continuously between lines and loops", () => {
  for (let t = 0.6; t < 18; t += 0.02) {
    const p = samplePose(2, t);
    assert.equal(p.penTip.x - p.rightHand.x, 5);
    assert.equal(p.penTip.y - p.rightHand.y, 12);
  }
  for (const boundary of [0.6, 1.95, 3.3, 4.65, 5.6, 6.95, 8.3, 9.65, 10.6]) {
    assert.ok(
      distance(
        samplePose(2, boundary - 0.0001).penTip,
        samplePose(2, boundary + 0.0001).penTip,
      ) < 0.05,
      `jump at ${boundary}`,
    );
  }
});
