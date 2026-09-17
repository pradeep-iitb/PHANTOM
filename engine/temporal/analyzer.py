"""PHANTOM Engine — Temporal analysis.

Analyzes temporal patterns across entities and observations
to identify continuity, gaps, reappearance, and impossible timelines.

Temporal analysis is a supporting signal — not proof of attribution.
"""

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Optional


@dataclass
class TemporalSignal:
    signal_type: str  # continuity, gap, reappearance, overlap, impossible
    description: str
    strength: str     # strong, supporting, weak, contradiction
    entity_a: str
    entity_b: str
    time_a: Optional[str] = None
    time_b: Optional[str] = None
    gap_days: Optional[int] = None


def analyze_temporal_patterns(
    entities: list[dict],
) -> list[TemporalSignal]:
    """Analyze temporal patterns among entities.

    Each entity dict should have:
      - id, entity_type, original_value
      - first_seen (ISO string or None)
      - last_seen (ISO string or None)
      - observation_id

    Returns temporal signals (continuity, gaps, overlap, etc.)
    """
    signals: list[TemporalSignal] = []

    # Get entities with temporal data
    timed = [e for e in entities if e.get("first_seen") or e.get("last_seen")]
    if len(timed) < 2:
        return signals

    # Sort by first_seen
    def sort_key(e):
        fs = e.get("first_seen", "")
        return fs if fs else "9999"

    timed.sort(key=sort_key)

    # Check for temporal patterns between aliases
    aliases = [e for e in timed if e.get("entity_type") == "alias"]

    for i in range(len(aliases)):
        for j in range(i + 1, len(aliases)):
            a = aliases[i]
            b = aliases[j]

            a_first = _parse_dt(a.get("first_seen"))
            a_last = _parse_dt(a.get("last_seen"))
            b_first = _parse_dt(b.get("first_seen"))
            b_last = _parse_dt(b.get("last_seen"))

            if not a_first or not b_first:
                continue

            # Temporal continuity: A disappears, then B appears
            if a_last and b_first and a_last < b_first:
                gap = (b_first - a_last).days
                if gap < 180:  # within 6 months
                    signals.append(TemporalSignal(
                        signal_type="continuity",
                        description=f"'{a.get('original_value')}' last seen → '{b.get('original_value')}' first seen ({gap} day gap)",
                        strength="supporting",
                        entity_a=a.get("id", ""),
                        entity_b=b.get("id", ""),
                        time_a=str(a_last),
                        time_b=str(b_first),
                        gap_days=gap,
                    ))

            # Overlap: both active at the same time
            if a_last and b_first and a_first and b_last:
                if a_first <= b_last and b_first <= a_last:
                    signals.append(TemporalSignal(
                        signal_type="overlap",
                        description=f"'{a.get('original_value')}' and '{b.get('original_value')}' have overlapping activity periods",
                        strength="supporting",
                        entity_a=a.get("id", ""),
                        entity_b=b.get("id", ""),
                        time_a=str(a_first),
                        time_b=str(b_last),
                    ))

    return signals


def _parse_dt(value) -> Optional[datetime]:
    """Parse a datetime value, handling various formats."""
    if not value:
        return None
    if isinstance(value, datetime):
        return value
    try:
        # Try ISO format
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except (ValueError, TypeError):
        return None
