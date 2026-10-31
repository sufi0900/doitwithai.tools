import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { load } from "cheerio";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import ToolUrlInput from "../../features/tool-ui/ToolUrlInput";

test("URL suggestions retain native controls, labels, values, and unique list identifiers", () => {
  const html = renderToString(
    createElement(
      "form",
      null,
      createElement("label", { htmlFor: "page-a" }, "Page URL"),
      createElement(ToolUrlInput, {
        id: "page-a",
        type: "url",
        value: "https://example.com/page",
        readOnly: true,
        className: "custom-input",
      }),
      createElement(ToolUrlInput, {
        id: "page-b",
        type: "url",
        value: "",
        readOnly: true,
      }),
    ),
  );
  const $ = load(html),
    a = $("#page-a"),
    b = $("#page-b");
  assert.equal(a.attr("value"), "https://example.com/page");
  assert.equal(a.attr("type"), "url");
  assert.equal(a.attr("class"), "custom-input");
  assert.notEqual(a.attr("list"), b.attr("list"));
  assert.equal($("datalist").length, 2);
  assert.equal($("label").attr("for"), a.attr("id"));
  assert.equal($("button[type=submit]").length, 0);
});
test("all existing single URL fields use the shared suggestion component", () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory()
        ? walk(join(dir, entry.name))
        : entry.name.endsWith(".tsx")
          ? [join(dir, entry.name)]
          : [],
    );
  const misses: string[] = [];
  let fields = 0;
  for (const path of walk("features")) {
    if (path.startsWith("features/tool-ui/")) continue;
    const source = ts.createSourceFile(
      path,
      readFileSync(path, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    function visit(node: ts.Node) {
      if (ts.isJsxSelfClosingElement(node)) {
        const attribute = (name: string) => {
          const a = node.attributes.properties.find(
            (p): p is ts.JsxAttribute =>
              ts.isJsxAttribute(p) && p.name.getText(source) === name,
          );
          return a?.initializer && ts.isStringLiteral(a.initializer)
            ? a.initializer.text
            : "";
        };
        if (
          attribute("type") === "url" ||
          attribute("inputMode") === "url" ||
          /^https?:\/\//.test(attribute("placeholder"))
        ) {
          fields++;
          if (node.tagName.getText(source) === "input") misses.push(path);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  assert.deepEqual(misses, []);
  assert.ok(fields >= 25);
});
