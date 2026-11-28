import test from "node:test";
import assert from "node:assert/strict";
import { scrollPreviewContainer } from "../../features/website-builder/studio/preview-navigation";

test("switching standalone tool pages resets the reused canvas scroll", () => {
  const calls: ScrollToOptions[] = [];
  const container = { scrollTo: (options: ScrollToOptions) => calls.push(options), querySelector: () => { throw new Error("Standalone preview must not scroll to a homepage section"); } } as unknown as HTMLElement;
  scrollPreviewContainer(container, { section: "projects", itemId: "tool-two" });
  scrollPreviewContainer(container, { section: "blog posts", itemId: "post-one" });
  scrollPreviewContainer(container, { section: "site pages", itemId: "about" });
  assert.deepEqual(calls, Array(3).fill({ top: 0, behavior: "auto" }));
});

test("homepage section navigation retains its offset and motion preference", () => {
  let result: ScrollToOptions | undefined;
  const container = {
    scrollTop: 80,
    scrollTo: (options: ScrollToOptions) => { result = options; },
    getBoundingClientRect: () => ({ top: 100 }),
    querySelector: (selector: string) => {
      assert.equal(selector, "#projects");
      return { getBoundingClientRect: () => ({ top: 300 }) };
    },
  } as unknown as HTMLElement;
  scrollPreviewContainer(container, { section: "projects" }, "smooth");
  assert.deepEqual(result, { top: 236, behavior: "smooth" });
});
