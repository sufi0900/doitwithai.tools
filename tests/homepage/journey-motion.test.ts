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
        assert.ok(distance(s, h) < 88, `unreachable pose ${stage} ${time}`);
        assert.ok(Math.abs(distance(s, e) - 46) < 0.0001);
        assert.ok(
          Math.abs(distance(e, h) - 42) < 0.0001,
          `stage ${stage}, time ${time}`,
        );
      }
    }
});
test("turning finger stays on the page corner and carried cards stay at the hand", () => {
  for (let t = 2.7; t < 4.3; t += 0.02) {
    const p = samplePose(0, t);
    assert.equal(p.rightHand.x, 206 - 82 * p.page);
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

test("preparing turns the torso and gaze toward the bag with smooth shoulders", () => {
  const p = samplePose(1, 3.6);
  assert.ok(p.bodyAngle > 10);
  assert.ok(p.gaze > 0.9);
  assert.ok(p.headAngle > 15);
  assert.ok(p.rightShoulder.x > 200);
  for (let t = 0; t < 18; t += 0.02) {
    const a = samplePose(1, t),
      b = samplePose(1, t + 0.001);
    assert.ok(distance(a.rightShoulder, b.rightShoulder) < 0.1);
  }
});

test("the closing hand follows the cover edge before reaching for resources", () => {
  for (let t = 0.2; t < 0.8; t += 0.02) {
    const p = samplePose(1, t);
    assert.equal(p.rightHand.x, 206 - 82 * p.closedBook);
    assert.equal(p.rightHand.y, 158);
  }
  for (const t of [0.2, 0.8, 1.4])
    assert.ok(
      distance(
        samplePose(1, t - 0.00001).rightHand,
        samplePose(1, t + 0.00001).rightHand,
      ) < 0.01,
    );
});
