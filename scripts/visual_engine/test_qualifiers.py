from percentage_review import review_card_percentages

def flagged(claim, source):
    return bool(review_card_percentages(
        [dict(title="Rate", detail=claim, sourceBlockIds=["a"])],
        [dict(id="a", text=source)]))

assert flagged("40%", "up to 40%")
assert flagged("40%", "approximately 40%")
assert flagged("at least 40%", "at most 40%")
assert not flagged("at most 40%", "up to 40 percent")
assert not flagged("roughly 40%", "≈40%")
assert not flagged("40%", "up to 40% overall; exact sample recorded 40%")
assert flagged("30–40%", "about 30–40%")
