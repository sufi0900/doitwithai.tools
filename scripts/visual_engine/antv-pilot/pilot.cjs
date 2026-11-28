const { readFileSync } = require("node:fs");

/**
 * Curated catalog of 18+ AntV Infographic SSR templates across all 6 core visual
 * relationships (`sequence`, `comparison`, `list`, `chart`, `hierarchy`, `quadrant`).
 * Isolated inside `scripts/visual_engine/antv-pilot/` so `@antv/infographic`
 * never bloats or breaks the Next.js server bundle.
 */
const ANTV_TEMPLATE_CATALOG = {
  sequence: [
    "list-row-simple-horizontal-arrow",
    "sequence-timeline-simple",
    "sequence-snake-steps-simple",
    "sequence-horizontal-zigzag-underline-text",
    "sequence-ascending-steps",
    "sequence-funnel-simple",
  ],
  comparison: [
    "compare-binary-horizontal-simple-fold",
    "compare-binary-horizontal-badge-card-vs",
    "compare-swot",
    "compare-quadrant-quarter-simple-card",
  ],
  list: [
    "list-grid-badge-card",
    "list-row-horizontal-icon-arrow",
    "list-column-vertical-icon-arrow",
    "list-CheckList-item",
  ],
  chart: [
    "chart-bar-plain-text",
    "chart-column-simple",
    "chart-pie-donut-plain-text",
  ],
  hierarchy: [
    "hierarchy-tree-tech-style-capsule-item",
    "hierarchy-structure",
  ],
  quadrant: [
    "compare-quadrant-quarter-simple-card",
    "compare-quadrant-quarter-circular",
  ],
};

/**
 * Original strict sequence planner preserved for backward compatibility with `test.cjs`.
 */
function planList({ headline, relationship, nodes, blocks }) {
  if (
    relationship !== "sequence" ||
    !Array.isArray(nodes) ||
    nodes.length < 2 ||
    nodes.length > 4
  )
    throw new Error("This pilot accepts sequences of two to four steps.");
  if (typeof headline !== "string" || !headline.trim())
    throw new Error("A headline is required.");
  const sources = new Set((blocks || []).map((block) => block.id));
  const lists = nodes.map(({ title, detail, sourceBlockIds }) => {
    if (
      ![title, detail].every(
        (value) => typeof value === "string" && value.trim(),
      ) ||
      !Array.isArray(sourceBlockIds) ||
      !sourceBlockIds.length ||
      !sourceBlockIds.every(
        (id) => typeof id === "string" && id.length && sources.has(id),
      )
    )
      throw new Error("Each step needs text and valid source references.");
    return { label: title, desc: detail };
  });
  return {
    options: {
      template: "list-row-simple-horizontal-arrow",
      width: 1080,
      height: 720,
      data: { title: headline, lists },
    },
    evidence: nodes.map((node) => [...node.sourceBlockIds]),
  };
}

/**
 * Multi-Archetype AntV Planner supporting all 6 relationships (`sequence`,
 * `comparison`, `list`, `chart`, `hierarchy`, `quadrant`), 2..8 source-grounded nodes,
 * and automatic template rotation across the 18 curated AntV templates.
 */
function planInfographic({
  headline,
  subheadline,
  relationship = "sequence",
  template,
  variantIndex = 0,
  width = 1080,
  height = 720,
  nodes,
  blocks,
}) {
  if (typeof headline !== "string" || !headline.trim()) {
    throw new Error("A headline is required.");
  }
  if (!Array.isArray(nodes) || nodes.length < 2 || nodes.length > 8) {
    throw new Error("Provide between 2 and 8 nodes.");
  }
  const pool =
    ANTV_TEMPLATE_CATALOG[relationship] || ANTV_TEMPLATE_CATALOG.sequence;
  const chosenTemplate =
    typeof template === "string" && template.trim()
      ? template.trim()
      : pool[Math.abs(Number(variantIndex) || 0) % pool.length];

  const sources = new Set((blocks || []).map((block) => block.id));
  const items = nodes.map(({ title, detail, value, sourceBlockIds }) => {
    if (
      ![title, detail].every(
        (v) => typeof v === "string" && v.trim(),
      ) ||
      !Array.isArray(sourceBlockIds) ||
      !sourceBlockIds.length ||
      !sourceBlockIds.every(
        (id) => typeof id === "string" && id.length && sources.has(id),
      )
    ) {
      throw new Error("Each node needs text and valid source references.");
    }
    const entry = { label: title.trim(), desc: detail.trim() };
    if (typeof value === "number" && Number.isFinite(value)) {
      entry.value = value;
    }
    return entry;
  });

  const data = {
    title: headline.trim(),
    ...(typeof subheadline === "string" && subheadline.trim()
      ? { desc: subheadline.trim() }
      : {}),
    lists: items,
    items,
  };

  return {
    relationship,
    options: {
      template: chosenTemplate,
      width: Number(width) || 1080,
      height: Number(height) || 720,
      data,
    },
    evidence: nodes.map((node) => [...node.sourceBlockIds]),
  };
}

// SSR returns an intrinsic viewBox. Keep it for scaling, and give the
// exported asset the dimensions requested by the destination.
function frameSvg(svg, width, height) {
  const root = svg.replace(/<\?xml-stylesheet[^?]*\?>\s*/g, "");
  return root.replace(/<svg\b[^>]*>/, (tag) =>
    tag
      .replace(/\s(?:width|height)="[^"]*"/g, "")
      .replace(
        />$/,
        ` width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet">`,
      ),
  );
}

async function main() {
  const payload = JSON.parse(readFileSync(0, "utf8"));
  const plan = payload.multiArchetype
    ? planInfographic(payload)
    : planList(payload);
  if (process.argv.includes("--plan"))
    return process.stdout.write(JSON.stringify(plan));
  const { renderToString } = require("@antv/infographic/ssr");
  const svg = await renderToString(plan.options);
  process.stdout.write(
    frameSvg(svg, plan.options.width, plan.options.height),
  );
}
if (require.main === module)
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
module.exports = {
  ANTV_TEMPLATE_CATALOG,
  planList,
  planInfographic,
  frameSvg,
};
