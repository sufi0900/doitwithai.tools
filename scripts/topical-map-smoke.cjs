const assert = require("node:assert/strict"),
  fs = require("node:fs/promises"),
  os = require("node:os"),
  path = require("node:path");
module.exports = async function (page, origin, screenshotDir) {
  console.log("Checking topical map workspace");
  let calls = 0,
    fail = false,
    lastInput;
  const base = {
    id: "n1",
    parentId: null,
    title: "SEO with AI",
    keyword: "SEO with AI",
    relatedKeywords: ["AI SEO workflows"],
    intent: "informational",
    format: "hub",
    focus: "Help website owners understand practical SEO workflows.",
    why: "The root defines the overall project scope.",
  };
  const result = {
    nodes: [
      base,
      {
        ...base,
        id: "n2",
        parentId: "n1",
        title: "Content planning",
        keyword: "AI content planning",
        format: "guide",
      },
      {
        ...base,
        id: "n3",
        parentId: "n1",
        title: "Page editing",
        keyword: "AI page editing",
        format: "guide",
      },
      {
        ...base,
        id: "n4",
        parentId: "n2",
        title: "Reviewing outlines",
        keyword: "how to review an article outline",
        format: "tutorial",
      },
    ],
    review: [
      "Review actual search results before selecting topics.",
      "Check existing coverage before planning separate pages.",
    ],
  };
  const intercept = async (request) => {
    if (
      request.url().endsWith("/api/ai-tools/topical-map") &&
      request.method() === "POST"
    ) {
      calls++;
      lastInput = JSON.parse(request.postData());
      if (fail === "html") {
        await request.respond({
          status: 502,
          contentType: "text/html",
          body: "<!DOCTYPE html><html>Bad gateway</html>",
        });
        return;
      }
      await request.respond({
        status: fail ? 503 : 200,
        contentType: "application/json",
        body: JSON.stringify(
          fail
            ? { error: { message: "Map provider unavailable." } }
            : { result },
        ),
      });
    } else await request.continue();
  };
  await page.setRequestInterception(true);
  page.on("request", intercept);
  const click = async (text) =>
    assert.ok(
      await page.$$eval(
        "button",
        (ns, t) => {
          const n = ns.find((n) => n.textContent.trim() === t);
          n?.click();
          return Boolean(n);
        },
        text,
      ),
      `Missing button ${text}`,
    );
  const fill = async (selector, text) => {
    await page.click(selector, { clickCount: 3 });
    await page.keyboard.press("Backspace");
    await page.type(selector, text);
  };
  let temp;
  try {
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(`${origin}/tools/topical-map-generator`, {
      waitUntil: "networkidle2",
    });
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      window.__topicalClipboard = "";
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => {
            window.__topicalClipboard = text;
          },
        },
      });
    });
    await click("Create my topical map");
    assert.equal(calls, 0);
    await page.waitForSelector('[role="alert"]');
    await click("Try an example");
    await fill("#topical-country", "Pakistan");
    await click("Create my topical map");
    await page.waitForSelector("#topical-results");
    assert.equal(lastInput.country, "Pakistan");
    assert.equal(lastInput.projectType, "website");
    await page.$eval('[data-topic-id="n4"]', (n) => n.click());
    await fill("#topic-title", "Review AI outlines carefully");
    await click("Copy topic brief");
    assert.match(
      await page.evaluate(() => window.__topicalClipboard),
      /Review AI outlines carefully/,
    );
    assert.match(
      await page.evaluate(() => window.__topicalClipboard),
      /Not verified/,
    );
    assert.equal(
      await page.$$eval(
        "button",
        (ns) =>
          ns.find((n) => n.textContent.trim() === "Add child topic").disabled,
      ),
      true,
    );
    await page.$eval('[data-topic-id="n2"]', (n) => n.click());
    await click("Hide supporting topics");
    assert.equal(await page.$eval("#branch-n2", (n) => n.hidden), true);
    await click("Show supporting topics");
    await click("Add child topic");
    assert.equal(await page.$eval("#topic-title", (n) => n.value), "New topic");
    await fill("#topic-title", "Evidence to review");
    await page.select("#topic-parent", "n3");
    assert.equal(await page.$eval("#topic-parent", (n) => n.value), "n3");
    await page.$eval('[data-topic-id="n3"]', (n) => n.click());
    await click("Remove this branch");
    await click("Confirm removal of 2 topic(s)");
    assert.equal(await page.$$eval("[data-topic-id]", (ns) => ns.length), 3);
    await click("Undo last edit");
    assert.equal(await page.$$eval("[data-topic-id]", (ns) => ns.length), 5);
    await page.$eval('[data-topic-id="n1"]', (n) => n.click());
    await page.select("#topic-decision", "page");
    await fill(
      "#topic-notes",
      "Reviewed audience fit and existing page coverage.",
    );
    await page.$eval("#topic-reviewed", (n) => n.click());
    assert.equal(await page.$eval("#topic-reviewed", (n) => n.checked), true);
    await click("Save in browser");
    const saved = await page.evaluate(() =>
      localStorage.getItem("doitwithai.topical-map.project.v1"),
    );
    assert.equal(JSON.parse(saved).nodes[0].reviewed, true);
    await fill("#topic-focus", "A revised reader task needs another review.");
    assert.equal(await page.$eval("#topic-reviewed", (n) => n.checked), false);
    await click("Load browser save");
    assert.equal(await page.$eval("#topic-reviewed", (n) => n.checked), true);
    temp = await fs.mkdtemp(path.join(os.tmpdir(), "topical-qa-"));
    const file = path.join(temp, "map.json");
    await fs.writeFile(
      file,
      JSON.stringify({
        ...JSON.parse(saved),
        name: "Imported topical project",
      }),
    );
    await (await page.$("#topical-project-file")).uploadFile(file);
    await page.waitForFunction(
      () =>
        document.querySelector("#topical-project-name")?.value ===
        "Imported topical project",
    );
    const bad = path.join(temp, "bad.json");
    await fs.writeFile(bad, '{"version":9}');
    await (await page.$("#topical-project-file")).uploadFile(bad);
    await page.waitForFunction(() =>
      document
        .querySelector('[role="alert"]')
        ?.textContent.includes("Could not import"),
    );
    assert.equal(await page.$$eval("[data-topic-id]", (ns) => ns.length), 5);
    await click("Copy keyword ideas");
    assert.match(
      await page.evaluate(() => window.__topicalClipboard),
      /how to review an article outline/,
    );
    await click("Copy full map");
    const copied = await page.evaluate(() => window.__topicalClipboard);
    assert.match(copied, /Reviewed audience fit/);
    fail = true;
    await click("Generate a new map");
    await page.waitForFunction(() =>
      document
        .querySelector('[role="alert"]')
        ?.textContent.includes("Map provider unavailable"),
    );
    await click("Copy full map");
    assert.equal(await page.evaluate(() => window.__topicalClipboard), copied);
    assert.equal(calls, 2);
    fail = "html";
    await click("Generate a new map");
    await page.waitForFunction(() =>
      document.body.innerText.includes("HTTP 502"),
    );
    assert.equal(
      await page.$$eval("[data-topic-id]", (nodes) => nodes.length),
      5,
    );
    assert.equal(
      await page.evaluate(() =>
        document.body.innerText.includes("Unexpected token"),
      ),
      false,
    );
    assert.equal(
      await page.evaluate(() =>
        document.body.innerText.includes(
          "Creating topic suggestions. Your current map remains available.",
        ),
      ),
      false,
    );

    assert.equal(
      await page.$$eval(
        "#topical-results a",
        (ns) => ns.filter((n) => n.href.includes("/tools/")).length,
      ),
      2,
    );
    await page.evaluate(() =>
      document
        .querySelector("#topical-results")
        .scrollIntoView({ block: "start" }),
    );
    if (screenshotDir) {
      await fs.mkdir(screenshotDir, { recursive: true });
      await page.screenshot({
        path: path.join(screenshotDir, "topical-desktop.png"),
      });
    }
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluate(() =>
      document
        .querySelector("#topical-results")
        .scrollIntoView({ block: "start" }),
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await new Promise((r) => setTimeout(r, 400));
    if (screenshotDir)
      await page.screenshot({
        path: path.join(screenshotDir, "topical-mobile.png"),
      });
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector("#topical-results"))
          .backgroundColor === "rgb(15, 23, 42)",
    );
    if (screenshotDir)
      await page.screenshot({
        path: path.join(screenshotDir, "topical-dark.png"),
      });
    console.log(
      "Topical tree editing, collapse, moving, branch deletion, undo, review reset, project saves/imports, clipboard, failure preservation, mobile and dark checks passed",
    );
  } finally {
    page.off("request", intercept);
    await page.setRequestInterception(false);
    if (temp) await fs.rm(temp, { recursive: true, force: true });
  }
};
