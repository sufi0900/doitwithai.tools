const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  { spawn, execFileSync } = require("node:child_process"),
  puppeteer = require("puppeteer");
const output = process.env.SMOKE_OUTPUT || "/tmp/article-pdf-qa",
  origin = "http://localhost:40804";
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const downloads = output + "/downloads";
  fs.mkdirSync(downloads, { recursive: true });
  let browser, server;
  try {
    const log = fs.openSync(output + "/server.log", "w");
    server = spawn(
      process.execPath,
      ["node_modules/next/dist/bin/next", "start", "--port", "40804"],
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
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
    await page.setViewport({ width: 1440, height: 1000 });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const cdp = await page.createCDPSession();
    await cdp.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: downloads,
    });
    await page.goto(origin + "/tools/article-to-pdf", {
      waitUntil: "domcontentloaded",
    });
    assert.match(await page.title(), /Article to PDF/);
    assert.equal(
      await page.$eval('link[rel="canonical"]', (n) => n.href),
      "https://doitwithai.tools/tools/article-to-pdf",
    );
    async function click(text) {
      await page.evaluate((t) => {
        const b = [...document.querySelectorAll("button,a")].find(
          (n) => n.textContent.trim() === t,
        );
        if (!b) throw Error(t);
        b.click();
      }, text);
    }
    async function replace(selector, text) {
      await page.focus(selector);
      await page.keyboard.down("Control");
      await page.keyboard.press("KeyA");
      await page.keyboard.up("Control");
      await page.keyboard.press("Backspace");
      await page.type(selector, text);
    }
    const submit = 'button[type="submit"]';
    await page.focus(submit);
    await page.keyboard.press("Enter");
    await page.waitForSelector("#article-source-error");
    assert(
      await page.$eval("#article-source", (n) => document.activeElement === n),
    );
    await click("Paste text");
    await page.focus(submit);
    await page.keyboard.press("Enter");
    await page.waitForSelector("#article-content-error");
    assert(
      await page.$eval("#article-content", (n) => document.activeElement === n),
    );
    await click("Load fictional example");
    await page.evaluate(() => {
      const native = requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (cb) =>
        native((t) => setTimeout(() => cb(t), 120));
    });
    await page.focus(submit);
    await page.keyboard.press("Enter");
    await page.waitForSelector("dialog[open]");
    await page.screenshot({ path: output + "/loading.png" });
    await page.waitForFunction(() => !document.querySelector("dialog")?.open);
    await page.waitForSelector("#article-review-title");
    assert(
      await page.$eval(
        'section[aria-labelledby="article-review-title"]',
        (n) => document.activeElement === n,
      ),
    );
    assert.equal(
      await page.$eval("#article-title", (n) => n.value),
      "A calmer reading workflow",
    );
    assert(await page.$("section table"));
    await replace("#article-title", "Reviewed reading copy");
    await click("Edit article sections");
    const textarea = 'textarea[id^="article-block-"]';
    await page.focus(textarea);
    await page.keyboard.down("Control");
    await page.keyboard.press("End");
    await page.keyboard.up("Control");
    await page.type(textarea, " Reviewed wording for PDF export.");
    assert(await page.$eval(textarea, (n) => document.activeElement === n));
    await click("Finish editing");
    await page.evaluate(() =>
      [...document.querySelectorAll("summary")]
        .find((n) => n.textContent.includes("PDF layout options"))
        .click(),
    );
    await page.select("#article-size", "letter");
    async function pdf() {
      await click("Create downloadable PDF");
      await page.waitForSelector("dialog[open]");
      await page.waitForFunction(
        () => !document.querySelector("dialog")?.open,
        { timeout: 45000 },
      );
      await page.waitForSelector("#article-result-title");
    }
    await pdf();
    assert(
      await page.$eval(
        'section[aria-labelledby="article-result-title"]',
        (n) => document.activeElement === n,
      ),
    );
    await click("Download PDF");
    for (
      let i = 0;
      i < 100 && !fs.existsSync(downloads + "/Reviewed-reading-copy.pdf");
      i++
    )
      await new Promise((r) => setTimeout(r, 100));
    assert(fs.existsSync(downloads + "/Reviewed-reading-copy.pdf"));
    const info = JSON.parse(
      execFileSync(
        process.env.CODEX_PRIMARY_RUNTIME_PYTHON || "python3",
        [
          "-c",
          `import sys,json
from pypdf import PdfReader
r=PdfReader(sys.argv[1]);t='\\n'.join(p.extract_text() or '' for p in r.pages);assert 'Reviewed wording for PDF export.' in t and 'Choose A4 or Letter' in t
assert abs(float(r.pages[0].mediabox.width)-612)<1
links=[x.get_object().get('/A',{}).get('/URI') for p in r.pages for x in p.get('/Annots',[])];assert any('developer.mozilla.org' in str(x) for x in links)
assert '/Font' in r.pages[0]['/Resources'];print(json.dumps({'pages':len(r.pages),'letter':True,'textPreserved':True,'clickableLinks':True}))`,
          downloads + "/Reviewed-reading-copy.pdf",
        ],
        { encoding: "utf8" },
      ),
    );
    await replace("#article-title", "Changed title");
    assert(
      await page.evaluate(() =>
        document.body.textContent.includes("The article or layout changed"),
      ),
    );
    const previous = await page.$eval("a[download]", (n) => n.href);
    await click("Create downloadable PDF");
    await page.waitForSelector("dialog[open]");
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector("dialog")?.open);
    assert.equal(await page.$eval("a[download]", (n) => n.href), previous);
    // Actual production API validation and fail-closed behavior, before fixture interception.
    const invalid = await page.evaluate(async () => {
      const r = await fetch("/api/ai-tools/article-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "http://localhost" }),
      });
      return r.status;
    });
    assert.equal(invalid, 422);
    const unavailable = await page.evaluate(async () => {
      const r = await fetch("/api/ai-tools/article-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example.com/article" }),
      });
      return { status: r.status, body: await r.json() };
    });
    assert.equal(unavailable.status, 503);
    assert.match(unavailable.body.error.message, /Paste/);
    const imageData =
      "data:image/png;base64," +
      execFileSync(
        process.env.CODEX_PRIMARY_RUNTIME_PYTHON || "python3",
        [
          "-c",
          "import struct,zlib,base64;chunk=lambda t,d:struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff);png=bytes([137,80,78,71,13,10,26,10])+chunk(b'IHDR',struct.pack('>IIBBBBB',80,40,8,2,0,0,0))+chunk(b'IDAT',zlib.compress((bytes([0])+bytes([82,113,255])*80)*40))+chunk(b'IEND',b'');print(base64.b64encode(png).decode())",
        ],
        { encoding: "utf8" },
      ).trim();
    const fixture = JSON.parse(
      execFileSync(
        process.execPath,
        [
          "--import",
          "tsx",
          "-e",
          `const {extractArticle}=require('./features/article-conversion/extract.ts');const {exampleHtml}=require('./features/article-conversion/model.ts');console.log(JSON.stringify(extractArticle(exampleHtml.replace('</article>','<img src=\"https://example.com/diagram.png\" alt=\"Example diagram\"><img src=\"https://example.com/blocked.png\" alt=\"Blocked diagram\"></article>'),'https://example.com/article')));`,
        ],
        { encoding: "utf8" },
      ),
    );
    let apiMode = "success";
    await page.setRequestInterception(true);
    page.on("request", (r) => {
      if (r.url().endsWith("/api/ai-tools/article-import")) {
        if (apiMode === "slow")
          setTimeout(
            () =>
              r
                .respond({
                  status: 200,
                  contentType: "application/json",
                  body: JSON.stringify({ article: fixture }),
                })
                .catch(() => {}),
            1500,
          );
        else if (apiMode === "limit")
          r.respond({
            status: 429,
            contentType: "application/json",
            body: JSON.stringify({
              error: {
                message:
                  "The import allowance was reached. Wait or use pasted content.",
              },
            }),
          });
        else
          r.respond({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ article: fixture }),
          });
      } else if (r.url().endsWith("/api/ai-tools/article-image")) {
        const blocked = r.postData().includes("blocked.png");
        r.respond({
          status: blocked ? 403 : 200,
          contentType: "application/json",
          body: JSON.stringify(
            blocked
              ? { error: { message: "Blocked image" } }
              : { data: imageData },
          ),
        });
      } else r.continue();
    });
    await click("Article URL");
    await replace("#article-source", "https://example.com/article");
    apiMode = "limit";
    await page.focus(submit);
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => !document.querySelector("dialog")?.open);
    await page.waitForFunction(() =>
      document
        .querySelector("#article-source-error")
        ?.textContent.includes("allowance"),
    );
    apiMode = "success";
    await page.focus(submit);
    await page.keyboard.press("Enter");
    await page.waitForFunction(
      () =>
        document.querySelector("#article-title")?.value ===
        "A calmer reading workflow",
    );
    await page.waitForFunction(() => !document.querySelector("dialog")?.open);
    apiMode = "slow";
    await page.focus(submit);
    await page.keyboard.press("Enter");
    await page.waitForSelector("dialog[open]");
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector("dialog")?.open);
    assert.equal(
      await page.$eval("#article-title", (n) => n.value),
      "A calmer reading workflow",
    );
    await replace("#article-title", "Image reading copy");
    const imageChecks = await page.$$(
      'section[aria-labelledby="article-review-title"] input[type="checkbox"]',
    );
    assert.equal(imageChecks.length, 2);
    for (const box of imageChecks) {
      await box.focus();
      await page.keyboard.press("Space");
    }
    await pdf();
    assert(
      await page.evaluate(() =>
        document.body.textContent.includes("Image omitted: Blocked diagram"),
      ),
    );
    await click("Download PDF");
    for (
      let i = 0;
      i < 100 && !fs.existsSync(downloads + "/Image-reading-copy.pdf");
      i++
    )
      await new Promise((r) => setTimeout(r, 100));
    execFileSync(process.env.CODEX_PRIMARY_RUNTIME_PYTHON || "python3", [
      "-c",
      "from pypdf import PdfReader;import sys;r=PdfReader(sys.argv[1]);assert sum(len(p.images) for p in r.pages)>=1;assert 'Image omitted: Blocked diagram' in '\\n'.join(p.extract_text() or '' for p in r.pages)",
      downloads + "/Image-reading-copy.pdf",
    ]);
    // Local pasted Urdu remains real processing, without a mocked conversion response.
    await click("Paste text");
    await replace("#article-source", "");
    await replace(
      "#article-content",
      "# پڑھنے کا آسان طریقہ\n\nیہ مضمون آف لائن پڑھنے کے لیے محفوظ کیا جا سکتا ہے۔ پہلے عنوان اور اصل ماخذ کو اچھی طرح دیکھیں۔\n\n## اہم نکات\n\nواضح عنوانات اور مناسب سطر بندی سے مضمون پڑھنا آسان ہوتا ہے۔",
    );
    await page.focus(submit);
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => !document.querySelector("dialog")?.open);
    await page.waitForFunction(
      () =>
        document.querySelector("#article-title")?.value === "Untitled article",
    );
    await replace("#article-title", "اردو مضمون");
    await pdf();
    await click("Download PDF");
    for (
      let i = 0;
      i < 100 && !fs.existsSync(downloads + "/اردو-مضمون.pdf");
      i++
    )
      await new Promise((r) => setTimeout(r, 100));
    assert(fs.existsSync(downloads + "/اردو-مضمون.pdf"));
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: output + "/desktop.png" });
    await page.$eval('section[aria-labelledby="article-result-title"]', (n) =>
      n.scrollIntoView(),
    );
    await page.screenshot({ path: output + "/desktop-result.png" });
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => scrollTo(0, 0));
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await page.screenshot({ path: output + "/mobile-light.png" });
    await page.$eval("form", (n) => n.scrollIntoView());
    await page.screenshot({ path: output + "/mobile-form.png" });
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.screenshot({ path: output + "/mobile-dark.png" });
    await page.$eval('section[aria-labelledby="article-result-title"]', (n) =>
      n.scrollIntoView(),
    );
    await page.screenshot({ path: output + "/mobile-result-dark.png" });
    assert.deepEqual(errors, []);
    await page.goto(origin + "/tools", { waitUntil: "domcontentloaded" });
    assert(await page.$('a[href="/tools/article-to-pdf"]'));
    await page.type('input[type="search"]', "article pdf");
    assert(await page.$('a[href="/tools/article-to-pdf"]'));
    await page.goto(origin + "/tools/categories/content-conversion", {
      waitUntil: "domcontentloaded",
    });
    assert(await page.$('a[href="/tools/article-to-pdf"]'));
    const robots = await page.$eval('meta[name="robots"]', (n) => n.content);
    assert(!robots.includes("noindex"));
    console.log(
      JSON.stringify({
        passed: true,
        pdf: info,
        urduDownload: true,
        inlineErrors: true,
        keyboard: true,
        loading: true,
        cancellation: true,
        resultFocus: true,
        editing: true,
        apiValidation: true,
        productionFailClosed: true,
        urlFlowFixtures: true,
        imageExport: true,
        partialImageFailure: true,
        mobileOverflow: false,
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
