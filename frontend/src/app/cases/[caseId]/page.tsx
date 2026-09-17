"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { api, type Case, type Observation, type Entity, type Hypothesis, type GraphData, type ProcessingJob } from "@/lib/api";
import cytoscape from "cytoscape";

// ── Entity type color mapping for graph ─────────────────
const ENTITY_COLORS: Record<string, string> = {
  alias: "#00f0ff",
  wallet: "#f59e0b",
  pgp: "#a855f7",
  email: "#3b82f6",
  domain: "#22c55e",
  onion: "#8b5cf6",
  ip: "#ec4899",
  hash: "#6b7280",
  url: "#06b6d4",
};

const EDGE_COLORS: Record<string, string> = {
  candidate: "#f59e0b",
  accepted: "#22c55e",
  rejected: "#ef4444",
};

type Tab = "overview" | "observations" | "entities" | "graph" | "hypotheses";

export default function CaseWorkspacePage() {
  const params = useParams();
  const caseId = params.caseId as string;

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingJob, setProcessingJob] = useState<ProcessingJob | null>(null);
  const [loading, setLoading] = useState(true);

  // Observation form
  const [showObsForm, setShowObsForm] = useState(false);
  const [obsContent, setObsContent] = useState("");
  const [obsSource, setObsSource] = useState("manual");
  const [obsSourceType, setObsSourceType] = useState("manual");
  const [obsDate, setObsDate] = useState("");
  const [addingObs, setAddingObs] = useState(false);

  // Graph ref
  const graphRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const [c, obs, ents, hyps, graph] = await Promise.all([
        api.getCase(caseId),
        api.listObservations(caseId),
        api.listEntities(caseId),
        api.listHypotheses(caseId),
        api.getGraph(caseId),
      ]);
      setCaseData(c);
      setObservations(obs);
      setEntities(ents);
      setHypotheses(hyps);
      setGraphData(graph);
    } catch {
      // Backend not available
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Graph rendering ───────────────────────────────────
  useEffect(() => {
    if (activeTab !== "graph" || !graphRef.current || !graphData) return;
    if (graphData.nodes.length === 0) return;

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const elements: cytoscape.ElementDefinition[] = [
      ...graphData.nodes.map((n) => ({
        data: {
          id: n.id,
          label: n.label.length > 20 ? n.label.substring(0, 18) + "…" : n.label,
          fullLabel: n.label,
          type: n.type,
          color: ENTITY_COLORS[n.type] || "#6b7280",
        },
      })),
      ...graphData.edges.map((e) => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          type: e.type,
          color: EDGE_COLORS[e.type] || "#f59e0b",
          confidence: e.confidence,
        },
      })),
    ];

    cyRef.current = cytoscape({
      container: graphRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "data(color)",
            label: "data(label)",
            color: "#e2e8f0",
            "font-size": "10px",
            "text-margin-y": -8,
            "text-valign": "top",
            width: 30,
            height: 30,
            "border-width": 2,
            "border-color": "data(color)",
            "border-opacity": 0.5,
            "background-opacity": 0.3,
          },
        },
        {
          selector: "edge",
          style: {
            "line-color": "data(color)",
            "target-arrow-color": "data(color)",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            width: 2,
            label: "data(label)",
            color: "#64748b",
            "font-size": "8px",
            "text-rotation": "autorotate",
            opacity: 0.7,
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-width": 4,
            "border-color": "#00f0ff",
            "background-opacity": 0.6,
          },
        },
      ],
      layout: {
        name: "cose",
        padding: 40,
        nodeRepulsion: () => 8000,
        idealEdgeLength: () => 120,
        animate: true,
        animationDuration: 800,
      },
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [activeTab, graphData]);

  // ── Handlers ──────────────────────────────────────────
  const handleAddObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsContent.trim()) return;
    setAddingObs(true);
    try {
      await api.addObservation(caseId, {
        raw_content: obsContent.trim(),
        source_name: obsSource || "manual",
        source_type: obsSourceType || "manual",
        observed_at: obsDate ? new Date(obsDate).toISOString() : undefined,
      });
      setObsContent("");
      setObsSource("manual");
      setObsDate("");
      setShowObsForm(false);
      loadAll();
    } catch {
      alert("Failed to add observation");
    } finally {
      setAddingObs(false);
    }
  };

  const handleLoadSynthetic = async () => {
    try {
      const response = await fetch("/synthetic_data.json");
      const data = await response.json();
      await api.bulkAddObservations(caseId, data);
      loadAll();
    } catch {
      alert("Failed to load synthetic data. Make sure synthetic_data.json is in the public folder.");
    }
  };

  const handleProcess = async () => {
    setProcessing(true);
    try {
      const job = await api.triggerProcessing(caseId);
      setProcessingJob(job);

      // Poll for completion
      const interval = setInterval(async () => {
        try {
          const updated = await api.getJob(job.id);
          setProcessingJob(updated);
          if (updated.status === "completed" || updated.status === "failed") {
            clearInterval(interval);
            setProcessing(false);
            if (updated.status === "completed") {
              loadAll();
            }
          }
        } catch {
          clearInterval(interval);
          setProcessing(false);
        }
      }, 1000);
    } catch {
      setProcessing(false);
      alert("Failed to start processing");
    }
  };

  const handleReview = async (hypothesisId: string, decision: string) => {
    try {
      await api.reviewHypothesis(hypothesisId, { decision, comment: "" });
      loadAll();
    } catch {
      alert("Failed to submit review");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-[#64748b]">
        <div className="animate-spin w-8 h-8 border-2 border-[#1e2d3d] border-t-[#00f0ff] rounded-full mx-auto mb-3" />
        Loading investigation...
      </div>
    );
  }

  if (!caseData) {
    return <div className="text-center py-20 text-[#ef4444]">Case not found or backend unavailable.</div>;
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "observations", label: "Observations", count: observations.length },
    { key: "entities", label: "Entities", count: entities.length },
    { key: "graph", label: "Graph", count: graphData?.nodes.length || 0 },
    { key: "hypotheses", label: "Hypotheses", count: hypotheses.length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Case Header */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">{caseData.title}</h1>
              <span className={`status-${caseData.status} text-xs px-2.5 py-0.5 rounded-full font-medium`}>
                {caseData.status.replace("_", " ")}
              </span>
            </div>
            {caseData.description && (
              <p className="text-sm text-[#64748b]">{caseData.description}</p>
            )}
          </div>
          <button
            onClick={handleProcess}
            disabled={processing || observations.length === 0}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg text-sm font-medium hover:from-purple-500 hover:to-cyan-500 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20 flex items-center gap-2"
          >
            {processing ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Processing...
              </>
            ) : (
              <>⚡ Run Attribution Pipeline</>
            )}
          </button>
        </div>

        {/* Processing status */}
        {processingJob && (
          <div className={`mt-3 p-3 rounded-lg text-sm ${
            processingJob.status === "completed" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
            processingJob.status === "failed" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
            "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
          }`}>
            <div className="flex items-center justify-between">
              <span>
                Pipeline: {processingJob.status}
                {processingJob.status === "running" && ` (${(processingJob.progress * 100).toFixed(0)}%)`}
              </span>
              {processingJob.result && Object.keys(processingJob.result).length > 0 && (
                <span className="text-xs opacity-70">
                  {Object.entries(processingJob.result).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                </span>
              )}
            </div>
            {processingJob.status === "running" && (
              <div className="mt-2 bg-[#0a0e17] rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${processingJob.progress * 100}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1e2d3d]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? "text-[#00f0ff]"
                : "text-[#64748b] hover:text-[#94a3b8]"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1.5 text-xs opacity-60">({tab.count})</span>
            )}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00f0ff]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {/* ── Overview ───────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-[#00f0ff]">{observations.length}</div>
              <div className="text-xs text-[#64748b] uppercase tracking-wider mt-1">Observations</div>
            </div>
            <div className="glass rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-[#a855f7]">{entities.length}</div>
              <div className="text-xs text-[#64748b] uppercase tracking-wider mt-1">Entities</div>
            </div>
            <div className="glass rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-[#f59e0b]">{graphData?.edges.length || 0}</div>
              <div className="text-xs text-[#64748b] uppercase tracking-wider mt-1">Relationships</div>
            </div>
            <div className="glass rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-[#22c55e]">{hypotheses.length}</div>
              <div className="text-xs text-[#64748b] uppercase tracking-wider mt-1">Hypotheses</div>
            </div>

            {hypotheses.length > 0 && (
              <div className="md:col-span-2 lg:col-span-4 glass rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Top Attribution Hypotheses</h3>
                <div className="space-y-3">
                  {hypotheses.slice(0, 3).map((h) => (
                    <div key={h.id} className="bg-[#0a0e17] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">{h.title}</span>
                        <span className={`confidence-${h.confidence_level} font-mono text-sm font-bold`}>
                          {(h.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-[#64748b]">
                        <span className="text-green-400">✓ {h.strong_evidence.length} strong</span>
                        <span className="text-blue-400">◐ {h.supporting_signals.length} supporting</span>
                        <span className="text-red-400">⚠ {h.contradictions.length} contradictions</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Observations ───────────────────────────────── */}
        {activeTab === "observations" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={() => setShowObsForm(!showObsForm)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg text-sm font-medium"
              >
                + Add Observation
              </button>
              <button
                onClick={handleLoadSynthetic}
                className="px-4 py-2 glass glass-hover rounded-lg text-sm text-[#94a3b8] hover:text-white"
              >
                📥 Load Synthetic Data
              </button>
            </div>

            {showObsForm && (
              <form onSubmit={handleAddObservation} className="glass rounded-xl p-6 space-y-4 animate-fade-in">
                <h3 className="text-white font-semibold">Add Observation</h3>
                <div>
                  <label className="block text-sm text-[#94a3b8] mb-1">Raw Content</label>
                  <textarea
                    value={obsContent}
                    onChange={(e) => setObsContent(e.target.value)}
                    placeholder={"alias: ShadowX\nsource: DarkForum Alpha\ntimestamp: 2026-01-10\n\nSelling premium access...\nPGP fingerprint: XXXX XXXX...\nPayment: 1A1z..."}
                    rows={8}
                    className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e2d3d] rounded-lg text-white text-sm font-mono focus:border-[#00f0ff] focus:outline-none resize-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-[#94a3b8] mb-1">Source Name</label>
                    <input
                      type="text"
                      value={obsSource}
                      onChange={(e) => setObsSource(e.target.value)}
                      placeholder="DarkForum Alpha"
                      className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e2d3d] rounded-lg text-white text-sm focus:border-[#00f0ff] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#94a3b8] mb-1">Source Type</label>
                    <select
                      value={obsSourceType}
                      onChange={(e) => setObsSourceType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e2d3d] rounded-lg text-white text-sm focus:border-[#00f0ff] focus:outline-none"
                    >
                      <option value="manual">Manual Entry</option>
                      <option value="forum">Forum</option>
                      <option value="marketplace">Marketplace</option>
                      <option value="paste">Paste</option>
                      <option value="intelligence">Intelligence Feed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#94a3b8] mb-1">Observed Date</label>
                    <input
                      type="date"
                      value={obsDate}
                      onChange={(e) => setObsDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e2d3d] rounded-lg text-white text-sm focus:border-[#00f0ff] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={addingObs}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {addingObs ? "Adding..." : "Add Observation"}
                  </button>
                  <button type="button" onClick={() => setShowObsForm(false)} className="px-4 py-2 text-sm text-[#64748b]">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {observations.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-[#64748b]">No observations yet. Add observations or load synthetic data to begin.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {observations.map((obs, i) => (
                  <div key={obs.id} className="glass rounded-xl p-5 animate-slide-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[#64748b]">#{i + 1}</span>
                        {obs.observed_at && (
                          <span className="text-xs text-[#94a3b8]">
                            📅 {new Date(obs.observed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-[#4b5563]">{obs.content_hash?.substring(0, 8)}...</span>
                    </div>
                    <pre className="text-sm text-[#94a3b8] font-mono whitespace-pre-wrap bg-[#0a0e17] rounded-lg p-4 overflow-x-auto max-h-48 overflow-y-auto">
                      {obs.raw_content}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Entities ───────────────────────────────────── */}
        {activeTab === "entities" && (
          <div>
            {entities.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-[#64748b]">No entities extracted yet. Run the attribution pipeline to extract entities.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(
                  entities.reduce((acc, e) => {
                    acc[e.entity_type] = acc[e.entity_type] || [];
                    acc[e.entity_type].push(e);
                    return acc;
                  }, {} as Record<string, Entity[]>)
                ).map(([type, ents]) => (
                  <div key={type} className="glass rounded-xl p-5">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <span className={`entity-${type} px-2 py-0.5 rounded text-xs font-mono uppercase border`}>
                        {type}
                      </span>
                      <span className="text-[#64748b] text-sm">({ents.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {ents.map((e) => (
                        <div key={e.id} className="bg-[#0a0e17] rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <span className="text-sm font-mono text-white">{e.original_value}</span>
                            {e.original_value !== e.normalized_value && (
                              <span className="text-xs text-[#64748b] ml-2">→ {e.normalized_value}</span>
                            )}
                          </div>
                          <span className="text-xs text-[#64748b] font-mono">{(e.confidence * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Graph ──────────────────────────────────────── */}
        {activeTab === "graph" && (
          <div>
            {graphData && graphData.nodes.length > 0 ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm text-[#64748b]">
                    {graphData.nodes.length} nodes · {graphData.edges.length} edges
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(ENTITY_COLORS).map(([type, color]) => (
                      <span key={type} className="flex items-center gap-1 text-xs text-[#64748b]">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  ref={graphRef}
                  className="glass rounded-xl w-full"
                  style={{ height: "500px" }}
                />
              </>
            ) : (
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-[#64748b]">No graph data yet. Run the attribution pipeline to generate the relationship graph.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Hypotheses ─────────────────────────────────── */}
        {activeTab === "hypotheses" && (
          <div>
            {hypotheses.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-[#64748b]">No hypotheses generated yet. Run the attribution pipeline.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {hypotheses.map((h) => (
                  <div key={h.id} className="glass rounded-xl p-6 animate-fade-in">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{h.title}</h3>
                        <p className="text-sm text-[#64748b] mt-1">{h.description}</p>
                      </div>
                      <div className="text-right">
                        <div className={`confidence-${h.confidence_level} text-3xl font-bold font-mono`}>
                          {(h.confidence * 100).toFixed(0)}%
                        </div>
                        <div className={`confidence-${h.confidence_level} text-xs uppercase tracking-wider`}>
                          {h.confidence_level}
                        </div>
                      </div>
                    </div>

                    {/* Confidence bar */}
                    <div className="bg-[#0a0e17] rounded-full h-2 mb-6">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          h.confidence_level === "high" ? "bg-green-500" :
                          h.confidence_level === "medium" ? "bg-amber-500" :
                          h.confidence_level === "low" ? "bg-red-500" : "bg-gray-500"
                        }`}
                        style={{ width: `${h.confidence * 100}%` }}
                      />
                    </div>

                    {/* Entities involved */}
                    <div className="mb-4">
                      <h4 className="text-xs text-[#64748b] uppercase tracking-wider mb-2">Entities Involved</h4>
                      <div className="flex flex-wrap gap-2">
                        {h.entities_involved.map((e, i) => (
                          <span key={i} className={`entity-${e.type} px-2.5 py-1 rounded-md text-xs font-mono border`}>
                            {e.value}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Evidence breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Strong Evidence */}
                      <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                        <h4 className="text-green-400 text-xs uppercase tracking-wider font-semibold mb-2">
                          ✓ Strong Evidence ({h.strong_evidence.length})
                        </h4>
                        <div className="space-y-1.5">
                          {h.strong_evidence.map((e, i) => (
                            <div key={i} className="text-xs text-[#94a3b8]">
                              {e.description}
                            </div>
                          ))}
                          {h.strong_evidence.length === 0 && (
                            <div className="text-xs text-[#4b5563]">None</div>
                          )}
                        </div>
                      </div>

                      {/* Supporting Signals */}
                      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                        <h4 className="text-blue-400 text-xs uppercase tracking-wider font-semibold mb-2">
                          ◐ Supporting Signals ({h.supporting_signals.length})
                        </h4>
                        <div className="space-y-1.5">
                          {h.supporting_signals.map((s, i) => (
                            <div key={i} className="text-xs text-[#94a3b8]">
                              {s.description}
                            </div>
                          ))}
                          {h.supporting_signals.length === 0 && (
                            <div className="text-xs text-[#4b5563]">None</div>
                          )}
                        </div>
                      </div>

                      {/* Contradictions */}
                      <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                        <h4 className="text-red-400 text-xs uppercase tracking-wider font-semibold mb-2">
                          ⚠ Contradictions ({h.contradictions.length})
                        </h4>
                        <div className="space-y-1.5">
                          {h.contradictions.map((c, i) => (
                            <div key={i} className="text-xs text-[#94a3b8]">
                              <span className={`text-${c.severity === "high" ? "red" : "amber"}-400`}>
                                [{c.severity}]
                              </span>{" "}
                              {c.description}
                            </div>
                          ))}
                          {h.contradictions.length === 0 && (
                            <div className="text-xs text-[#4b5563]">None identified</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Analyst Review */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#1e2d3d]">
                      <div className="flex items-center gap-2">
                        <span className={`status-${h.status} text-xs px-2.5 py-0.5 rounded-full font-medium`}>
                          {h.status.replace("_", " ")}
                        </span>
                      </div>
                      {h.status === "generated" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReview(h.id, "accepted")}
                            className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-medium hover:bg-green-500/20 transition-colors"
                          >
                            ✓ Accept
                          </button>
                          <button
                            onClick={() => handleReview(h.id, "rejected")}
                            className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors"
                          >
                            ✗ Reject
                          </button>
                          <button
                            onClick={() => handleReview(h.id, "needs_more_evidence")}
                            className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-medium hover:bg-amber-500/20 transition-colors"
                          >
                            ◐ Need More
                          </button>
                          <button
                            onClick={() => handleReview(h.id, "unresolved")}
                            className="px-3 py-1.5 bg-[#1a2332] text-[#94a3b8] border border-[#1e2d3d] rounded-lg text-xs font-medium hover:bg-[#1e2d3d] transition-colors"
                          >
                            Keep Unresolved
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
