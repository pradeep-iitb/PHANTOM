"""SQLAlchemy ORM models for PHANTOM.

These models represent the authoritative structured data in PostgreSQL.
Neo4j is used separately for graph relationships and traversal.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Float, DateTime, ForeignKey, JSON, Enum, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


def utcnow():
    return datetime.now(timezone.utc)


def new_uuid():
    return uuid.uuid4()


# ──────────────────────────────────────────────────────────────
# Case — an investigation container
# ──────────────────────────────────────────────────────────────
class Case(Base):
    __tablename__ = "cases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    status = Column(String(50), default="open")  # open, in_progress, closed
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    observations = relationship("Observation", back_populates="case", cascade="all, delete-orphan")
    hypotheses = relationship("Hypothesis", back_populates="case", cascade="all, delete-orphan")
    processing_jobs = relationship("ProcessingJob", back_populates="case", cascade="all, delete-orphan")


# ──────────────────────────────────────────────────────────────
# Source — where observations come from
# ──────────────────────────────────────────────────────────────
class Source(Base):
    __tablename__ = "sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    name = Column(String(255), nullable=False)
    source_type = Column(String(100), default="unknown")  # forum, marketplace, paste, manual, etc.
    reliability = Column(Float, default=0.5)  # 0.0 to 1.0
    description = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=utcnow)

    observations = relationship("Observation", back_populates="source")


# ──────────────────────────────────────────────────────────────
# Observation — a raw piece of collected evidence
# ──────────────────────────────────────────────────────────────
class Observation(Base):
    __tablename__ = "observations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    source_id = Column(UUID(as_uuid=True), ForeignKey("sources.id"), nullable=True)
    observed_at = Column(DateTime(timezone=True), nullable=True)
    collected_at = Column(DateTime(timezone=True), default=utcnow)
    raw_content = Column(Text, nullable=False)
    content_hash = Column(String(64), nullable=True)
    source_reference = Column(String(512), default="")
    handling_notes = Column(Text, default="")
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    case = relationship("Case", back_populates="observations")
    source = relationship("Source", back_populates="observations")
    entities = relationship("Entity", back_populates="observation")
    evidence_items = relationship("EvidenceItem", back_populates="observation")

    __table_args__ = (Index("ix_observations_case_id", "case_id"),)


# ──────────────────────────────────────────────────────────────
# Entity — an extracted and normalized identifier
# ──────────────────────────────────────────────────────────────
class Entity(Base):
    __tablename__ = "entities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    observation_id = Column(UUID(as_uuid=True), ForeignKey("observations.id"), nullable=True)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    entity_type = Column(String(50), nullable=False)  # alias, wallet, pgp, domain, email, ip, hash, url, onion, infrastructure, platform
    original_value = Column(Text, nullable=False)
    normalized_value = Column(Text, nullable=False)
    confidence = Column(Float, default=1.0)
    first_seen = Column(DateTime(timezone=True), nullable=True)
    last_seen = Column(DateTime(timezone=True), nullable=True)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    observation = relationship("Observation", back_populates="entities")
    evidence_items = relationship("EvidenceItem", back_populates="entity")

    __table_args__ = (
        Index("ix_entities_case_id", "case_id"),
        Index("ix_entities_type_normalized", "entity_type", "normalized_value"),
    )


# ──────────────────────────────────────────────────────────────
# EvidenceItem — links entities to observations with context
# ──────────────────────────────────────────────────────────────
class EvidenceItem(Base):
    __tablename__ = "evidence_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    observation_id = Column(UUID(as_uuid=True), ForeignKey("observations.id"), nullable=True)
    entity_id = Column(UUID(as_uuid=True), ForeignKey("entities.id"), nullable=True)
    relationship_id = Column(UUID(as_uuid=True), ForeignKey("relationships.id"), nullable=True)
    evidence_type = Column(String(100), nullable=False)  # extraction, identifier_match, similarity, temporal, etc.
    strength = Column(String(50), default="supporting")  # strong, supporting, weak
    excerpt = Column(Text, default="")
    source_context = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=utcnow)

    observation = relationship("Observation", back_populates="evidence_items")
    entity = relationship("Entity", back_populates="evidence_items")
    relationship_ref = relationship("Relationship", back_populates="evidence_items")


# ──────────────────────────────────────────────────────────────
# Relationship — a candidate or confirmed link between entities
# ──────────────────────────────────────────────────────────────
class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    entity_a_id = Column(UUID(as_uuid=True), ForeignKey("entities.id"), nullable=False)
    entity_b_id = Column(UUID(as_uuid=True), ForeignKey("entities.id"), nullable=False)
    relationship_type = Column(String(100), nullable=False)  # USES, ASSOCIATED_WITH, POSSIBLY_SAME_AS, OBSERVED_IN, etc.
    status = Column(String(50), default="candidate")  # candidate, accepted, rejected
    confidence = Column(Float, default=0.0)
    reason = Column(Text, default="")
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    evidence_items = relationship("EvidenceItem", back_populates="relationship_ref")

    __table_args__ = (Index("ix_relationships_case_id", "case_id"),)


# ──────────────────────────────────────────────────────────────
# Hypothesis — an attribution hypothesis linking entities
# ──────────────────────────────────────────────────────────────
class Hypothesis(Base):
    __tablename__ = "hypotheses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    confidence = Column(Float, default=0.0)
    confidence_level = Column(String(50), default="insufficient")  # high, medium, low, insufficient
    status = Column(String(50), default="generated")  # generated, under_review, accepted, rejected
    entities_involved = Column(JSON, default=list)  # list of entity IDs
    strong_evidence = Column(JSON, default=list)
    supporting_signals = Column(JSON, default=list)
    contradictions = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    case = relationship("Case", back_populates="hypotheses")
    analyst_reviews = relationship("AnalystReview", back_populates="hypothesis", cascade="all, delete-orphan")


# ──────────────────────────────────────────────────────────────
# AnalystReview — investigator's decision on a hypothesis
# ──────────────────────────────────────────────────────────────
class AnalystReview(Base):
    __tablename__ = "analyst_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    hypothesis_id = Column(UUID(as_uuid=True), ForeignKey("hypotheses.id"), nullable=False)
    decision = Column(String(50), nullable=False)  # accepted, rejected, needs_more_evidence, unresolved
    comment = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=utcnow)

    hypothesis = relationship("Hypothesis", back_populates="analyst_reviews")


# ──────────────────────────────────────────────────────────────
# ProcessingJob — background processing task
# ──────────────────────────────────────────────────────────────
class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    job_type = Column(String(100), default="full_pipeline")
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    progress = Column(Float, default=0.0)
    result = Column(JSON, default=dict)
    error = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    case = relationship("Case", back_populates="processing_jobs")
