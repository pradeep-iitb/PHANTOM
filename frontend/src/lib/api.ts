/** API client configuration and helper functions */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API Error: ${res.status}`);
  }
  return res.json();
}

// ── Types ───────────────────────────────────────────────
export interface Case {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  observation_count: number;
  entity_count: number;
  hypothesis_count: number;
}

export interface Observation {
  id: string;
  case_id: string;
  source_id: string | null;
  observed_at: string | null;
  collected_at: string;
  raw_content: string;
  content_hash: string | null;
  source_reference: string;
  handling_notes: string;
  created_at: string;
}

export interface Entity {
  id: string;
  observation_id: string | null;
  case_id: string;
  entity_type: string;
  original_value: string;
  normalized_value: string;
  confidence: number;
  first_seen: string | null;
  last_seen: string | null;
  created_at: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  properties: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
  confidence: number;
  properties: Record<string, unknown>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Hypothesis {
  id: string;
  case_id: string;
  title: string;
  description: string;
  confidence: number;
  confidence_level: string;
  status: string;
  entities_involved: Array<{ id: string; type: string; value: string }>;
  strong_evidence: Array<{ type: string; strength: string; description: string; score: number }>;
  supporting_signals: Array<{ type: string; strength: string; description: string; score: number }>;
  contradictions: Array<{ type: string; severity: string; description: string }>;
  created_at: string;
  updated_at: string;
}

export interface ProcessingJob {
  id: string;
  case_id: string;
  job_type: string;
  status: string;
  progress: number;
  result: Record<string, unknown>;
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

// ── API Functions ───────────────────────────────────────
export const api = {
  // Cases
  listCases: () => apiFetch<Case[]>("/api/v1/cases"),
  createCase: (data: { title: string; description: string }) =>
    apiFetch<Case>("/api/v1/cases", { method: "POST", body: JSON.stringify(data) }),
  getCase: (id: string) => apiFetch<Case>(`/api/v1/cases/${id}`),

  // Observations
  listObservations: (caseId: string) =>
    apiFetch<Observation[]>(`/api/v1/cases/${caseId}/observations`),
  addObservation: (caseId: string, data: {
    raw_content: string;
    source_name?: string;
    source_type?: string;
    source_reliability?: number;
    observed_at?: string;
    source_reference?: string;
    handling_notes?: string;
  }) =>
    apiFetch<Observation>(`/api/v1/cases/${caseId}/observations`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  bulkAddObservations: (caseId: string, observations: Array<{
    raw_content: string;
    source_name?: string;
    source_type?: string;
    source_reliability?: number;
    observed_at?: string;
    source_reference?: string;
    handling_notes?: string;
  }>) =>
    apiFetch<Observation[]>(`/api/v1/cases/${caseId}/observations/bulk`, {
      method: "POST",
      body: JSON.stringify(observations),
    }),

  // Entities
  listEntities: (caseId: string) =>
    apiFetch<Entity[]>(`/api/v1/cases/${caseId}/entities`),

  // Graph
  getGraph: (caseId: string) =>
    apiFetch<GraphData>(`/api/v1/cases/${caseId}/graph`),

  // Hypotheses
  listHypotheses: (caseId: string) =>
    apiFetch<Hypothesis[]>(`/api/v1/cases/${caseId}/hypotheses`),
  getHypothesis: (id: string) =>
    apiFetch<Hypothesis>(`/api/v1/hypotheses/${id}`),
  reviewHypothesis: (id: string, data: { decision: string; comment: string }) =>
    apiFetch<Hypothesis>(`/api/v1/hypotheses/${id}/review`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Processing
  triggerProcessing: (caseId: string) =>
    apiFetch<ProcessingJob>(`/api/v1/cases/${caseId}/process`, { method: "POST" }),
  getJob: (jobId: string) =>
    apiFetch<ProcessingJob>(`/api/v1/jobs/${jobId}`),
};
