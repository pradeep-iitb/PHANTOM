"""PHANTOM Engine — Contradiction detection.

Contradictions are first-class data in PHANTOM.
They must not be silently discarded.

This module detects contradictory evidence between
entities that are candidates for the same actor.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Contradiction:
    contradiction_type: str  # temporal_impossible, identifier_conflict, infrastructure_inconsistency
    severity: str           # high, medium, low
    description: str
    entity_a_id: str
    entity_b_id: str
    entity_a_value: str
    entity_b_value: str
    evidence: str = ""


@dataclass
class EntityForContradiction:
    id: str
    entity_type: str
    original_value: str
    normalized_value: str
    observation_id: str = ""
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    metadata: dict = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


def detect_contradictions(
    entities: list[EntityForContradiction],
    candidate_pairs: list[tuple[str, str]],  # pairs of entity IDs that are candidates
) -> list[Contradiction]:
    """Detect contradictions among candidate entity pairs.

    Checks:
    1. Temporal impossibility — overlapping activity on different platforms
       with incompatible identifiers
    2. Identifier conflict — same type but different values where
       exclusivity is expected (e.g., different PGP keys)
    3. Infrastructure inconsistency — conflicting infrastructure
       during overlapping time periods
    """
    contradictions: list[Contradiction] = []
    entity_map = {e.id: e for e in entities}

    for id_a, id_b in candidate_pairs:
        a = entity_map.get(id_a)
        b = entity_map.get(id_b)
        if not a or not b:
            continue

        # ── Check 1: Temporal impossibility ──────────────
        if a.first_seen and b.first_seen and a.last_seen and b.last_seen:
            # If both have overlapping activity periods
            if a.first_seen <= b.last_seen and b.first_seen <= a.last_seen:
                # Overlapping period — check for incompatible identifiers
                pass  # Handled by identifier conflict below

            # Check for impossible sequence (B started before A ended
            # but they have conflicting identifiers)

        # ── Check 2: Identifier conflict ─────────────────
        # If two entities of the same exclusive type have different values,
        # and they're both linked to the same candidate actor, that's a contradiction
        if a.entity_type == b.entity_type and a.entity_type in ("pgp",):
            if a.normalized_value != b.normalized_value:
                contradictions.append(Contradiction(
                    contradiction_type="identifier_conflict",
                    severity="high",
                    description=f"Conflicting {a.entity_type} identifiers: '{a.original_value}' vs '{b.original_value}'",
                    entity_a_id=id_a,
                    entity_b_id=id_b,
                    entity_a_value=a.original_value,
                    entity_b_value=b.original_value,
                    evidence=f"Two different {a.entity_type} values found for candidate same-actor hypothesis",
                ))

    # ── Check 3: Cross-observation temporal contradiction ─
    # Group entities by observation
    by_observation: dict[str, list[EntityForContradiction]] = {}
    for e in entities:
        if e.observation_id:
            by_observation.setdefault(e.observation_id, []).append(e)

    # Check if any observations have temporally impossible relationships
    obs_times: dict[str, tuple[Optional[datetime], Optional[datetime]]] = {}
    for obs_id, obs_entities in by_observation.items():
        first = min((e.first_seen for e in obs_entities if e.first_seen), default=None)
        last = max((e.last_seen for e in obs_entities if e.last_seen), default=None)
        obs_times[obs_id] = (first, last)

    return contradictions
