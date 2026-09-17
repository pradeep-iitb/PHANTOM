"""PHANTOM Engine — Entity normalization.

Each normalizer transforms original values to canonical forms
while always preserving the original value. This enables
cross-source matching on normalized representations.
"""

import re
import unicodedata


def normalize_alias(value: str) -> str:
    """Normalize an alias/username for comparison.

    - Unicode NFC normalization
    - Lowercase
    - Strip whitespace
    - Remove common decorators (@, #)
    """
    normalized = unicodedata.normalize("NFC", value)
    normalized = normalized.lower().strip()
    normalized = re.sub(r'^[@#]+', '', normalized)
    normalized = re.sub(r'\s+', '', normalized)
    return normalized


def normalize_wallet(value: str) -> str:
    """Normalize a cryptocurrency wallet address.

    Bitcoin: preserve case (base58 is case-sensitive)
    Ethereum: lowercase (EIP-55 checksum optional for comparison)
    """
    value = value.strip()
    if value.startswith("0x"):
        return value.lower()
    return value  # BTC addresses are case-sensitive


def normalize_pgp(value: str) -> str:
    """Normalize PGP fingerprint to uppercase hex, no spaces."""
    cleaned = re.sub(r'[\s:\-]', '', value)
    return cleaned.upper()


def normalize_email(value: str) -> str:
    """Normalize email to lowercase."""
    return value.strip().lower()


def normalize_domain(value: str) -> str:
    """Normalize domain — lowercase, strip trailing dots."""
    return value.strip().lower().rstrip(".")


def normalize_onion(value: str) -> str:
    """Normalize onion address to lowercase."""
    return value.strip().lower()


def normalize_ip(value: str) -> str:
    """Normalize IP address — strip leading zeros."""
    parts = value.split(".")
    return ".".join(str(int(p)) for p in parts)


def normalize_hash(value: str) -> str:
    """Normalize hash to lowercase hex."""
    return value.strip().lower()


def normalize_url(value: str) -> str:
    """Normalize URL — lowercase scheme and host."""
    return value.strip()


# ── Dispatcher ───────────────────────────────────────────
NORMALIZERS = {
    "alias": normalize_alias,
    "wallet": normalize_wallet,
    "pgp": normalize_pgp,
    "email": normalize_email,
    "domain": normalize_domain,
    "onion": normalize_onion,
    "ip": normalize_ip,
    "hash": normalize_hash,
    "url": normalize_url,
}


def normalize_entity(entity_type: str, original_value: str) -> str:
    """Normalize an entity value based on its type.

    Returns the normalized value. If no normalizer exists for
    the type, returns the original value stripped.
    """
    normalizer = NORMALIZERS.get(entity_type)
    if normalizer:
        return normalizer(original_value)
    return original_value.strip()
