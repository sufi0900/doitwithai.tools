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
