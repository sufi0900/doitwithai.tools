const assert = require("node:assert/strict");
const fs = require("node:fs");
const puppeteer = require("puppeteer");
const { spawn } = require("node:child_process");

const origin = process.env.SMOKE_ORIGIN || "http://localhost:40791";
const output = process.env.SMOKE_OUTPUT || "/tmp/backlink-verifier-qa";
async function clickText(page, text) {
  await page.evaluate((label) => {
    const button = [...document.querySelectorAll("button")].find(
      (n) => n.textContent.trim() === label,
    );
    if (!button) throw new Error("Missing button: " + label);
    button.click();
  }, text);
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  let server;
  if (process.env.SMOKE_START_SERVER === "1") {
    const log = fs.openSync(output + "/server.log", "w");
    server = spawn(
      process.execPath,
      ["node_modules/next/dist/bin/next", process.env.SMOKE_SERVER_MODE || "dev", "--port", "40791"],
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
          "Dev server exited: " +
            fs.readFileSync(output + "/server.log", "utf8"),
        );
      try {
        await fetch(origin + "/favicon.ico");
        ready = true;
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    if (!ready) {
      server.kill();
      throw new Error("Local server did not become ready.");
    }
  }
  let browser;
  try {
    browser = await puppeteer.launch({headless:"shell",args:["--no-sandbox"]});
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    await page.setViewport({ width: 1440, height: 1000 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.goto(origin + "/tools/backlink-verification-tool", {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    await page.waitForSelector('#backlink-checker button[type="submit"]');
    await page.waitForFunction(() =>
      document.querySelector(
        '#backlink-checker input[placeholder="https://yourwebsite.com/guide"]',
      ),
    );
    assert.equal(
      await page.$eval('link[rel="canonical"]', (n) => n.href),
      "https://doitwithai.tools/tools/backlink-verification-tool",
    );
    assert.equal(await page.$$eval("h1", (n) => n.length), 1);
    await page.screenshot({
      path: output + "/desktop-light.png",
      fullPage: true,
    });
    await clickText(page, "Try an example");
    await page.waitForFunction(() =>
      document
        .querySelector('[role="status"]')
        ?.textContent.includes("Example complete"),
    );
    const example = await page.$eval(
      '[aria-label="Verification results"]',
      (n) => n.textContent,
    );
    assert.match(example, /3 matching links/);
    assert.match(example, /Image alt/);
    assert.match(example, /ugc, nofollow/);
    await page.select(
      '#backlink-checker [aria-label="Verification results"] select',
      "unverified",
    );
    await page.waitForFunction(() =>
      document.body.textContent.includes("No results match these filters."),
    );
    await page.select(
      '#backlink-checker [aria-label="Verification results"] select',
      "all",
    );
    const exportCsv = await page.evaluate(async () => {
      let captured = "";
      const original = URL.createObjectURL;
      URL.createObjectURL = (blob) => {
        blob.text().then((text) => {
          window.__csv = text;
        });
        return original(blob);
      };
      [...document.querySelectorAll("button")]
        .find((n) => n.textContent.includes("Export CSV"))
        .click();
      return true;
    });
    await page.waitForFunction(() => window.__csv?.includes("Source URL"));
    const csv = await page.evaluate(() => window.__csv);
    assert.equal(csv.trim().split("\r\n").length, 4);
    const invalid = await page.evaluate(async () => {
      const response = await fetch("/api/ai-tools/backlink-verifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "http://127.0.0.1/",
          sources: ["https://example.com/"],
        }),
      });
      return response.status;
    });
    assert.equal(invalid, 422);
    // Exercise saved comparisons with controlled live-response fixtures.
    // The real pasted-HTML route above remains the end-to-end parser check.
    const fixture = await page.evaluate(async () => {
      const form = document.querySelector("#backlink-checker");
      const response = await fetch("/api/ai-tools/backlink-verifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "https://example.com/guide",
          mode: "page",
          sources: ["https://publisher.example/resources"],
          html:
            form.querySelector("textarea.codeInput")?.value ||
            [...form.querySelectorAll("textarea")][1].value,
        }),
      });
      return (await response.json()).reports[0];
    });
    let scenario = "found";
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (request.url().endsWith("/api/ai-tools/backlink-verifier")) {
        const row = {
          ...fixture,
          method: "live",
          httpStatus: scenario === "unverified" ? 403 : 200,
          status: scenario === "missing" ? "not-found" : scenario,
          links: scenario === "found" ? fixture.links : [],
          error:
            scenario === "unverified"
              ? "Source access was blocked. Link presence is unknown."
              : "",
        };
        request
          .respond({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ reports: [row] }),
          })
          .catch(() => undefined);
      } else request.continue().catch(() => undefined);
    });
    await clickText(page, "Live page checks");
    await clickText(page, "Verify backlinks");
    await page.waitForFunction(() =>
      document
        .querySelector('[role="status"]')
        ?.textContent.includes("1 source pages checked"),
    );
    await clickText(page, "Save live baseline");
    await page.waitForFunction(() =>
      document
        .querySelector('[role="status"]')
        ?.textContent.includes("Baseline saved"),
    );
    assert.ok(
      await page.evaluate(() =>
        localStorage.getItem("doitwithai.backlink-baseline.v1"),
      ),
    );
    scenario = "missing";
    await clickText(page, "Verify backlinks");
    await page.waitForFunction(() =>
      document.body.textContent.includes(
        "Previously found; absent from current HTML",
      ),
    );
    scenario = "unverified";
    await clickText(page, "Verify backlinks");
    await page.waitForFunction(() =>
      document.body.textContent.includes("Unable to compare link presence"),
    );
    await clickText(page, "Remove baseline");
    assert.equal(
      await page.evaluate(() =>
        localStorage.getItem("doitwithai.backlink-baseline.v1"),
      ),
      null,
    );
    fs.writeFileSync(
      output + "/sources.csv",
      "Notes,Source URL\r\nOne,https://publisher.example/a\r\nTwo,https://publisher.example/b\r\nDuplicate,https://publisher.example/a\r\n",
    );
    await (
      await page.$('input[aria-label="Import source URLs"]')
    ).uploadFile(output + "/sources.csv");
    await page.waitForFunction(() =>
      document
        .querySelector('[role="status"]')
        ?.textContent.includes("2 unique source URLs imported"),
    );
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.$eval("#backlink-checker", (n) =>
      n.scrollIntoView({ block: "start" }),
    );
    await page.screenshot({
      path: output + "/mobile-dark.png",
      fullPage: true,
    });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    );
    assert.equal(overflow, false, "Mobile page has horizontal overflow");
    await page.evaluate(() =>
      document.documentElement.classList.remove("dark"),
    );
    await page.screenshot({
      path: output + "/mobile-light.png",
      fullPage: true,
    });
    assert.deepEqual(errors, [], "Browser runtime errors");
    console.log(
      JSON.stringify({
        canonical: true,
        examplePlacements: 3,
        imageAnchors: true,
        csvRows: 3,
        filters: true,
        privateTargetRejected: true,
        mobileOverflow: false,
        browserErrors: errors,
        baselineWorkflow: "controlled API fixtures",
        csvImport: true,
        screenshots: output,
      }),
    );
  } finally {
    await browser?.close();
    server?.kill("SIGTERM");
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
