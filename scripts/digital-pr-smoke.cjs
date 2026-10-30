const assert = require("node:assert/strict");
const fs = require("node:fs");
const { spawn, execFileSync } = require("node:child_process");
const puppeteer = require("puppeteer");
const output = process.env.SMOKE_OUTPUT || "/tmp/digital-pr-qa";
const origin = "http://localhost:40803";
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const downloads = output + "/downloads";
  fs.mkdirSync(downloads, { recursive: true });
  let browser, server;
  try {
    const log = fs.openSync(output + "/server.log", "w");
    server = spawn(
      process.execPath,
      ["node_modules/next/dist/bin/next", "start", "--port", "40803"],
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
    const errors = [];
    let apiRequests = 0;
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (r.url().includes("/api/ai-tools/")) apiRequests++;
    });
    const cdp = await page.createCDPSession();
    await cdp.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: downloads,
    });
    await page.goto(origin + "/tools/digital-pr-linkable-asset-planner", {
      waitUntil: "domcontentloaded",
    });
    assert.match(await page.title(), /Digital PR and Linkable Asset Planner/);
    assert.equal(
      await page.$eval('link[rel="canonical"]', (n) => n.href),
      "https://doitwithai.tools/tools/digital-pr-linkable-asset-planner",
    );
    async function clickText(text) {
      await page.evaluate((text) => {
        const b = [...document.querySelectorAll("button")].find(
          (b) => b.textContent.trim() === text,
        );
        if (!b) throw Error(text);
        b.click();
      }, text);
    }
    const submit = 'button[type="submit"]';
    await page.click(submit);
    await page.waitForSelector("#pr-topic-error");
    assert(await page.$eval("#pr-topic", (n) => document.activeElement === n));
    await page.type("#pr-topic", "Home energy saving");
    await page.keyboard.press("Tab");
    assert(
      await page.$eval("#pr-audience", (n) => document.activeElement === n),
    );
    await clickText("Load fictional example");
    await page.evaluate(() => {
      const native = requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (cb) =>
        native((t) => setTimeout(() => cb(t), 150));
    });
    async function build() {
      await page.focus(submit);
      await page.keyboard.press("Enter");
      await page.waitForSelector("dialog[open]");
      await page.waitForFunction(() => !document.querySelector("dialog")?.open);
    }
    await page.focus(submit);
    await page.keyboard.press("Enter");
    await page.waitForSelector("dialog[open]");
    await page.screenshot({ path: output + "/loading.png" });
    await page.waitForFunction(() => !document.querySelector("dialog")?.open);
    await page.waitForSelector("#pr-result-title");
    assert(
      await page.$eval(
        'section[aria-labelledby="pr-result-title"]',
        (n) => document.activeElement === n,
      ),
    );
    assert.match(
      await page.$eval("#pr-result-title", (n) => n.textContent),
      /research report/,
    );
    async function replace(selector, value) {
      await page.focus(selector);
      await page.keyboard.down("Control");
      await page.keyboard.press("KeyA");
      await page.keyboard.up("Control");
      await page.keyboard.press("Backspace");
      await page.type(selector, value);
    }
    await replace("#pr-plan-title", "Reviewed energy campaign");
    await page.focus("#pr-section-angle");
    await page.keyboard.down("Control");
    await page.keyboard.press("End");
    await page.keyboard.up("Control");
    await page.type("#pr-section-angle", "\nReviewed angle for export.");
    assert(
      await page.$eval(
        "#pr-section-angle",
        (n) => document.activeElement === n,
      ),
    );
    await page.focus(
      'section[aria-labelledby="pr-result-title"] input[type="checkbox"]',
    );
    await page.keyboard.press("Space");
    await replace("#pr-task-0-owner", "Reviewed owner");
    for (const label of ["DOCX plan", "Markdown plan", "CSV action list"])
      await clickText("Download " + label);
    for (
      let i = 0;
      i < 100 &&
      !["md", "docx", "csv"].every((ext) =>
        fs.existsSync(`${downloads}/digital-pr-plan.${ext}`),
      );
      i++
    )
      await new Promise((r) => setTimeout(r, 100));
    const report = JSON.parse(
      execFileSync(
        process.env.CODEX_PRIMARY_RUNTIME_PYTHON || "python3",
        [
          "-c",
          `import sys,zipfile,json,csv,xml.etree.ElementTree as E
from pathlib import Path
from docx import Document
p=Path(sys.argv[1]);z=zipfile.ZipFile(p/'digital-pr-plan.docx');assert z.testzip() is None
[E.fromstring(z.read(n)) for n in z.namelist() if n.endswith(('.xml','.rels'))]
d=Document(p/'digital-pr-plan.docx');t='\\n'.join(p.text for p in d.paragraphs)
assert 'Reviewed angle for export.' in t and 'Reviewed energy campaign' in t and 'Reviewed owner' in t
m=(p/'digital-pr-plan.md').read_text();assert 'Reviewed angle for export.' in m and '- [x]' in m
rows=list(csv.DictReader((p/'digital-pr-plan.csv').open(encoding='utf-8-sig',newline='')));assert len(rows)==7 and rows[0]['Owner']=='Reviewed owner' and rows[0]['Status']=='Done (self-reported)'
print(json.dumps({'validZip':True,'xmlParts':len(z.namelist()),'paragraphs':len(d.paragraphs),'csvActions':len(rows),'editedDownloads':True}))`,
          downloads,
        ],
        { encoding: "utf8" },
      ),
    );
    // Input edits must not overwrite the refined plan.
    await page.type("#pr-topic", " updated");
    assert.equal(
      await page.$eval("#pr-plan-title", (n) => n.value),
      "Reviewed energy campaign",
    );
    await page.focus(submit);
    await page.keyboard.press("Enter");
    await page.waitForSelector("dialog[open]");
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector("dialog")?.open);
    assert.equal(
      await page.$eval("#pr-plan-title", (n) => n.value),
      "Reviewed energy campaign",
    );
    // Failed download must be understandable, without crashing or faking success.
    await page.evaluate(() => {
      window.__originalCreate = URL.createObjectURL;
      URL.createObjectURL = () => {
        throw Error("Unavailable");
      };
    });
    await clickText("Download Markdown plan");
    await page.waitForFunction(() =>
      [...document.querySelectorAll('[role="status"]')].some((n) =>
        n.textContent.includes("could not be prepared"),
      ),
    );
    await page.evaluate(() => {
      URL.createObjectURL = window.__originalCreate;
    });
    await replace("#pr-plan-title", "");
    await clickText("Download DOCX plan");
    await page.waitForFunction(() =>
      [...document.querySelectorAll('[role="status"]')].some((n) =>
        n.textContent.includes("Add a plan title"),
      ),
    );
    await replace("#pr-plan-title", "Reviewed energy campaign");
    await page.select("#pr-evidence", "owned");
    await replace("#pr-evidenceNotes", "");
    await page.click(submit);
    await page.waitForSelector("#pr-evidenceNotes-error");
    assert(
      await page.$eval(
        "#pr-evidenceNotes",
        (n) => document.activeElement === n,
      ),
    );
    await page.select("#pr-evidence", "none");
    await build();
    assert.match(
      await page.$eval("#pr-result-title", (n) => n.textContent),
      /practical guide/,
    );
    assert.match(
      await page.$eval("#pr-section-evidence", (n) => n.value),
      /not been collected/,
    );
    const summary = "form details summary";
    await page.focus(summary);
    await page.keyboard.press("Enter");
    await page.waitForSelector("form details[open]");
    for (const [format, pattern] of [
      ["tool", "calculator or worksheet"],
      ["visual", "visual explainer"],
      ["report", "research report"],
    ]) {
      await page.select("#pr-format", format);
      await build();
      assert(
        (await page.$eval("#pr-result-title", (n) => n.textContent)).includes(
          pattern,
        ),
      );
    }
    await page.select("#pr-format", "auto");
    await page.select("#pr-evidence", "expert");
    await page.type(
      "#pr-evidenceNotes",
      "Interview access still needs confirmation.",
    );
    await build();
    assert.match(
      await page.$eval("#pr-result-title", (n) => n.textContent),
      /practical guide/,
    );
    await page.$eval("form", (n) => n.scrollIntoView({ block: "start" }));
    await page.screenshot({ path: output + "/desktop-form.png" });
    await page.$eval("#pr-result-title", (n) =>
      n.scrollIntoView({ block: "start" }),
    );
    await page.screenshot({ path: output + "/desktop-result.png" });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: output + "/desktop.png" });
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluate(() => scrollTo(0, 0));
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await page.screenshot({ path: output + "/mobile-light.png" });
    await page.$eval("form", (n) => n.scrollIntoView({ block: "start" }));
    await page.screenshot({ path: output + "/mobile-form.png" });
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.screenshot({ path: output + "/mobile-dark.png" });
    await page.$eval("#pr-result-title", (n) =>
      n.scrollIntoView({ block: "start" }),
    );
    await page.screenshot({ path: output + "/mobile-result-dark.png" });
    assert.equal(apiRequests, 0);
    assert.deepEqual(errors, []);
    await page.goto(origin + "/tools", { waitUntil: "domcontentloaded" });
    assert(await page.$('a[href="/tools/digital-pr-linkable-asset-planner"]'));
    const search = await page.$('input[type="search"]');
    if (search) {
      await search.type("digital PR");
      assert(
        await page.$('a[href="/tools/digital-pr-linkable-asset-planner"]'),
      );
    }
    await page.goto(origin + "/tools/categories/ai-seo", {
      waitUntil: "domcontentloaded",
    });
    assert(await page.$('a[href="/tools/digital-pr-linkable-asset-planner"]'));
    console.log(
      JSON.stringify({
        passed: true,
        inlineErrors: true,
        keyboard: true,
        loading: true,
        cancelKeepsPlan: true,
        resultFocus: true,
        allFormats: true,
        allEvidenceModes: true,
        editedDownloads: report,
        downloadFailure: true,
        catalog: true,
        mobileOverflow: false,
        runtimeErrors: errors,
        apiRequests,
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
