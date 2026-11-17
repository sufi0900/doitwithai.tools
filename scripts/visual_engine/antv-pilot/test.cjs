const assert = require("node:assert/strict");
const {planList} = require("./pilot.cjs");
const brief = {headline:"Review a draft",relationship:"sequence",blocks:[{id:"a"},{id:"b"}],nodes:[
  {title:"Identify the claim",detail:"Mark the passage to check.",sourceBlockIds:["a"]},
  {title:"Verify the source",detail:"Read the original evidence.",sourceBlockIds:["b"]}]};
const plan = planList(brief);
assert.deepEqual(plan.evidence,[["a"],["b"]]);
assert.deepEqual(plan.options.data.lists.map(i=>i.label), brief.nodes.map(n=>n.title));
assert.throws(()=>planList({...brief,blocks:[]}));
assert.throws(()=>planList({...brief,relationship:"comparison"}));
assert.throws(()=>planList({...brief,nodes:Array(5).fill(brief.nodes[0])}));
