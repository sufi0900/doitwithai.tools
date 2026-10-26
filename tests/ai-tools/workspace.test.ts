import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { safeReturnPath } from "../../features/tools-workspace/supabase";
import { POST } from "../../app/api/tools/community/route";
import { tools } from "../../features/tool-catalog/catalog";
import { findTools } from "../../features/tool-catalog/catalog-core.mjs";
import {
  topics,
  matchesTopic,
  getTopicMeta,
} from "../../features/tool-catalog/discovery";
test("OAuth return URLs stay within public tools", () => {
  for (const bad of [
    null,
    "https://evil.example/tools",
    "//evil.example/tools",
    "/tools-evil",
    "/tools/../../admin",
    "/tools\\evil",
    "/tools\n//evil",
  ]) {
    assert.equal(safeReturnPath(bad), "/tools");
  }
  assert.equal(
    safeReturnPath("/tools/readability-checker#editor"),
    "/tools/readability-checker#editor",
  );
});
const request = (body: unknown, headers: Record<string, string> = {}) =>
  new NextRequest("https://doitwithai.tools/api/tools/community", {
    method: "POST",
    headers: {
      origin: "https://doitwithai.tools",
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
test("account actions reject cross-origin requests and missing authentication", async () => {
  assert.equal(
    (await POST(request({}, { origin: "https://evil.example" }))).status,
    403,
  );
  assert.equal((await POST(request({}))).status, 401);
});
test("account actions validate tool identity and desired state before contacting account services", async () => {
  const headers = { authorization: "Bearer test" };
  assert.equal(
    (
      await POST(
        request({ toolId: tools[0].id, kind: "like", active: "yes" }, headers),
      )
    ).status,
    422,
  );
  assert.equal(
    (
      await POST(
        request(
          { toolId: "unknown-tool", kind: "like", active: true },
          headers,
        ),
      )
    ).status,
    404,
  );
});
test("search recognizes performance aliases and punctuation", () => {
  assert.ok(
    findTools(tools, { query: "pagespeed" }).some(
      (t) => t.slug === "core-web-vitals-checker",
    ),
  );
  assert.ok(
    findTools(tools, { query: "meta-title" }).some(
      (t) => t.slug === "meta-title-generator",
    ),
  );
});
test("discovery topics reference live, unique tools", () => {
  const ids = new Set(topics.map((t) => t.id));
  for (const tool of tools) {
    assert.equal(new Set(tool.topics).size, tool.topics.length);
    assert.ok(tool.topics.every((id) => ids.has(id)));
  }
  for (const topic of topics)
    assert.ok(tools.some((tool) => matchesTopic(tool, topic.id)));
});

test("account actions accept a public host behind the Next.js internal hostname", async () => {
  const request = new NextRequest("http://localhost:3185/api/tools/community", {
    method: "POST",
    headers: {
      host: "doitwithai.tools",
      origin: "https://doitwithai.tools",
      "x-forwarded-proto": "https",
    },
    body: "{}",
  });
  assert.equal((await POST(request)).status, 401);
  const forged = new NextRequest("http://localhost:3185/api/tools/community", {
    method: "POST",
    headers: {
      host: "doitwithai.tools",
      origin: "https://attacker.example",
      "x-forwarded-host": "attacker.example",
      "x-forwarded-proto": "https",
    },
    body: "{}",
  });
  assert.equal((await POST(forged)).status, 403);
});

test("category accents remain readable on selected navigation backgrounds", () => {
  const hex = (value: string) =>
    value
      .slice(1)
      .match(/../g)!
      .map((part) => parseInt(part, 16));
  const luminance = (channels: number[]) =>
    channels
      .map((channel) => {
        const s = channel / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      })
      .reduce(
        (sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index],
        0,
      );
  const contrast = (a: number[], b: number[]) => {
    const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (values[0] + 0.05) / (values[1] + 0.05);
  };
  for (const topic of [...topics, { id: "conversion" }]) {
    const meta = getTopicMeta(topic.id),
      rgb = meta.rgb.split(",").map(Number);
    const lightBackground = rgb.map(
      (channel, index) => channel * 0.13 + [248, 250, 252][index] * 0.87,
    );
    const darkBackground = rgb.map(
      (channel, index) => channel * 0.15 + [15, 21, 35][index] * 0.85,
    );
    assert.ok(
      contrast(hex(meta.accent), lightBackground) >= 4.5,
      `${topic.id}: light text contrast`,
    );
    assert.ok(
      contrast(hex(meta.darkAccent), darkBackground) >= 4.5,
      `${topic.id}: dark text contrast`,
    );
  }
  assert.match(getTopicMeta("future-category").accent, /^#[0-9a-f]{6}$/i);
});
