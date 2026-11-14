import test from "node:test";
import assert from "node:assert/strict";
import { bannerLines } from "../../features/writer-workspace/banner-layout";
test("long banner headings stay inside their text region without losing words", () => {
 const title = "How to Improve On-Page SEO of Your Website with Practical Steps and Clear Examples for Beginners";
 const result = bannerLines(title, 740, 52, 4);
 assert.equal(result.lines.join(" "), title);
 assert.ok(result.lines.length <= 4);
 assert.ok(result.lines.every(line => line.length * result.size * .68 <= 740));
});
test("unbroken input is wrapped within the available width", () => {
 const result = bannerLines("W".repeat(100), 740, 52, 4);
 assert.equal(result.lines.join(""), "W".repeat(100));
 assert.ok(result.lines.every(line => line.length * result.size * .68 <= 740));
});
