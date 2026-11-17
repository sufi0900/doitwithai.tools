"""Flag percentage literals absent from the cited passages (English briefs)."""
from decimal import Decimal
import re

NUMBER = r"[+−-]?\d+(?:,\d{3})*(?:\.\d+)?"
UNIT = r"(?:%|percent(?:age)?\b)(?!\s+points?\b)"
RANGE = re.compile(
    rf"(?<![\w.,])({NUMBER})\s*(?:{UNIT})?\s*(?:[–—-]|\bto\b)\s*({NUMBER})\s*{UNIT}",
    re.IGNORECASE,
)
PERCENT = re.compile(rf"(?<![\w.,])({NUMBER})\s*{UNIT}", re.IGNORECASE)


def percentage_values(text):
    # A span is one assertion. Its upper bound alone is a different claim.
    def number(raw):
        return Decimal(raw.replace(",", "").replace("−", "-"))
    spans = list(RANGE.finditer(text))
    values = {(number(m[1]), number(m[2])) for m in spans}
    singles = RANGE.sub(" ", text)
    values.update((number(m[1]),) for m in PERCENT.finditer(singles))
    return values


def review_card_percentages(nodes, source_blocks):
    sources = {b["id"]: b.get("text", "") for b in source_blocks}
    issues = []
    for index, node in enumerate(nodes):
        claimed = percentage_values(node["title"] + " " + node["detail"])
        if not claimed:
            continue
        refs = node.get("sourceBlockIds") or []
        evidence = set()
        for ref in refs:
            evidence.update(percentage_values(sources.get(ref) or ""))
        for value in sorted(claimed - evidence):
            issues.append({"cardIndex": index, "percentage": "–".join(format(n, "f") for n in value),
                           "sourceBlockIds": list(refs)})
    return issues
