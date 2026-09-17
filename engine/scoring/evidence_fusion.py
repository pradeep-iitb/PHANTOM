"""PHANTOM Engine — Evidence fusion scoring.

Combines multiple signals into a transparent confidence score.
The scoring is decomposable — an investigator can see exactly
which signals contributed and by how much.

This is an initial baseline methodology, not a scientifically
calibrated formula. It should be easy to improve later.
"""

from dataclasses import dataclass


@dataclass
class ScoredSignal:
    signal_type: str
    strength: str
    description: str
    raw_score: float
    weight: float
    weighted_score: float


@dataclass
class FusionResult:
    """Result of evidence fusion scoring."""
    confidence: float           # 0.0 to 1.0
    confidence_level: str       # high, medium, low, insufficient
    strong_evidence: list[ScoredSignal]
    supporting_signals: list[ScoredSignal]
    total_strong: float
    total_supporting: float
    contradiction_penalty: float


# Signal weights — these are initial baselines, not calibrated values
SIGNAL_WEIGHTS = {
    "exact_match": 0.35,
    "alias_similarity": 0.15,
    "temporal_continuity": 0.15,
    "co_occurrence": 0.10,
    "behavioral_similarity": 0.10,
    "stylometric_similarity": 0.08,
    "semantic_similarity": 0.07,
}

# Source reliability multipliers
SOURCE_RELIABILITY_DEFAULT = 0.5


def calculate_confidence_level(confidence: float) -> str:
    """Map numerical confidence to a human-readable level."""
    if confidence >= 0.75:
        return "high"
    elif confidence >= 0.50:
        return "medium"
    elif confidence >= 0.25:
        return "low"
    else:
        return "insufficient"


def fuse_evidence(
    signals: list[dict],
    source_reliability: float = SOURCE_RELIABILITY_DEFAULT,
    contradiction_count: int = 0,
) -> FusionResult:
    """Fuse multiple signals into a confidence score.

    Each signal dict should have:
      - signal_type: str
      - strength: str (strong/supporting/weak)
      - description: str
      - score: float (0.0 to 1.0)

    Formula:
      confidence = Σ(signal_score × weight × source_reliability) - contradiction_penalty
      Clamped to [0.0, 1.0]
    """
    strong_evidence: list[ScoredSignal] = []
    supporting_signals: list[ScoredSignal] = []

    total_strong = 0.0
    total_supporting = 0.0

    for signal in signals:
        signal_type = signal.get("signal_type", "unknown")
        strength = signal.get("strength", "supporting")
        description = signal.get("description", "")
        raw_score = signal.get("score", 0.0)

        weight = SIGNAL_WEIGHTS.get(signal_type, 0.10)
        weighted = raw_score * weight * source_reliability

        scored = ScoredSignal(
            signal_type=signal_type,
            strength=strength,
            description=description,
            raw_score=raw_score,
            weight=weight,
            weighted_score=weighted,
        )

        if strength == "strong":
            strong_evidence.append(scored)
            total_strong += weighted
        else:
            supporting_signals.append(scored)
            total_supporting += weighted

    # Contradiction penalty
    # Each contradiction reduces confidence by 15%
    contradiction_penalty = contradiction_count * 0.15

    # Final confidence
    raw_confidence = total_strong + total_supporting - contradiction_penalty
    confidence = max(0.0, min(1.0, raw_confidence))
    confidence_level = calculate_confidence_level(confidence)

    return FusionResult(
        confidence=round(confidence, 3),
        confidence_level=confidence_level,
        strong_evidence=strong_evidence,
        supporting_signals=supporting_signals,
        total_strong=round(total_strong, 3),
        total_supporting=round(total_supporting, 3),
        contradiction_penalty=round(contradiction_penalty, 3),
    )
