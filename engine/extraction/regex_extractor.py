"""PHANTOM Engine — Regex-based entity extraction.

Extracts structured entities from raw observation text using
deterministic patterns. Each extraction preserves the original
value for provenance.
"""

import re
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ExtractedEntity:
    entity_type: str
    original_value: str
    confidence: float = 1.0
    context: str = ""  # surrounding text snippet


# ── Patterns ─────────────────────────────────────────────
PATTERNS = {
    "bitcoin_wallet": re.compile(
        r'\b([13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,90})\b'
    ),
    "ethereum_wallet": re.compile(
        r'\b(0x[a-fA-F0-9]{40})\b'
    ),
    "monero_wallet": re.compile(
        r'\b(4[0-9AB][1-9A-HJ-NP-Za-km-z]{93})\b'
    ),
    "pgp_fingerprint": re.compile(
        r'\b([A-Fa-f0-9]{4}\s?){10}\b'
    ),
    "pgp_key_block": re.compile(
        r'-----BEGIN PGP PUBLIC KEY BLOCK-----.*?-----END PGP PUBLIC KEY BLOCK-----',
        re.DOTALL,
    ),
    "email": re.compile(
        r'\b([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})\b'
    ),
    "onion_v3": re.compile(
        r'\b([a-z2-7]{56}\.onion)\b'
    ),
    "onion_v2": re.compile(
        r'\b([a-z2-7]{16}\.onion)\b'
    ),
    "domain": re.compile(
        r'\b(?!.*\.onion\b)([a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+)\b'
    ),
    "ipv4": re.compile(
        r'\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b'
    ),
    "md5_hash": re.compile(
        r'\b([a-fA-F0-9]{32})\b'
    ),
    "sha1_hash": re.compile(
        r'\b([a-fA-F0-9]{40})\b'
    ),
    "sha256_hash": re.compile(
        r'\b([a-fA-F0-9]{64})\b'
    ),
    "url": re.compile(
        r'(https?://[^\s<>"\']+)'
    ),
}

# Map pattern names to entity types
PATTERN_TO_TYPE = {
    "bitcoin_wallet": "wallet",
    "ethereum_wallet": "wallet",
    "monero_wallet": "wallet",
    "pgp_fingerprint": "pgp",
    "pgp_key_block": "pgp",
    "email": "email",
    "onion_v3": "onion",
    "onion_v2": "onion",
    "domain": "domain",
    "ipv4": "ip",
    "md5_hash": "hash",
    "sha1_hash": "hash",
    "sha256_hash": "hash",
    "url": "url",
}


def _extract_context(text: str, match_start: int, match_end: int, window: int = 50) -> str:
    """Extract surrounding text for context."""
    start = max(0, match_start - window)
    end = min(len(text), match_end + window)
    return text[start:end].strip()


def extract_aliases(text: str) -> list[ExtractedEntity]:
    """Extract potential aliases/usernames from structured observation text.

    Looks for patterns like:
    - alias: ShadowX
    - username: DarkSeller91
    - user: hackerX
    - handle: @someone
    - posted by: username
    """
    aliases = []
    alias_patterns = [
        re.compile(r'(?:alias|username|user|handle|posted\s*by|seller|vendor|author)\s*[:=]\s*["\']?(\S+?)["\']?\s*$', re.MULTILINE | re.IGNORECASE),
        re.compile(r'@([a-zA-Z0-9_]{3,30})\b'),
    ]
    for pattern in alias_patterns:
        for match in pattern.finditer(text):
            value = match.group(1).strip().rstrip('.,;:')
            if len(value) >= 2:
                aliases.append(ExtractedEntity(
                    entity_type="alias",
                    original_value=value,
                    confidence=0.8,
                    context=_extract_context(text, match.start(), match.end()),
                ))
    return aliases


def extract_entities(text: str) -> list[ExtractedEntity]:
    """Extract all entities from raw text.

    Returns a list of ExtractedEntity with type, value, confidence, and context.
    The order of pattern matching matters — longer/more specific patterns first
    to avoid false positives (e.g., SHA-256 before MD5).
    """
    entities: list[ExtractedEntity] = []
    seen_values: set[str] = set()

    # Extract aliases first (structured patterns)
    for alias in extract_aliases(text):
        if alias.original_value not in seen_values:
            entities.append(alias)
            seen_values.add(alias.original_value)

    # Process patterns in specificity order
    ordered_patterns = [
        "sha256_hash",    # 64 chars — most specific
        "pgp_key_block",
        "pgp_fingerprint",  # 40 hex chars (avoid collision with sha1)
        "sha1_hash",      # 40 chars
        "md5_hash",        # 32 chars
        "monero_wallet",
        "bitcoin_wallet",
        "ethereum_wallet",
        "email",
        "onion_v3",
        "onion_v2",
        "url",
        "domain",
        "ipv4",
    ]

    for pattern_name in ordered_patterns:
        pattern = PATTERNS[pattern_name]
        entity_type = PATTERN_TO_TYPE[pattern_name]

        for match in pattern.finditer(text):
            value = match.group(1) if match.lastindex else match.group(0)
            value = value.strip()

            # Skip if already captured by a more specific pattern
            if value in seen_values:
                continue

            # Basic validation
            if entity_type == "ip":
                parts = value.split(".")
                if not all(0 <= int(p) <= 255 for p in parts):
                    continue

            # Skip very short hash matches that are likely false positives
            if entity_type == "hash" and len(value) == 32:
                # MD5 — only accept if it looks intentional (all hex)
                if not re.match(r'^[a-fA-F0-9]{32}$', value):
                    continue

            entities.append(ExtractedEntity(
                entity_type=entity_type,
                original_value=value,
                confidence=0.9 if entity_type in ("wallet", "pgp", "email") else 0.7,
                context=_extract_context(text, match.start(), match.end()),
            ))
            seen_values.add(value)

    return entities
