"""Select passages for the two reviewed AI SEO claims in this article fixture."""
import re

def select_pair(blocks):
    patterns = [
        [r"\bAI\b", r"content brief", r"competitor"],
        [r"optimi[sz]\w* your content", r"answer engines?", r"generative systems?"],
    ]
    chosen = []
    for terms in patterns:
        candidates = [b for b in blocks if b.get("id") and
                      all(re.search(t, b["text"], re.I) for t in terms)]
        if len(candidates) != 1:
            return None
        chosen.append(candidates[0]["id"])
    return chosen if len(set(chosen)) == 2 else None
