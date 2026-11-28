"""Select from a caller-supplied catalog of reviewed assets. No network access."""
from dataclasses import dataclass


@dataclass(frozen=True)
class StockAsset:
    asset_id: str
    origin: str
    rights_record: str
    approved_destinations: frozenset[str]
    owner_scope: str
    topics: frozenset[str]
    credit: str = ""


def select_stock(catalog, *, tenant, destination, topics, can_display_credit):
    """Use 'shared' only for assets explicitly approved for reuse across clients."""
    eligible = []
    for asset in catalog:
        if not asset.origin.strip() or not asset.rights_record.strip():
            continue
        if asset.owner_scope not in {tenant, "shared"}:
            continue
        if destination not in asset.approved_destinations:
            continue
        if asset.credit and not can_display_credit:
            continue
        overlap = len(asset.topics.intersection(topics))
        if overlap:
            eligible.append((-overlap, asset.owner_scope != tenant, asset.asset_id, asset))
    if eligible:
        return min(eligible, key=lambda row: row[:3])[3]
    return None


ALL_APPROVED_DESTINATIONS = frozenset({"blog", "pinterest", "linkedin", "instagram", "x", "newsletter"})

DEFAULT_SHARED_VECTOR_CATALOG = (
    StockAsset(
        asset_id="vector:ai-search-intelligence",
        origin="lib/visual-stock/vector-scenes.ts#ai-search-intelligence",
        rights_record="MIT-unDraw-Style (Commercial-Safe, No Attribution Required)",
        approved_destinations=ALL_APPROVED_DESTINATIONS,
        owner_scope="shared",
        topics=frozenset({"ai", "seo", "search", "aeo", "geo", "answer", "citation", "ranking", "discovery"}),
    ),
    StockAsset(
        asset_id="vector:editorial-workflow-pipeline",
        origin="lib/visual-stock/vector-scenes.ts#editorial-workflow-pipeline",
        rights_record="MIT-unDraw-Style (Commercial-Safe, No Attribution Required)",
        approved_destinations=ALL_APPROVED_DESTINATIONS,
        owner_scope="shared",
        topics=frozenset({"workflow", "process", "steps", "pipeline", "brief", "content", "draft", "automation"}),
    ),
    StockAsset(
        asset_id="vector:side-by-side-comparison-scale",
        origin="lib/visual-stock/vector-scenes.ts#side-by-side-comparison-scale",
        rights_record="MIT-unDraw-Style (Commercial-Safe, No Attribution Required)",
        approved_destinations=ALL_APPROVED_DESTINATIONS,
        owner_scope="shared",
        topics=frozenset({"comparison", "vs", "versus", "difference", "compare", "tradeoff", "option"}),
    ),
    StockAsset(
        asset_id="vector:analytics-benchmark-telemetry",
        origin="lib/visual-stock/vector-scenes.ts#analytics-benchmark-telemetry",
        rights_record="MIT-unDraw-Style (Commercial-Safe, No Attribution Required)",
        approved_destinations=ALL_APPROVED_DESTINATIONS,
        owner_scope="shared",
        topics=frozenset({"analytics", "data", "metrics", "kpi", "benchmark", "chart", "roi", "growth"}),
    ),
    StockAsset(
        asset_id="vector:verification-trust-shield",
        origin="lib/visual-stock/vector-scenes.ts#verification-trust-shield",
        rights_record="MIT-unDraw-Style (Commercial-Safe, No Attribution Required)",
        approved_destinations=ALL_APPROVED_DESTINATIONS,
        owner_scope="shared",
        topics=frozenset({"audit", "verify", "verification", "trust", "eeat", "quality", "checklist", "review"}),
    ),
    StockAsset(
        asset_id="vector:lifestyle-home-companion",
        origin="lib/visual-stock/vector-scenes.ts#lifestyle-home-companion",
        rights_record="CC0-OpenPeeps-Style (Commercial-Safe, No Attribution Required)",
        approved_destinations=ALL_APPROVED_DESTINATIONS,
        owner_scope="shared",
        topics=frozenset({"lifestyle", "pet", "cat", "dog", "home", "wellness", "care", "health", "daily"}),
    ),
)

