"""Project a reviewed section brief into cards accepted by the Python exporter."""

from percentage_review import review_card_percentages


def deck_from_section(headline, nodes, source_blocks, cards_per_slide=3):
    if not isinstance(headline, str) or not headline.strip() or not nodes:
        raise ValueError("A headline and at least one point are required")
    if type(cards_per_slide) is not int or not 1 <= cards_per_slide <= 6:
        raise ValueError("Choose one to six cards per slide")
    source_ids = {block["id"] for block in source_blocks}
    cards = []
    for node in nodes:
        refs = node.get("sourceBlockIds")
        if not isinstance(refs, list) or not refs or any(ref not in source_ids for ref in refs):
            raise ValueError("Each point must reference evidence in this section")
        if any(not isinstance(node.get(k), str) or not node[k].strip() for k in ("title", "detail")):
            raise ValueError("Each point needs a label and explanation")
        cards.append({"title": node["title"], "detail": node["detail"], "sourceBlockIds": refs.copy()})
    issues = review_card_percentages(nodes, source_blocks)
    if issues:
        first = issues[0]
        raise ValueError(f"Review {first['percentage']}% in card {first['cardIndex'] + 1}: absent from cited passages")
    return {"slides": [
        {"headline_parts": [{"text": headline}], "cards": cards[start:start + cards_per_slide]}
        for start in range(0, len(cards), cards_per_slide)
    ]}
