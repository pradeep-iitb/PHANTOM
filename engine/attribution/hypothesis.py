"""PHANTOM Engine — Attribution hypothesis generation.

Generates structured, explainable attribution hypotheses from
candidate relationships and evidence fusion results.

A hypothesis is NOT a verdict. It is a reviewable proposal.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional
import uuid


@dataclass
class HypothesisEvidence:
    type: str           # exact_match, alias_similarity, temporal, etc.
    strength: str       # strong, supporting, weak
    description: str
    score: float


@dataclass
class HypothesisContradiction:
    type: str
    severity: str
    description: str


@dataclass
class AttributionHypothesis:
    """A structured, explainable attribution hypothesis."""
    id: str = ""
    title: str = ""
    description: str = ""
    entities_involved: list[dict] = field(default_factory=list)
    confidence: float = 0.0
    confidence_level: str = "insufficient"
    strong_evidence: list[dict] = field(default_factory=list)
    supporting_signals: list[dict] = field(default_factory=list)
    contradictions: list[dict] = field(default_factory=list)
    status: str = "generated"
    created_at: str = ""

    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())
        if not self.created_at:
            self.created_at = datetime.now(timezone.utc).isoformat()


def generate_hypotheses(
    candidate_groups: list[dict],
) -> list[AttributionHypothesis]:
    """Generate attribution hypotheses from grouped candidates.

    Each candidate_group should have:
      - entities: list of entity dicts
      - signals: list of signal dicts
      - contradictions: list of contradiction dicts
      - fusion_result: dict with confidence and level

    Returns hypotheses ordered by confidence (highest first).
    """
    hypotheses: list[AttributionHypothesis] = []

    for group in candidate_groups:
        entities = group.get("entities", [])
        fusion = group.get("fusion_result", {})
        signals = group.get("signals", [])
        contradictions = group.get("contradictions", [])

        if len(entities) < 2:
            continue

        # Build descriptive title
        entity_names = [e.get("original_value", "unknown") for e in entities[:3]]
        title = f"Potential link: {' ↔ '.join(entity_names)}"
        if len(entities) > 3:
            title += f" (+{len(entities) - 3} more)"

        # Build description
        confidence = fusion.get("confidence", 0.0)
        level = fusion.get("confidence_level", "insufficient")

        description = (
            f"These {len(entities)} entities may belong to the same persistent actor. "
            f"Confidence: {confidence:.0%} ({level}). "
            f"Based on {len(signals)} signals with {len(contradictions)} contradiction(s)."
        )

        # Separate strong vs supporting evidence
        strong = [
            {"type": s.get("signal_type", ""), "strength": "strong",
             "description": s.get("description", ""), "score": s.get("score", 0)}
            for s in signals if s.get("strength") == "strong"
        ]
        supporting = [
            {"type": s.get("signal_type", ""), "strength": "supporting",
             "description": s.get("description", ""), "score": s.get("score", 0)}
            for s in signals if s.get("strength") != "strong"
        ]
        contradiction_items = [
            {"type": c.get("contradiction_type", ""), "severity": c.get("severity", ""),
             "description": c.get("description", "")}
            for c in contradictions
        ]

        hypothesis = AttributionHypothesis(
            title=title,
            description=description,
            entities_involved=[
                {"id": e.get("id", ""), "type": e.get("entity_type", ""),
                 "value": e.get("original_value", "")}
                for e in entities
            ],
            confidence=confidence,
            confidence_level=level,
            strong_evidence=strong,
            supporting_signals=supporting,
            contradictions=contradiction_items,
        )
        hypotheses.append(hypothesis)

    # Sort by confidence descending
    hypotheses.sort(key=lambda h: h.confidence, reverse=True)
    return hypotheses
