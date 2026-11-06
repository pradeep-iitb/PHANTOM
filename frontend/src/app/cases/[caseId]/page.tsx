"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { api, type Case, type Observation, type Entity, type Hypothesis, type GraphData, type ProcessingJob } from "@/lib/api";
import cytoscape from "cytoscape";

// ── Forensic Entity Type Colors with High Contrast ──────
const ENTITY_COLORS: Record<string, string> = {
  alias: "#00f0ff",
  wallet: "#fbbf24",
  pgp: "#c084fc",
  email: "#60a5fa",
  domain: "#34d399",
  onion: "#818cf8",
  ip: "#f472b6",
  hash: "#cbd5e1",
  url: "#38bdf8",
};

const EDGE_COLORS: Record<string, string> = {
  candidate: "#fbbf24",
  accepted: "#34d399",
  rejected: "#f87171",
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
      // Backend unavailable
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Cytoscape Graph Rendering ───────────────────────────
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
          color: ENTITY_COLORS[n.type] || "#cbd5e1",
        },
      })),
      ...graphData.edges.map((e) => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          type: e.type,
          color: EDGE_COLORS[e.type] || "#fbbf24",
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
            "background-color": "#070b14",
            label: "data(label)",
            color: "#ffffff",
            "font-size": "11px",
            "font-family": "JetBrains Mono, monospace",
            "text-margin-y": -8,
            "text-valign": "top",
            width: 26,
            height: 26,
            "border-width": 2,
            "border-color": "data(color)",
          },
        },
        {
          selector: "edge",
          style: {
            "line-color": "data(color)",
            "target-arrow-color": "data(color)",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            width: 1.5,
            label: "data(label)",
            color: "#94a3b8",
            "font-size": "9px",
            "font-family": "JetBrains Mono, monospace",
            "text-rotation": "autorotate",
            opacity: 0.85,
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-width": 3,
            "border-color": "#00f0ff",
          },
        },
      ],
      layout: {
        name: "cose",
        animate: false,
        nodeRepulsion: () => 6000,
        idealEdgeLength: () => 100,
      },
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [activeTab, graphData]);

  const handleAddObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsContent.trim()) return;
    setAddingObs(true);
    try {
      await api.addObservation(caseId, {
        raw_content: obsContent.trim(),
        source_name: obsSource.trim() || "manual",
        source_type: obsSourceType,
        observed_at: obsDate ? new Date(obsDate).toISOString() : undefined,
      });
      setObsContent("");
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
      alert("Failed to load synthetic observations dataset.");
    }
  };

  const handleProcess = async () => {
    setProcessing(true);
    try {
      const job = await api.triggerProcessing(caseId);
      setProcessingJob(job);

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
      }, 800);
    } catch {
      setProcessing(false);
      alert("Failed to initiate attribution pipeline.");
    }
  };

  const handleReview = async (hypothesisId: string, decision: string) => {
    try {
      await api.reviewHypothesis(hypothesisId, { decision, comment: "" });
      loadAll();
    } catch {
      alert("Failed to record review decision");
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-32 pb-20 text-center text-zinc-400 font-mono text-sm">
        Scanning case dossier...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-32 pb-20 text-center text-rose-400 font-mono text-sm">
        Case dossier not found or backend service unreachable. Ensure FastAPI is running on port 8000.
      </div>
    );
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Dossier Summary" },
    { key: "observations", label: "Evidence Observations", count: observations.length },
    { key: "entities", label: "Extracted Entities", count: entities.length },
    { key: "graph", label: "Topology Graph", count: graphData?.nodes.length || 0 },
    { key: "hypotheses", label: "Attribution Hypotheses", count: hypotheses.length },
  ];

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      {/* ── Case Header ───────────────────────────────────────────── */}
      <div className="p-6 border border-white/[0.14] bg-[#090e1b] rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 font-mono text-xs text-zinc-400">
              <span className="text-cyan-400 font-semibold">DOSSIER #{caseData.id.slice(0, 10)}</span>
              <span>·</span>
              <span className="font-mono text-[10px] uppercase px-2.5 py-0.5 rounded-md border border-white/[0.15] bg-black/60 text-zinc-200 font-medium">
                {caseData.status.replace("_", " ")}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">{caseData.title}</h1>
            {caseData.description && (
              <p className="text-sm text-zinc-300 mt-1.5 leading-relaxed max-w-3xl font-sans">{caseData.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={handleProcess}
              disabled={processing || observations.length === 0}
              className="px-5 py-2.5 bg-white text-black hover:bg-zinc-200 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-40 shadow-lg flex items-center gap-2 active:scale-95"
            >
              {processing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Processing Pipeline...</span>
                </>
              ) : (
                <span>Run Attribution Pipeline</span>
              )}
            </button>
          </div>
        </div>

        {/* Processing Job Feedback Strip */}
        {processingJob && (
          <div className="p-4 rounded-xl border border-white/[0.12] bg-black/50 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-200">
                Pipeline status: <span className="text-cyan-400 font-bold uppercase">{processingJob.status}</span>
                {processingJob.status === "running" && ` (${(processingJob.progress * 100).toFixed(0)}%)`}
              </span>
              {processingJob.result && Object.keys(processingJob.result).length > 0 && (
                <span className="text-zinc-300 text-[11px]">
                  {Object.entries(processingJob.result).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                </span>
              )}
            </div>
            {processingJob.status === "running" && (
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-cyan-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${processingJob.progress * 100}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Tabs Navigation ───────────────────────────────────────── */}
      <div className="flex gap-2 border-b border-white/[0.12] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-xs font-mono font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "border-cyan-400 text-cyan-300 font-bold"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-2 font-mono text-[11px] text-zinc-400">
                ({tab.count})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ───────────────────────────────────────────── */}
      <div>
        {/* ── 1. Dossier Summary ──────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-5 border border-white/[0.12] bg-[#090e1b] rounded-xl text-center shadow-md">
                <div className="text-2xl font-bold text-cyan-400 tabular-nums">{observations.length}</div>
                <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold mt-1">OBSERVATIONS</div>
              </div>
              <div className="p-5 border border-white/[0.12] bg-[#090e1b] rounded-xl text-center shadow-md">
                <div className="text-2xl font-bold text-indigo-400 tabular-nums">{entities.length}</div>
                <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold mt-1">EXTRACTED ENTITIES</div>
              </div>
              <div className="p-5 border border-white/[0.12] bg-[#090e1b] rounded-xl text-center shadow-md">
                <div className="text-2xl font-bold text-amber-400 tabular-nums">{graphData?.edges.length || 0}</div>
                <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold mt-1">GRAPH EDGES</div>
              </div>
              <div className="p-5 border border-white/[0.12] bg-[#090e1b] rounded-xl text-center shadow-md">
                <div className="text-2xl font-bold text-emerald-400 tabular-nums">{hypotheses.length}</div>
                <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold mt-1">HYPOTHESES</div>
              </div>
            </div>

            {hypotheses.length > 0 && (
              <div className="p-6 border border-white/[0.12] bg-[#090e1b] rounded-2xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <h3 className="text-base font-display font-bold text-white">Synthesized Attribution Hypotheses</h3>
                  <span className="font-mono text-xs text-cyan-400 font-semibold">VERIFIED SIGNALS</span>
                </div>

                <div className="space-y-3">
                  {hypotheses.slice(0, 3).map((h) => (
                    <div key={h.id} className="p-5 rounded-xl bg-black/50 border border-white/[0.08] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-white">{h.title}</span>
                        <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                          {(h.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">{h.description}</p>
                      <div className="flex gap-4 font-mono text-xs text-zinc-300 pt-2 border-t border-white/[0.06]">
                        <span className="text-emerald-400 font-medium">{h.strong_evidence.length} strong evidence</span>
                        <span className="text-indigo-400 font-medium">{h.supporting_signals.length} supporting</span>
                        <span className="text-amber-400 font-medium">{h.contradictions.length} contradictions</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 2. Evidence Observations ────────────────────────────── */}
        {activeTab === "observations" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowObsForm(!showObsForm)}
                className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black rounded-lg text-xs font-mono font-bold uppercase transition-colors"
              >
                {showObsForm ? "Close Input Form" : "+ Ingest Observation"}
              </button>
              <button
                onClick={handleLoadSynthetic}
                className="px-4 py-2.5 border border-white/[0.14] bg-[#090e1b] text-zinc-200 hover:text-white hover:bg-zinc-800 rounded-lg text-xs font-mono transition-colors"
              >
                Load Synthetic Dataset
              </button>
            </div>

            {showObsForm && (
              <form onSubmit={handleAddObservation} className="p-6 border border-white/[0.14] bg-[#090e1b] rounded-2xl space-y-4 shadow-xl">
                <h3 className="text-base font-display font-bold text-white">Ingest Raw Threat Observation</h3>
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1.5 font-medium">RAW EVIDENCE / FORUM POST TEXT</label>
                  <textarea
                    value={obsContent}
                    onChange={(e) => setObsContent(e.target.value)}
                    placeholder={"alias: ShadowX\nsource: DarkForum Alpha\ntimestamp: 2026-01-10\n\nSelling database access. Contact via PGP.\nPGP fingerprint: 8A3B 2C1D...\nPayment: 1A1zP1eP..."}
                    rows={7}
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/[0.15] rounded-xl text-white text-xs font-mono focus:border-cyan-400 focus:outline-none resize-none leading-relaxed"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                  <div>
                    <label className="block text-zinc-300 mb-1.5 font-medium">SOURCE NAME</label>
                    <input
                      type="text"
                      value={obsSource}
                      onChange={(e) => setObsSource(e.target.value)}
                      placeholder="DarkForum Alpha"
                      className="w-full px-3.5 py-2 bg-black/60 border border-white/[0.15] rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 mb-1.5 font-medium">SOURCE CATEGORY</label>
                    <select
                      value={obsSourceType}
                      onChange={(e) => setObsSourceType(e.target.value)}
                      className="w-full px-3.5 py-2 bg-black/60 border border-white/[0.15] rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="manual">Manual Entry</option>
                      <option value="forum">Dark-Web Forum</option>
                      <option value="marketplace">Underground Market</option>
                      <option value="paste">Paste Site</option>
                      <option value="intelligence">Threat Intel Feed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-300 mb-1.5 font-medium">OBSERVED TIMESTAMP</label>
                    <input
                      type="date"
                      value={obsDate}
                      onChange={(e) => setObsDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-black/60 border border-white/[0.15] rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={addingObs}
                    className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black rounded-lg text-xs font-mono font-bold uppercase transition-colors disabled:opacity-50"
                  >
                    {addingObs ? "Ingesting..." : "Ingest Observation"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowObsForm(false)}
                    className="px-4 py-2.5 text-xs font-mono text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {observations.length === 0 ? (
              <div className="p-12 text-center border border-white/[0.12] bg-[#090e1b] rounded-2xl text-zinc-400 font-mono text-xs">
                No observations currently recorded in this case dossier.
              </div>
            ) : (
              <div className="space-y-4">
                {observations.map((obs) => (
                  <div key={obs.id} className="p-5 border border-white/[0.12] bg-[#090e1b] rounded-xl space-y-3 shadow-md">
                    <div className="flex items-center justify-between font-mono text-xs text-zinc-400 pb-2 border-b border-white/[0.08]">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-semibold">{obs.source_reference || "Direct Observation"}</span>
                        <span>·</span>
                        <span>{obs.observed_at ? new Date(obs.observed_at).toISOString().split("T")[0] : "Recorded today"}</span>
                      </div>
                      <span className="text-[11px] text-zinc-400">SHA256: {obs.content_hash?.slice(0, 16) || "N/A"}</span>
                    </div>
                    <pre className="p-4 rounded-xl bg-black/60 border border-white/[0.08] text-xs text-zinc-200 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                      {obs.raw_content}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 3. Extracted Entities ───────────────────────────────── */}
        {activeTab === "entities" && (
          <div>
            {entities.length === 0 ? (
              <div className="p-12 text-center border border-white/[0.12] bg-[#090e1b] rounded-2xl text-zinc-400 font-mono text-xs">
                No entities extracted yet. Execute the attribution pipeline above.
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(
                  entities.reduce((acc, e) => {
                    acc[e.entity_type] = acc[e.entity_type] || [];
                    acc[e.entity_type].push(e);
                    return acc;
                  }, {} as Record<string, Entity[]>)
                ).map(([type, ents]) => (
                  <div key={type} className="p-5 border border-white/[0.12] bg-[#090e1b] rounded-xl space-y-3 shadow-md">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                      <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                        {type} PRIMITIVES ({ents.length})
                      </h3>
                      <span className="font-mono text-xs text-cyan-400 font-semibold">NORMALIZED</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
                      {ents.map((e) => (
                        <div key={e.id} className="p-3 rounded-lg bg-black/60 border border-white/[0.08] flex items-center justify-between">
                          <div className="truncate pr-2">
                            <span className="text-white font-medium">{e.original_value}</span>
                            {e.original_value !== e.normalized_value && (
                              <span className="text-zinc-400 text-[11px] ml-2 font-normal">→ {e.normalized_value}</span>
                            )}
                          </div>
                          <span className="text-cyan-400 font-bold tabular-nums shrink-0">{(e.confidence * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 4. Graph Topology ───────────────────────────────────── */}
        {activeTab === "graph" && (
          <div>
            {graphData && graphData.nodes.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono text-xs text-zinc-300 pb-2">
                  <span className="text-white font-bold">{graphData.nodes.length} nodes · {graphData.edges.length} edges</span>
                  <div className="flex gap-3 flex-wrap">
                    {Object.entries(ENTITY_COLORS).map(([type, color]) => (
                      <span key={type} className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  ref={graphRef}
                  className="w-full rounded-2xl border border-white/[0.14] bg-[#050811] shadow-xl"
                  style={{ height: "560px" }}
                />
              </div>
            ) : (
              <div className="p-12 text-center border border-white/[0.12] bg-[#090e1b] rounded-2xl text-zinc-400 font-mono text-xs">
                Graph topology empty. Run the attribution pipeline to generate relationship links.
              </div>
            )}
          </div>
        )}

        {/* ── 5. Attribution Hypotheses ───────────────────────────── */}
        {activeTab === "hypotheses" && (
          <div>
            {hypotheses.length === 0 ? (
              <div className="p-12 text-center border border-white/[0.12] bg-[#090e1b] rounded-2xl text-zinc-400 font-mono text-xs">
                No attribution hypotheses generated yet. Run the attribution pipeline.
              </div>
            ) : (
              <div className="space-y-5">
                {hypotheses.map((h) => (
                  <div key={h.id} className="p-6 border border-white/[0.14] bg-[#090e1b] rounded-2xl space-y-5 shadow-xl">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-white/[0.08]">
                      <div>
                        <div className="font-mono text-xs text-cyan-400 font-semibold uppercase mb-1">CANDIDATE ACTOR LINK</div>
                        <h3 className="text-xl font-display font-bold text-white">{h.title}</h3>
                        <p className="text-xs text-zinc-300 mt-1 leading-relaxed max-w-2xl font-sans">{h.description}</p>
                      </div>
                      <div className="font-mono text-right shrink-0">
                        <div className="text-3xl font-bold text-emerald-400 tabular-nums">
                          {(h.confidence * 100).toFixed(0)}%
                        </div>
                        <div className="text-[11px] text-zinc-400 uppercase font-semibold">
                          {h.confidence_level} confidence
                        </div>
                      </div>
                    </div>

                    {/* Entities Involved */}
                    <div>
                      <div className="text-[11px] font-mono text-zinc-400 uppercase font-semibold mb-2">Entities Involved</div>
                      <div className="flex flex-wrap gap-2">
                        {h.entities_involved.map((e, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-md bg-black/60 border border-white/[0.12] font-mono text-xs text-white"
                          >
                            <span className="text-cyan-400 mr-1.5 font-semibold">{e.type}:</span>
                            {e.value}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Evidence Triad */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                      {/* Strong Evidence */}
                      <div className="p-4 rounded-xl bg-black/50 border border-emerald-500/30 space-y-2">
                        <div className="text-emerald-400 text-xs font-bold uppercase">
                          Strong Evidence ({h.strong_evidence.length})
                        </div>
                        <div className="space-y-1.5 text-zinc-200">
                          {h.strong_evidence.map((e, i) => (
                            <div key={i} className="text-xs leading-relaxed">{e.description}</div>
                          ))}
                          {h.strong_evidence.length === 0 && <div className="text-zinc-500">None identified</div>}
                        </div>
                      </div>

                      {/* Supporting Signals */}
                      <div className="p-4 rounded-xl bg-black/50 border border-indigo-500/30 space-y-2">
                        <div className="text-indigo-400 text-xs font-bold uppercase">
                          Supporting Signals ({h.supporting_signals.length})
                        </div>
                        <div className="space-y-1.5 text-zinc-200">
                          {h.supporting_signals.map((s, i) => (
                            <div key={i} className="text-xs leading-relaxed">{s.description}</div>
                          ))}
                          {h.supporting_signals.length === 0 && <div className="text-zinc-500">None identified</div>}
                        </div>
                      </div>

                      {/* Contradictions */}
                      <div className="p-4 rounded-xl bg-black/50 border border-rose-500/30 space-y-2">
                        <div className="text-rose-400 text-xs font-bold uppercase">
                          Contradictions ({h.contradictions.length})
                        </div>
                        <div className="space-y-1.5 text-zinc-200">
                          {h.contradictions.map((c, i) => (
                            <div key={i} className="text-xs leading-relaxed">
                              <span className="text-rose-400 font-bold">[{c.severity}]</span> {c.description}
                            </div>
                          ))}
                          {h.contradictions.length === 0 && <div className="text-zinc-500">0 conflicting signals</div>}
                        </div>
                      </div>
                    </div>

                    {/* Analyst Review Footer */}
                    <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] uppercase px-2.5 py-0.5 rounded-md border border-white/[0.15] bg-black/60 text-zinc-200 font-medium">
                          {h.status.replace("_", " ")}
                        </span>
                      </div>

                      {h.status === "generated" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReview(h.id, "accepted")}
                            className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-mono font-medium hover:bg-emerald-500/30 transition-colors"
                          >
                            Accept Attribution
                          </button>
                          <button
                            onClick={() => handleReview(h.id, "rejected")}
                            className="px-3.5 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-mono font-medium hover:bg-rose-500/30 transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleReview(h.id, "needs_more_evidence")}
                            className="px-3.5 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-mono font-medium hover:bg-amber-500/30 transition-colors"
                          >
                            Request Evidence
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
