const assert = require("node:assert/strict");
const fs = require("node:fs");
const { spawn } = require("node:child_process");
const puppeteer = require("puppeteer");
const origin = process.env.SMOKE_ORIGIN || "http://localhost:40792";
const output = process.env.SMOKE_OUTPUT || "/tmp/backlink-gap-qa";
async function click(page, text) {
  await page.evaluate((label) => {
    const button = [
      ...document.querySelectorAll("#backlink-gap-workspace button"),
    ].find((n) => n.textContent.trim() === label);
    if (!button) throw new Error("Missing button: " + label);
    button.click();
  }, text);
}
async function select(page, label, value) {
  await page.evaluate(
    ({ label, value }) => {
      const select = [
        ...document.querySelectorAll("#backlink-gap-workspace label"),
      ]
        .find((n) => n.textContent.trim().startsWith(label))
        ?.querySelector("select");
      if (!select) throw new Error("Missing select: " + label);
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    },
    { label, value },
  );
}
async function shown(page, count) {
  await page.waitForFunction(
    (n) =>
      document
        .querySelector('[aria-label="Backlink gap results"]')
        ?.textContent.includes(n + " of 4 referring groups shown"),
    {},
    count,
  );
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  let server, browser;
  try {
    if (process.env.SMOKE_START_SERVER === "1") {
      const log = fs.openSync(output + "/server.log", "w");
      server = spawn(
        process.execPath,
        [
          "node_modules/next/dist/bin/next",
          process.env.SMOKE_SERVER_MODE || "dev",
          "--port",
          "40792",
        ],
        {
          stdio: ["ignore", log, log],
          env: {
            ...process.env,
            NEXT_PUBLIC_SANITY_PROJECT_ID: "qyshio4a",
            NEXT_PUBLIC_SANITY_DATASET: "production",
          },
        },
      );
      let ready = false;
      for (let i = 0; i < 90; i++) {
        if (server.exitCode !== null)
          throw new Error(
            "Server exited: " + fs.readFileSync(output + "/server.log", "utf8"),
          );
        try {
          await fetch(origin + "/favicon.ico");
          ready = true;
          break;
        } catch {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
      assert(ready, "Server did not start");
    }
    browser = await puppeteer.launch({
      headless: "shell",
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    const errors = [],
      toolRequests = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    page.on("request", (r) => {
      if (r.url().includes("/api/ai-tools/")) toolRequests.push(r.url());
    });
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(origin + "/tools/competitor-backlink-gap-analyzer", {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    await page.waitForSelector("#backlink-gap-workspace button");
    assert.equal(await page.$$eval("h1", (n) => n.length), 1);
    assert.equal(
      await page.$eval('link[rel="canonical"]', (n) => n.href),
      "https://doitwithai.tools/tools/competitor-backlink-gap-analyzer",
    );
    await page.screenshot({
      path: output + "/desktop-inputs.png",
      fullPage: true,
    });
    await click(page, "Try a worked example");
    await shown(page, 2);
    await page.waitForFunction(() =>
      document
        .querySelector('[role="status"]')
        ?.textContent.includes("fictional"),
    );
    const results = await page.$eval(
      '[aria-label="Backlink gap results"]',
      (n) => n.textContent,
    );
    assert.match(results, /1 inactive competitor records excluded/);
    assert.match(results, /2 domain-only/);
    await page.evaluate(() =>
      [...document.querySelectorAll("button")]
        .find(
          (n) =>
            n.textContent.includes("journal.example") &&
            n.hasAttribute("aria-expanded"),
        )
        .click(),
    );
    await page.waitForSelector('[aria-expanded="true"]');
    assert.equal(
      await page.$$eval('[id^="gap-evidence-"] a', (nodes) => nodes.length),
      2,
    );
    assert.match(
      await page.$eval('[id^="gap-evidence-"]', (n) => n.textContent),
      /Research guide/,
    );
    await select(
      page,
      "Competitor relationship evidence",
      "no-nofollow-recorded",
    );
    await shown(page, 1);
    await select(page, "Comparison view", "shared");
    await shown(page, 0); // Own membership is not erased by the relationship filter.
    await select(page, "Competitor relationship evidence", "qualified");
    await shown(page, 1);
    await select(page, "Comparison view", "own-only");
    await shown(page, 1);
    assert(
      await page.evaluate(
        () =>
          [...document.querySelectorAll("label")]
            .find((n) =>
              n.textContent
                .trim()
                .startsWith("Competitor relationship evidence"),
            )
            .querySelector("select").disabled,
      ),
    );
    await select(page, "Comparison view", "all");
    await select(page, "Competitor relationship evidence", "any");
    await shown(page, 4);
    await click(page, "Reset filters");
    await shown(page, 2);
    await page.select("#review-0", "shortlist");
    // Capture browser downloads without transmitting source data.
    await page.evaluate(() => {
      window.__downloads = [];
      const original = URL.createObjectURL;
      URL.createObjectURL = (blob) => {
        blob.text().then((text) => window.__downloads.push(text));
        return original(blob);
      };
    });
    await click(page, "Export filtered summary");
    await page.waitForFunction(() => window.__downloads.length === 1);
    assert.match(await page.evaluate(() => window.__downloads[0]), /shortlist/);
    await click(page, "Export filtered evidence");
    await page.waitForFunction(() => window.__downloads.length === 2);
    const csv = await page.evaluate(() => window.__downloads[1]);
    assert.equal(csv.trim().split("\r\n").length, 4);
    await click(page, "Save review");
    await page.select("#review-0", "skip");
    await click(page, "Load saved review");
    assert.equal(await page.$eval("#review-0", (n) => n.value), "shortlist");
    await click(page, "Download project");
    await page.waitForFunction(() => window.__downloads.length === 3);
    const project = await page.evaluate(() => window.__downloads[2]);
    const restored = JSON.parse(project);
    restored.inputs[1].id = "competitor-3";
    fs.writeFileSync(output + "/project.json", JSON.stringify(restored));
    await (
      await page.$('[aria-label="Restore backlink gap project"]')
    ).uploadFile(output + "/project.json");
    await page.waitForFunction(() =>
      document
        .querySelector('[role="status"]')
        ?.textContent.includes("Project restored"),
    );
    await click(page, "Add competitor");
    const fourth = '[aria-label="Competitor 3 dataset"]';
    assert(await page.$(fourth));
    await page.click('[aria-label="Remove competitor 3"]');
    await click(page, "Compare supplied backlinks");
    await shown(page, 2); // Restored IDs remain unique when adding new competitors.
    // Exercise a real UTF-16 upload and manual mapping, then recompute.
    fs.writeFileSync(
      output + "/own.tsv",
      Buffer.concat([
        Buffer.from([255, 254]),
        Buffer.from(
          "Publisher\tMemo\nnew-publisher.example\tLocal only",
          "utf16le",
        ),
      ]),
    );
    await (
      await page.$('[aria-label="Upload your backlink export"]')
    ).uploadFile(output + "/own.tsv");
    await page.waitForFunction(() =>
      document
        .querySelector('[aria-label="Your backlink dataset"]')
        ?.textContent.includes("own.tsv"),
    );
    await page
      .select(
        '[aria-label="Your backlink dataset"] select[value="source"]',
        "0",
      )
      .catch(async () => {
        await page.evaluate(() => {
          const selects = document
            .querySelector('[aria-label="Your backlink dataset"]')
            .querySelectorAll("select");
          const n = [...selects].find((s) =>
            [...s.options].some(
              (o) => o.textContent === "Choose the source column",
            ),
          );
          n.value = "0";
          n.dispatchEvent(new Event("change", { bubbles: true }));
        });
      });
    await click(page, "Compare supplied backlinks");
    await page.waitForFunction(() =>
      document
        .querySelector('[aria-label="Backlink gap results"]')
        ?.textContent.includes("3 of 4 referring groups shown"),
    );
    await select(page, "Comparison view", "own-only");
    await shown(page, 1);
    assert.match(
      await page.$eval(
        '[aria-label="Backlink gap results"]',
        (n) => n.textContent,
      ),
      /new-publisher.example/,
    );
    await click(page, "Try a worked example");
    await shown(page, 2);
    await page.screenshot({
      path: output + "/desktop-results.png",
      fullPage: true,
    });
    await page.setViewport({ width: 390, height: 844 });
    await page.screenshot({
      path: output + "/mobile-light.png",
      fullPage: true,
    });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
      "Mobile page overflows horizontally",
    );
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await page.screenshot({
      path: output + "/mobile-dark.png",
      fullPage: true,
    });
    assert.equal(toolRequests.length, 0, "Comparison must not call a tool API");
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify({
        passed: true,
        checks:
          "example, filters, own membership, evidence, CSV, saved decisions, project restore, UTF-16 upload, manual mapping, mobile overflow, no tool API requests",
        screenshots: output,
      }),
    );
  } finally {
    if (browser) await browser.close();
    if (server) server.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
