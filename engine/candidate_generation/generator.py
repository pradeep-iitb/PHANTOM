"""PHANTOM Engine — Candidate relationship generation.

Generates candidate relationships between entities by comparing
normalized values across observations. Each candidate records
which signals caused it to be generated.

Candidate != Confirmed Attribution. These are hypotheses for review.
"""

from dataclasses import dataclass, field


@dataclass
class Signal:
    signal_type: str        # exact_match, alias_similarity, temporal, co_occurrence
    strength: str           # strong, supporting, weak
    description: str
    entity_a_value: str
    entity_b_value: str
    score: float = 0.0


@dataclass
class CandidateRelationship:
    entity_a_id: str
    entity_b_id: str
    entity_a_type: str
    entity_b_type: str
    entity_a_value: str
    entity_b_value: str
    relationship_type: str  # POSSIBLY_SAME_AS, USES, ASSOCIATED_WITH
    signals: list[Signal] = field(default_factory=list)
    confidence: float = 0.0


def _levenshtein_distance(s1: str, s2: str) -> int:
    """Simple Levenshtein distance."""
    if len(s1) < len(s2):
        return _levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    prev_row = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        curr_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = prev_row[j + 1] + 1
            deletions = curr_row[j] + 1
            substitutions = prev_row[j] + (c1 != c2)
            curr_row.append(min(insertions, deletions, substitutions))
        prev_row = curr_row
    return prev_row[-1]


def _alias_similarity(a: str, b: str) -> float:
    """Calculate similarity between two aliases (0.0 to 1.0)."""
    if a == b:
        return 1.0
    max_len = max(len(a), len(b))
    if max_len == 0:
        return 0.0
    distance = _levenshtein_distance(a, b)
    return 1.0 - (distance / max_len)


@dataclass
class EntityRecord:
    """Simplified entity record for candidate generation."""
    id: str
    entity_type: str
    original_value: str
    normalized_value: str
    observation_id: str = ""
    observed_at: str = ""


def generate_candidates(entities: list[EntityRecord]) -> list[CandidateRelationship]:
    """Generate candidate relationships from a list of entities.

    Strategies:
    1. Exact identifier match (wallet, PGP, email) → strong signal
    2. Alias similarity (Levenshtein) → supporting signal
    3. Cross-type association (alias ↔ wallet from same observation) → observed relationship
    """
    candidates: list[CandidateRelationship] = []
    seen_pairs: set[tuple[str, str]] = set()

    # Group entities by type and normalized value
    by_type: dict[str, list[EntityRecord]] = {}
    by_observation: dict[str, list[EntityRecord]] = {}

    for entity in entities:
        by_type.setdefault(entity.entity_type, []).append(entity)
        if entity.observation_id:
            by_observation.setdefault(entity.observation_id, []).append(entity)

    # ─── Strategy 1: Exact identifier match ──────────────
    # Same normalized value across different observations → strong link
    for etype in ["wallet", "pgp", "email"]:
        type_entities = by_type.get(etype, [])
        by_value: dict[str, list[EntityRecord]] = {}
        for e in type_entities:
            by_value.setdefault(e.normalized_value, []).append(e)

        for value, group in by_value.items():
            if len(group) < 2:
                continue
            for i in range(len(group)):
                for j in range(i + 1, len(group)):
                    a, b = group[i], group[j]
                    pair_key = tuple(sorted([a.id, b.id]))
                    if pair_key in seen_pairs:
                        continue
                    seen_pairs.add(pair_key)

                    signal = Signal(
                        signal_type="exact_match",
                        strength="strong",
                        description=f"Exact {etype} reuse: {value}",
                        entity_a_value=a.original_value,
                        entity_b_value=b.original_value,
                        score=1.0,
                    )
                    candidates.append(CandidateRelationship(
                        entity_a_id=a.id,
                        entity_b_id=b.id,
                        entity_a_type=a.entity_type,
                        entity_b_type=b.entity_type,
                        entity_a_value=a.original_value,
                        entity_b_value=b.original_value,
                        relationship_type="ASSOCIATED_WITH",
                        signals=[signal],
                        confidence=0.9,
                    ))

    # ─── Strategy 2: Alias similarity ────────────────────
    aliases = by_type.get("alias", [])
    for i in range(len(aliases)):
        for j in range(i + 1, len(aliases)):
            a, b = aliases[i], aliases[j]
            pair_key = tuple(sorted([a.id, b.id]))
            if pair_key in seen_pairs:
                continue

            sim = _alias_similarity(a.normalized_value, b.normalized_value)
            if sim >= 0.6 and sim < 1.0:  # Similar but not exact
                seen_pairs.add(pair_key)
                signal = Signal(
                    signal_type="alias_similarity",
                    strength="supporting",
                    description=f"Alias similarity ({sim:.0%}): '{a.original_value}' ↔ '{b.original_value}'",
                    entity_a_value=a.original_value,
                    entity_b_value=b.original_value,
                    score=sim,
                )
                candidates.append(CandidateRelationship(
                    entity_a_id=a.id,
                    entity_b_id=b.id,
                    entity_a_type="alias",
                    entity_b_type="alias",
                    entity_a_value=a.original_value,
                    entity_b_value=b.original_value,
                    relationship_type="POSSIBLY_SAME_AS",
                    signals=[signal],
                    confidence=sim * 0.5,
                ))
            elif sim == 1.0 and a.observation_id != b.observation_id:
                seen_pairs.add(pair_key)
                signal = Signal(
                    signal_type="exact_match",
                    strength="strong",
                    description=f"Exact alias match across observations: '{a.original_value}'",
                    entity_a_value=a.original_value,
                    entity_b_value=b.original_value,
                    score=1.0,
                )
                candidates.append(CandidateRelationship(
                    entity_a_id=a.id,
                    entity_b_id=b.id,
                    entity_a_type="alias",
                    entity_b_type="alias",
                    entity_a_value=a.original_value,
                    entity_b_value=b.original_value,
                    relationship_type="POSSIBLY_SAME_AS",
                    signals=[signal],
                    confidence=0.7,
                ))

    # ─── Strategy 3: Co-occurrence (same observation) ────
    for obs_id, obs_entities in by_observation.items():
        aliases_in_obs = [e for e in obs_entities if e.entity_type == "alias"]
        identifiers_in_obs = [e for e in obs_entities if e.entity_type in ("wallet", "pgp", "email", "domain", "onion")]

        for alias in aliases_in_obs:
            for identifier in identifiers_in_obs:
                pair_key = tuple(sorted([alias.id, identifier.id]))
                if pair_key in seen_pairs:
                    continue
                seen_pairs.add(pair_key)

                signal = Signal(
                    signal_type="co_occurrence",
                    strength="supporting",
                    description=f"Co-occurrence in same observation: '{alias.original_value}' uses {identifier.entity_type} '{identifier.original_value}'",
                    entity_a_value=alias.original_value,
                    entity_b_value=identifier.original_value,
                    score=0.6,
                )
                candidates.append(CandidateRelationship(
                    entity_a_id=alias.id,
                    entity_b_id=identifier.id,
                    entity_a_type="alias",
                    entity_b_type=identifier.entity_type,
                    entity_a_value=alias.original_value,
                    entity_b_value=identifier.original_value,
                    relationship_type="USES",
                    signals=[signal],
                    confidence=0.6,
                ))

    return candidates
