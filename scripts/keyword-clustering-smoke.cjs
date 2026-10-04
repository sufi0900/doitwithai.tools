const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
module.exports = async function checkClustering(page, origin, screenshotDir) {
  console.log("Checking keyword clustering workspace");
  let calls = 0,
    fail = false,
    lastInput;
  const intercept = async (request) => {
    if (
      request.url().endsWith("/api/ai-tools/keyword-clustering") &&
      request.method() === "POST"
    ) {
      calls++;
      lastInput = JSON.parse(request.postData());
      const group = {
        label: "Title writing",
        primaryId: "k1",
        keywordIds: ["k1", "k2"],
        intent: "informational",
        pageType: "guide",
        focus:
          "Explain title writing using practical examples and a clear review process.",
        rationale:
          "These terms plausibly share a reader task about writing titles.",
        review: "Check existing pages and actual results before drafting.",
      };
      await request.respond({
        status: fail ? 503 : 200,
        contentType: "application/json",
        body: JSON.stringify(
          fail
            ? { error: { message: "Clustering provider unavailable." } }
            : {
                result: {
                  clusters: [
                    group,
                    {
                      ...group,
                      label: "Title generator",
                      primaryId: "k3",
                      keywordIds: ["k3"],
                      intent: "transactional",
                      pageType: "reference",
                    },
                  ],
                  unassigned: [
                    {
                      keywordId: "k4",
                      reason:
                        "Clarify whether this term describes fruit, a company, or another subject.",
                    },
                  ],
                  review: [
                    "Compare each group with existing pages before creating content.",
                    "Review current results for your audience and location.",
                  ],
                },
              },
        ),
      });
    } else await request.continue();
  };
  await page.setRequestInterception(true);
  page.on("request", intercept);
  const click = async (label) =>
    assert.ok(
      await page.$$eval(
        "button",
        (nodes, text) => {
          const b = nodes.find((n) => n.textContent.trim() === text);
          b?.click();
          return Boolean(b);
        },
        label,
      ),
      `Missing button ${label}`,
    );
  const fill = async (selector, text) => {
    await page.click(selector, { clickCount: 3 });
    await page.keyboard.press("Backspace");
    await page.type(selector, text);
  };
  const choose = async (n) => {
    await page.$eval(`#keyword-results fieldset input:nth-of-type(1)`, (n) =>
      n.click(),
    );
  };
  let temp;
  try {
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(`${origin}/tools/keyword-clustering-tool`, {
      waitUntil: "networkidle2",
    });
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      window.__clusterClipboard = "";
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => {
            window.__clusterClipboard = text;
          },
        },
      });
    });
    temp = await fs.mkdtemp(path.join(os.tmpdir(), "cluster-qa-"));
    const file = path.join(temp, "keywords.csv");
    await fs.writeFile(
      file,
      "volume,Keyword\n10,meta title examples\n20,how to write meta titles\n30,meta title generator\n0,apple\n10,meta title examples",
    );
    await (await page.$("#keyword-file")).uploadFile(file);
    await page.waitForSelector("#keyword-column");
    assert.equal(await page.$eval("#keyword-column", (n) => n.value), "1");
    assert.equal(
      await page.$eval("#keyword-column + label input", (n) => n.checked),
      true,
    );
    assert.equal(calls, 0);
    await click("Use selected column");
    assert.match(
      await page.$eval("form", (n) => n.textContent),
      /Duplicates removed/,
    );
    await click("Group my keywords");
    await page.waitForSelector("#keyword-results");
    assert.equal(lastInput.keywords.length, 4);
    assert.equal(lastInput.keywords[0].text, "meta title examples");
    assert.ok(!JSON.stringify(lastInput).includes("volume"));
    await fill("#group-label", "Reviewed title guide");
    await click("Copy group brief");
    assert.match(
      await page.evaluate(() => window.__clusterClipboard),
      /Reviewed title guide/,
    );
    assert.match(
      await page.$eval("#keyword-results", (n) => n.textContent),
      /Original AI notes/,
    );
    await choose();
    await page.select("#move-target", "g2");
    await click("Move selected keywords");
    assert.equal(
      await page.$eval("#group-label", (n) => n.value),
      "Title generator",
    );
    assert.equal(
      await page.$$eval(
        "#keyword-results fieldset input",
        (nodes) => nodes.length,
      ),
      2,
    );
    await click("Undo last edit");
    await click("Copy full plan");
    assert.match(
      await page.evaluate(() => window.__clusterClipboard),
      /Reviewed title guide/,
    );
    await click("Review queue (1)");
    await choose();
    await fill("#new-group", "Meaning to investigate");
    await click("Create group from selected");
    assert.equal(
      await page.$eval("#group-label", (n) => n.value),
      "Meaning to investigate",
    );
    assert.match(
      await page.$eval("#keyword-results", (n) => n.textContent),
      /4 keywords retained/,
    );
    await page.select("#move-target", "g1");
    await click("Merge whole group into destination");
    assert.equal(
      await page.$$eval(
        "#keyword-results fieldset input",
        (nodes) => nodes.length,
      ),
      3,
    );
    await click("Send whole group to review");
    assert.match(
      await page.$eval("#keyword-results", (n) => n.textContent),
      /Review queue \(3\)/,
    );
    await click("Undo last edit");
    await click("Copy full plan");
    const saved = await page.evaluate(() => window.__clusterClipboard);
    assert.match(saved, /apple/);
    assert.match(saved, /meta title generator/);
    fail = true;
    await click("Generate a new draft");
    await page.waitForFunction(() =>
      document
        .querySelector('[role="alert"]')
        ?.textContent.includes("Clustering provider unavailable"),
    );
    await click("Copy full plan");
    assert.equal(await page.evaluate(() => window.__clusterClipboard), saved);
    assert.equal(calls, 2);
    if (screenshotDir) {
      await fs.mkdir(screenshotDir, { recursive: true });
      await page.evaluate(() =>
        document
          .querySelector("#keyword-results")
          .scrollIntoView({ block: "start" }),
      );
      await page.screenshot({
        path: path.join(screenshotDir, "clustering-desktop.png"),
      });
    }
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluate(() =>
      document
        .querySelector("#keyword-results")
        .scrollIntoView({ block: "start" }),
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    if (screenshotDir)
      await page.screenshot({
        path: path.join(screenshotDir, "clustering-mobile.png"),
      });
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector("#keyword-results"))
          .backgroundColor === "rgb(15, 23, 42)",
    );
    if (screenshotDir)
      await page.screenshot({
        path: path.join(screenshotDir, "clustering-dark.png"),
      });
    console.log(
      "Keyword import, edits, move, split, merge, undo, clipboard, failure preservation, and mobile/dark checks passed",
    );
  } finally {
    page.off("request", intercept);
    await page.setRequestInterception(false);
    if (temp) await fs.rm(temp, { recursive: true, force: true });
  }
};
