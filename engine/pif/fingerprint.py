"""PHANTOM Engine — Persistent Identity Fingerprint (PIF).

PIF represents a composite pattern of recurring actor characteristics.
It is NOT a real-world identity — it's an evidence-backed candidate
identity pattern that evolves over time.

PIF components:
  - Alias features (recurring handles, patterns)
  - Cryptographic features (PGP reuse)
  - Wallet features (wallet reuse)
  - Infrastructure features (domain/IP reuse)
  - Behavioural features
  - Temporal features (first/last seen, migration)

Every PIF component retains evidence references.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class PIFComponent:
    """A single component of a Persistent Identity Fingerprint."""
    feature_type: str
    values: list[str] = field(default_factory=list)
    evidence_refs: list[str] = field(default_factory=list)
    first_seen: Optional[str] = None
    last_seen: Optional[str] = None
    confidence: float = 0.0


@dataclass
class PersistentIdentityFingerprint:
    """Composite identity fingerprint for a candidate actor."""
    id: str = ""
    alias_features: PIFComponent = field(default_factory=lambda: PIFComponent(feature_type="alias"))
    cryptographic_features: PIFComponent = field(default_factory=lambda: PIFComponent(feature_type="pgp"))
    wallet_features: PIFComponent = field(default_factory=lambda: PIFComponent(feature_type="wallet"))
    infrastructure_features: PIFComponent = field(default_factory=lambda: PIFComponent(feature_type="infrastructure"))
    behavioural_features: PIFComponent = field(default_factory=lambda: PIFComponent(feature_type="behaviour"))
    temporal_features: PIFComponent = field(default_factory=lambda: PIFComponent(feature_type="temporal"))
    platform_features: PIFComponent = field(default_factory=lambda: PIFComponent(feature_type="platform"))
    version: int = 1
    created_at: str = ""
    updated_at: str = ""


def build_pif(entities: list[dict], observations: list[dict] = None) -> PersistentIdentityFingerprint:
    """Build a PIF from a group of related entities.

    Each entity dict should have: id, entity_type, original_value, normalized_value,
    observation_id, first_seen, last_seen.
    """
    pif = PersistentIdentityFingerprint()

    for entity in entities:
        etype = entity.get("entity_type", "")
        value = entity.get("original_value", "")
        eid = entity.get("id", "")
        first = entity.get("first_seen")
        last = entity.get("last_seen")

        if etype == "alias":
            pif.alias_features.values.append(value)
            pif.alias_features.evidence_refs.append(eid)
            _update_temporal(pif.alias_features, first, last)

        elif etype == "pgp":
            pif.cryptographic_features.values.append(value)
            pif.cryptographic_features.evidence_refs.append(eid)
            _update_temporal(pif.cryptographic_features, first, last)

        elif etype == "wallet":
            pif.wallet_features.values.append(value)
            pif.wallet_features.evidence_refs.append(eid)
            _update_temporal(pif.wallet_features, first, last)

        elif etype in ("domain", "ip", "onion"):
            pif.infrastructure_features.values.append(value)
            pif.infrastructure_features.evidence_refs.append(eid)
            _update_temporal(pif.infrastructure_features, first, last)

    # Temporal features
    all_first = [e.get("first_seen") for e in entities if e.get("first_seen")]
    all_last = [e.get("last_seen") for e in entities if e.get("last_seen")]
    if all_first:
        pif.temporal_features.first_seen = min(all_first)
    if all_last:
        pif.temporal_features.last_seen = max(all_last)

    return pif


def _update_temporal(component: PIFComponent, first_seen, last_seen):
    """Update temporal bounds of a PIF component."""
    if first_seen:
        fs = str(first_seen)
        if not component.first_seen or fs < component.first_seen:
            component.first_seen = fs
    if last_seen:
        ls = str(last_seen)
        if not component.last_seen or ls > component.last_seen:
            component.last_seen = ls
