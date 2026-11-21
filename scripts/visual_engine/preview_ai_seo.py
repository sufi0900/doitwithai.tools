"""Run with the repository's sanitySnapshot.json as the argument."""
import json, sys
from pathlib import Path
from comparison_svg import render_comparison
doc=json.loads(Path(sys.argv[1]).read_text())["seo:what-is-ai-seo"]
blocks=[dict(id=b["_key"], text="".join(c.get("text","") for c in b.get("children",[]))) for b in doc["content"] if "_key" in b]
from select_evidence import select_pair
pair = select_pair(blocks)
if pair is None:
    raise ValueError("Review missing or ambiguous supporting passages")
nodes=[
 dict(title="Use AI in your SEO workflow",detail="Draft a content brief or compare competitors with AI tools.",sourceBlockIds=[pair[0]]),
 dict(title="Write for answer engines",detail="Optimize content for answer engines and generative systems.",sourceBlockIds=[pair[1]])]
for dest in ("blog","mobile","pin"):
 svg=render_comparison("Two ways AI changes search work",nodes,blocks,dest)
 Path(dest+".svg").write_text(svg)
 import xml.etree.ElementTree as ET
 root=ET.fromstring(svg)
 assert len(root.findall(".//*[@data-source-block-ids]"))==2
 print(dest,root.get("viewBox"))
