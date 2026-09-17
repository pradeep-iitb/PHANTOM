"""Pydantic schemas for PHANTOM API request/response validation."""

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


# ── Case ─────────────────────────────────────────────────
class CaseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = ""


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class CaseResponse(BaseModel):
    id: UUID
    title: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime
    observation_count: int = 0
    entity_count: int = 0
    hypothesis_count: int = 0

    model_config = {"from_attributes": True}


# ── Source ────────────────────────────────────────────────
class SourceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    source_type: str = "unknown"
    reliability: float = Field(0.5, ge=0.0, le=1.0)
    description: str = ""


class SourceResponse(BaseModel):
    id: UUID
    name: str
    source_type: str
    reliability: float
    description: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Observation ──────────────────────────────────────────
class ObservationCreate(BaseModel):
    raw_content: str = Field(..., min_length=1)
    source_name: str = "manual"
    source_type: str = "manual"
    source_reliability: float = Field(0.5, ge=0.0, le=1.0)
    observed_at: Optional[datetime] = None
    source_reference: str = ""
    handling_notes: str = ""
    metadata: dict = {}


class ObservationResponse(BaseModel):
    id: UUID
    case_id: UUID
    source_id: Optional[UUID] = None
    observed_at: Optional[datetime] = None
    collected_at: datetime
    raw_content: str
    content_hash: Optional[str] = None
    source_reference: str
    handling_notes: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Entity ───────────────────────────────────────────────
class EntityResponse(BaseModel):
    id: UUID
    observation_id: Optional[UUID] = None
    case_id: UUID
    entity_type: str
    original_value: str
    normalized_value: str
    confidence: float
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Relationship ─────────────────────────────────────────
class RelationshipResponse(BaseModel):
    id: UUID
    case_id: UUID
    entity_a_id: UUID
    entity_b_id: UUID
    relationship_type: str
    status: str
    confidence: float
    reason: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Hypothesis ───────────────────────────────────────────
class HypothesisResponse(BaseModel):
    id: UUID
    case_id: UUID
    title: str
    description: str
    confidence: float
    confidence_level: str
    status: str
    entities_involved: list = []
    strong_evidence: list = []
    supporting_signals: list = []
    contradictions: list = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class HypothesisReview(BaseModel):
    decision: str = Field(..., pattern="^(accepted|rejected|needs_more_evidence|unresolved)$")
    comment: str = ""


# ── Processing Job ───────────────────────────────────────
class JobResponse(BaseModel):
    id: UUID
    case_id: UUID
    job_type: str
    status: str
    progress: float
    result: dict = {}
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Graph ────────────────────────────────────────────────
class GraphNode(BaseModel):
    id: str
    label: str
    type: str
    properties: dict = {}


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    type: str
    confidence: float = 0.0
    properties: dict = {}


class GraphResponse(BaseModel):
    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []
