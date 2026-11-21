const assert = require("node:assert/strict");
const {
  ANTV_TEMPLATE_CATALOG,
  planList,
  planInfographic,
  frameSvg,
} = require("./pilot.cjs");

const brief = {
  headline: "Review a draft",
  relationship: "sequence",
  blocks: [{ id: "a" }, { id: "b" }],
  nodes: [
    {
      title: "Identify the claim",
      detail: "Mark the passage to check.",
      sourceBlockIds: ["a"],
    },
    {
      title: "Verify the source",
      detail: "Read the original evidence.",
      sourceBlockIds: ["b"],
    },
  ],
};

const plan = planList(brief);
assert.deepEqual(plan.evidence, [["a"], ["b"]]);
assert.deepEqual(
  plan.options.data.lists.map((i) => i.label),
  brief.nodes.map((n) => n.title),
);
assert.throws(() => planList({ ...brief, blocks: [] }));
assert.throws(() => planList({ ...brief, relationship: "comparison" }));
assert.throws(() =>
  planList({ ...brief, nodes: Array(5).fill(brief.nodes[0]) }),
);

// Verify multi-archetype planner across relationships
for (const rel of Object.keys(ANTV_TEMPLATE_CATALOG)) {
  const multi = planInfographic({
    ...brief,
    relationship: rel,
    variantIndex: 1,
    width: 1080,
    height: 1350,
  });
  assert.equal(multi.relationship, rel);
  assert.equal(multi.options.width, 1080);
  assert.equal(multi.options.height, 1350);
  assert.ok(ANTV_TEMPLATE_CATALOG[rel].includes(multi.options.template));
  assert.deepEqual(multi.evidence, [["a"], ["b"]]);
}

const framed = frameSvg('<svg viewBox="0 0 800 600"><rect/></svg>', 1080, 1350);
assert.ok(framed.includes('width="1080" height="1350"'));
