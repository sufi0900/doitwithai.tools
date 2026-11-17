const { readFileSync } = require("node:fs");

function planList({ headline, relationship, nodes, blocks }) {
  if (relationship !== "sequence" || !Array.isArray(nodes) || nodes.length < 2 || nodes.length > 4)
    throw new Error("This pilot accepts sequences of two to four steps.");
  if (typeof headline !== "string" || !headline.trim()) throw new Error("A headline is required.");
  const sources = new Set(blocks.map(block => block.id));
  const lists = nodes.map(({ title, detail, sourceBlockIds }) => {
    if (![title, detail].every(value => typeof value === "string" && value.trim()) ||
        !Array.isArray(sourceBlockIds) || !sourceBlockIds.length ||
        !sourceBlockIds.every(id => typeof id === "string" && id.length && sources.has(id)))
      throw new Error("Each step needs text and valid source references.");
    return { label: title, desc: detail };
  });
  return {
    options: { template: "list-row-simple-horizontal-arrow", width: 1080, height: 720,
      data: { title: headline, lists } },
    evidence: nodes.map(node => [...node.sourceBlockIds]),
  };
}

// SSR returns an intrinsic viewBox. Keep it for scaling, and give the
// exported asset the dimensions requested by the destination.
function frameSvg(svg, width, height) {
  const root = svg.replace(/<\?xml-stylesheet[^?]*\?>\s*/g, "");
  return root.replace(/<svg\b[^>]*>/, tag =>
    tag.replace(/\s(?:width|height)="[^"]*"/g, "")
       .replace(/>$/, ` width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet">`));
}

async function main() {
  const plan = planList(JSON.parse(readFileSync(0, "utf8")));
  if (process.argv.includes("--plan")) return process.stdout.write(JSON.stringify(plan));
  const { renderToString } = require("@antv/infographic/ssr");
  const svg = await renderToString(plan.options);
  process.stdout.write(frameSvg(svg, plan.options.width, plan.options.height));
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { planList, frameSvg };
