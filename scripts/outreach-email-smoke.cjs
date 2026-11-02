const assert = require("node:assert/strict");
const fs = require("node:fs");
const { spawn, execFileSync } = require("node:child_process");
const puppeteer = require("puppeteer");
const output = process.env.SMOKE_OUTPUT || "/tmp/outreach-email-qa";
const origin = "http://localhost:40798";
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const downloads = output + "/downloads";
  fs.mkdirSync(downloads, { recursive: true });
  let browser, server;
  try {
    const log = fs.openSync(output + "/server.log", "w");
    server = spawn(
      process.execPath,
      ["node_modules/next/dist/bin/next", "start", "--port", "40798"],
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
    let draftApiRequests = 0;
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (r.url().includes("/api/ai-tools/")) draftApiRequests++;
    });
    const cdp = await page.createCDPSession();
    await cdp.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: downloads,
    });
    await page.goto(origin + "/tools/outreach-email-builder", {
      waitUntil: "domcontentloaded",
    });
    assert.match(await page.title(), /Outreach Email Builder/);
    assert.equal(
      await page.$eval('link[rel="canonical"]', (n) => n.href),
      "https://doitwithai.tools/tools/outreach-email-builder",
    );
    const submit = 'form button:not([type]),form button[type="submit"]';
    await page.click(submit);
    await page.waitForSelector("#outreach-sourceUrl-error");
    assert(
      await page.$eval(
        "#outreach-sourceUrl",
        (n) => document.activeElement === n,
      ),
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
    await clickText("Load fictional example");
    // Slow animation frames only in QA so the short local build can be inspected and cancelled.
    await page.evaluate(() => {
      const native = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (cb) =>
        native((t) => setTimeout(() => cb(t), 120));
    });
    await page.focus(submit);
    await page.keyboard.press("Enter");
    await page.waitForSelector("dialog[open]");
    await page.screenshot({ path: output + "/loading.png" });
    await page.waitForSelector("#outreach-result-title");
    await page.waitForFunction(() => !document.querySelector("dialog")?.open);
    assert(
      await page.$eval(
        'section[aria-labelledby="outreach-result-title"]',
        (n) => document.activeElement === n,
      ),
    );
    assert.match(await page.$eval("#outreach-body", (n) => n.value), /Hi Sam/);
    assert(await page.$("#outreach-follow-up"));
    async function replace(selector, value) {
      await page.focus(selector);
      await page.keyboard.down("Control");
      await page.keyboard.press("KeyA");
      await page.keyboard.up("Control");
      await page.keyboard.press("Backspace");
      await page.type(selector, value);
    }
    await replace("#outreach-subject", "Reviewed resource suggestion");
    await page.focus("#outreach-body");
    await page.keyboard.down("Control");
    await page.keyboard.press("End");
    await page.keyboard.up("Control");
    await page.type("#outreach-body", "\n\nReviewed wording for export.");
    assert(
      await page.$eval("#outreach-body", (n) => document.activeElement === n),
    );
    await clickText("Download TXT");
    await clickText("Download DOCX");
    for (
      let i = 0;
      i < 100 &&
      (!fs.existsSync(downloads + "/outreach-email-draft.docx") ||
        !fs.existsSync(downloads + "/outreach-email-draft.txt"));
      i++
    )
      await new Promise((r) => setTimeout(r, 100));
    const txt = fs.readFileSync(
      downloads + "/outreach-email-draft.txt",
      "utf8",
    );
    assert(txt.startsWith("Subject: Reviewed resource suggestion"));
    assert(txt.includes("Reviewed wording for export."));
    assert(txt.includes("Optional follow-up draft"));
    const python = process.env.CODEX_PRIMARY_RUNTIME_PYTHON || "python3";
    const report = JSON.parse(
      execFileSync(
        python,
        [
          "-c",
          'import sys,zipfile,json,xml.etree.ElementTree as E; from docx import Document; p=sys.argv[1]; z=zipfile.ZipFile(p); assert z.testzip() is None; [E.fromstring(z.read(n)) for n in z.namelist() if n.endswith((".xml",".rels"))]; d=Document(p); t="\\n".join(p.text for p in d.paragraphs); assert "Reviewed resource suggestion" in t and "Reviewed wording for export." in t; print(json.dumps({"validZip":True,"parts":z.namelist(),"paragraphs":len(d.paragraphs)}))',
          downloads + "/outreach-email-draft.docx",
        ],
        { encoding: "utf8" },
      ),
    );
    assert(report.validZip);
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => {
            window.__copiedDraft = text;
          },
        },
      });
    });
    await clickText("Copy draft");
    await page.waitForFunction(() =>
      window.__copiedDraft?.includes("Reviewed wording for export."),
    );
    await page.evaluate(() => {
      navigator.clipboard.writeText = async () => {
        throw new Error("Permission denied");
      };
    });
    await clickText("Copy draft");
    await page.waitForFunction(() =>
      [...document.querySelectorAll('[role="status"]')].some((n) =>
        n.textContent.includes("Clipboard access is unavailable"),
      ),
    );
    await page.screenshot({ path: output + "/desktop.png", fullPage: true });
    await clickText("Broken-link replacement");
    await page.focus(submit);
    await page.keyboard.press("Enter");
    await page.waitForSelector("#outreach-brokenUrl-error");
    assert(
      await page.$eval(
        "#outreach-brokenUrl",
        (n) => document.activeElement === n,
      ),
    );
    await page.type("#outreach-brokenUrl", "https://old.example/resource");
    await page.focus(submit);
    await page.keyboard.press("Enter");
    await page.waitForFunction(() =>
      document
        .querySelector("#outreach-body")
        ?.value.includes("If it is still unavailable"),
    );
    await page.waitForFunction(() => !document.querySelector("dialog")?.open);
    await clickText("Unlinked brand mention");
    await page.focus(submit);
    await page.keyboard.press("Enter");
    await page.waitForSelector("#outreach-brand-error");
    await page.type("#outreach-brand", "Acme");
    await page.focus(submit);
    await page.keyboard.press("Enter");
    await page.waitForFunction(() =>
      document
        .querySelector("#outreach-body")
        ?.value.includes("mention of Acme"),
    );
    await page.waitForFunction(() => !document.querySelector("dialog")?.open);
    const previous = await page.$eval("#outreach-body", (n) => n.value);
    await page.focus(submit);
    await page.keyboard.press("Enter");
    await page.waitForSelector("dialog[open]");
    await page.click("dialog button");
    await page.waitForFunction(() => !document.querySelector("dialog")?.open);
    assert.equal(await page.$eval("#outreach-body", (n) => n.value), previous);
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
    assert.equal(draftApiRequests, 0);
    assert.deepEqual(errors, []);
    await page.goto(origin + "/tools", { waitUntil: "domcontentloaded" });
    assert(await page.$('a[href="/tools/outreach-email-builder"]'));
    console.log(
      JSON.stringify({
        passed: true,
        inlineErrors: true,
        allPurposes: true,
        editableDraft: true,
        loading: true,
        cancelKeepsDraft: true,
        resultFocus: true,
        mobileLightDark: true,
        mobileOverflow: false,
        txtValidated: true,
        docxValidated: true,
        docxReport: report,
        draftApiRequests,
        runtimeErrors: errors,
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
