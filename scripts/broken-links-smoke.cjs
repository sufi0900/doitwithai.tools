const assert = require("node:assert/strict");
const fs = require("node:fs");
const { spawn, execFileSync } = require("node:child_process");
const puppeteer = require("puppeteer");
const output = process.env.SMOKE_OUTPUT || "/tmp/broken-links-qa";
const origin = "http://localhost:40797";
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const downloads = output + "/downloads";
  fs.mkdirSync(downloads, { recursive: true });
  let browser, server;
  try {
    const log = fs.openSync(output + "/server.log", "w");
    server = spawn(
      process.execPath,
      ["node_modules/next/dist/bin/next", "start", "--port", "40797"],
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
      if (server.exitCode !== null) throw Error("Server exited");
      try {
        await fetch(origin + "/favicon.ico");
        ready = true;
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    assert(ready);
    browser = await puppeteer.launch({
      headless: "shell",
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1000 });
    const runtimeErrors = [];
    page.on("pageerror", (e) => runtimeErrors.push(e.message));
    const cdp = await page.createCDPSession();
    await cdp.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: downloads,
    });
    await page.goto(origin + "/tools/broken-link-opportunity-finder", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector("#broken-sources");
    assert.match(await page.title(), /Broken Link Opportunity/);
    assert.equal(
      await page.$eval('link[rel="canonical"]', (n) => n.href),
      "https://doitwithai.tools/tools/broken-link-opportunity-finder",
    );
    const submit = 'form button:not([type]), form button[type="submit"]';
    await page.click(submit);
    await page.waitForSelector("#broken-source-error");
    assert(
      await page.$eval("#broken-sources", (n) => document.activeElement === n),
    );
    async function fill(value) {
      await page.focus("#broken-sources");
      await page.keyboard.down("Control");
      await page.keyboard.press("KeyA");
      await page.keyboard.up("Control");
      await page.keyboard.press("Backspace");
      await page.type("#broken-sources", value);
    }
    await fill("http://127.0.0.1/page");
    await page.focus(submit);
    await page.keyboard.press("Enter");
    await page.waitForFunction(() =>
      document
        .querySelector('[role="alert"]')
        ?.textContent.includes("public publisher"),
    );
    assert.equal(await page.$("#broken-results-title"), null);
    const real = await page.evaluate(async () => {
      const r = await fetch("/api/ai-tools/broken-links", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source: "https://example.com/resources" }),
      });
      return { status: r.status, body: await r.json() };
    });
    assert.equal(real.status, 503);
    assert.match(real.body.error.message, /temporarily unavailable/);
    let mode = "success",
      calls = 0,
      lastBody;
    await page.setRequestInterception(true);
    page.on("request", async (request) => {
      if (!request.url().endsWith("/api/ai-tools/broken-links"))
        return request.continue();
      calls++;
      lastBody = JSON.parse(request.postData());
      const current = mode;
      await new Promise((r) => setTimeout(r, 650));
      const checkedAt = "2026-10-27T00:00:00Z";
      const report = {
        sourceUrl: lastBody.source,
        finalSourceUrl: lastBody.source,
        title: "Fixture resource list",
        method: lastBody.html ? "pasted" : "live",
        sourceStatus: lastBody.html ? null : 200,
        totalExternal: 2,
        checkedCount: 2,
        notes: ["Fixture responses for browser verification."],
        error: "",
        checkedAt,
        rows: [
          {
            href: "https://resource.org/old",
            finalUrl: "https://resource.org/old",
            anchor: "=SUM(1,2)",
            context: "A useful guide, with source context.",
            rel: ["nofollow"],
            occurrences: 1,
            httpStatus: 404,
            redirects: [],
            state: "broken",
            reason: "HTTP 404 candidate for manual review.",
            checkedAt,
          },
          {
            href: "https://limited.org/guide",
            finalUrl: "https://limited.org/guide",
            anchor: "Restricted resource",
            context: "Needs a separate check.",
            rel: [],
            occurrences: 1,
            httpStatus: 403,
            redirects: [],
            state: "unverified",
            reason: "Access is restricted, rather than confirmed missing.",
            checkedAt,
          },
        ],
      };
      try {
        await request.respond({
          status: current === "error" ? 429 : 200,
          contentType: "application/json",
          body: JSON.stringify(
            current === "error"
              ? { error: { message: "Your live-check allowance was reached." } }
              : { report },
          ),
        });
      } catch {}
    });
    async function run(value = "https://publisher.com/resources") {
      await fill(value);
      await page.focus(submit);
      await page.keyboard.press("Enter");
      await page.waitForSelector("dialog[open]");
    }
    await run();
    await page.screenshot({ path: output + "/loading.png" });
    await page.waitForSelector("#broken-results-title");
    await page.waitForFunction(() => !document.querySelector("dialog")?.open);
    assert(
      await page.$eval(
        'section[aria-labelledby="broken-results-title"]',
        (n) => document.activeElement === n,
      ),
    );
    assert.equal(lastBody.limit, 15);
    await page.screenshot({ path: output + "/desktop.png", fullPage: true });
    async function clickText(text) {
      await page.evaluate((text) => {
        const button = [...document.querySelectorAll("button")].find((b) =>
          b.textContent.includes(text),
        );
        if (!button) throw Error(text);
        button.click();
      }, text);
    }
    await clickText("Export all evidence CSV");
    await clickText("Export candidates CSV");
    for (
      let i = 0;
      i < 80 && !fs.existsSync(downloads + "/broken-link-candidates.csv");
      i++
    )
      await new Promise((r) => setTimeout(r, 100));
    const parsed = JSON.parse(
      execFileSync(
        "python",
        [
          "-c",
          'import csv,json,sys; print(json.dumps(list(csv.DictReader(open(sys.argv[1],encoding="utf-8-sig",newline="")))))',
          downloads + "/broken-link-evidence.csv",
        ],
        { encoding: "utf8" },
      ),
    );
    assert.equal(parsed.length, 2);
    assert.equal(parsed[0]["Destination HTTP status"], "404");
    assert.equal(parsed[1]["Destination HTTP status"], "403");
    assert.equal(parsed[0]["Anchor text"], "'=SUM(1,2)");
    assert.equal(parsed[0]["Source URL"], "https://publisher.com/resources");
    const candidates = JSON.parse(
      execFileSync(
        "python",
        [
          "-c",
          'import csv,json,sys; print(json.dumps(list(csv.DictReader(open(sys.argv[1],encoding="utf-8-sig",newline="")))))',
          downloads + "/broken-link-candidates.csv",
        ],
        { encoding: "utf8" },
      ),
    );
    assert.equal(candidates.length, 1);
    await clickText("Unverified");
    assert.equal(await page.$$eval("article details", (n) => n.length), 1);
    assert.match(
      await page.$eval("article details", (n) => n.textContent),
      /Restricted resource/,
    );
    await clickText("All evidence");
    await page.setViewport({ width: 390, height: 844 });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await page.screenshot({
      path: output + "/mobile-light.png",
      fullPage: true,
    });
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.screenshot({
      path: output + "/mobile-dark.png",
      fullPage: true,
    });
    await page.setViewport({ width: 1440, height: 1000 });
    await page.evaluate(() => {
      document.querySelector("form details").open = true;
    });
    await page.focus('input[type="radio"][name="broken-mode"]:not(:checked)');
    await page.keyboard.press("Space");
    await page.waitForSelector("#broken-html");
    await fill("https://publisher.com/resources");
    await page.focus(submit);
    await page.keyboard.press("Enter");
    await page.waitForSelector("#broken-html-error");
    assert(
      await page.$eval("#broken-html", (n) => document.activeElement === n),
    );
    await page.type(
      "#broken-html",
      '<main><a href="https://resource.org/old">Old guide</a></main>',
    );
    await page.focus(submit);
    await page.keyboard.press("Enter");
    await page.waitForSelector("dialog[open]");
    await page.waitForFunction(() => !document.querySelector("dialog")?.open);
    assert(lastBody.html);
    assert.match(
      await page.$eval("article", (n) => n.textContent),
      /Supplied HTML source/,
    );
    await page.focus('input[type="radio"][name="broken-mode"]:not(:checked)');
    await page.keyboard.press("Space");
    mode = "error";
    await run();
    await page.waitForFunction(() =>
      [...document.querySelectorAll('[role="alert"]')].some((n) =>
        n.textContent.includes("allowance"),
      ),
    );
    mode = "success";
    await run();
    await page.click("dialog button");
    await page.waitForFunction(() => !document.querySelector("dialog")?.open);
    await page.waitForFunction(() =>
      [...document.querySelectorAll('[role="alert"]')].some((n) =>
        n.textContent.includes("stopped"),
      ),
    );
    assert.equal(await page.$("#broken-results-title"), null);
    await page.goto(origin + "/tools", { waitUntil: "domcontentloaded" });
    assert(await page.$('a[href="/tools/broken-link-opportunity-finder"]'));
    assert.deepEqual(runtimeErrors, []);
    console.log(
      JSON.stringify({
        passed: true,
        desktop: true,
        mobileLightDark: true,
        mobileOverflow: false,
        loading: true,
        cancel: true,
        inlineErrors: true,
        resultFocus: true,
        htmlMode: true,
        filters: true,
        csvFilesParsed: true,
        catalog: true,
        runtimeErrors,
        provider:
          "Browser successes use fixtures; actual API validation and fail-closed infrastructure response verified.",
        downloads,
      }),
    );
  } finally {
    await browser?.close();
    server?.kill("SIGTERM");
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
