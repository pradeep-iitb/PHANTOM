"use client";

import { useEffect, useState, useMemo } from "react";
import { api, type Case } from "@/lib/api";

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadCases = () => {
    api.listCases()
      .then(setCases)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCases();
    if (typeof window !== "undefined" && window.location.hash === "#new") {
      setShowCreate(true);
    }
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      await api.createCase({ title: title.trim(), description: description.trim() });
      setTitle("");
      setDescription("");
      setShowCreate(false);
      loadCases();
    } catch {
      alert("Failed to initialize case dossier. Ensure backend is running.");
    } finally {
      setCreating(false);
    }
  };

  // Filter cases based on search and status
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [cases, searchQuery, statusFilter]);

  // Totals for top telemetry
  const totalObs = cases.reduce((acc, c) => acc + (c.observation_count || 0), 0);
  const totalEntities = cases.reduce((acc, c) => acc + (c.entity_count || 0), 0);
  const totalHypotheses = cases.reduce((acc, c) => acc + (c.hypothesis_count || 0), 0);

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      {/* ── Page Header & Controls ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.14]">
        <div>
          <div className="font-mono text-xs text-cyan-400 font-semibold mb-1.5 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            DOSSIER REGISTRY
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight">
            Threat Intelligence Dossiers
          </h1>
          <p className="text-sm text-zinc-300 mt-1 max-w-2xl font-sans">
            Manage, cross-reference, and inspect multi-vector dark-web evidence portfolios and de-anonymization hypotheses.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-5 py-2.5 bg-white text-black hover:bg-zinc-200 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-[0_4px_20px_rgba(255,255,255,0.18)] self-start md:self-auto hover:scale-105 active:scale-95"
        >
          {showCreate ? "Close Case Form" : "+ New Threat Dossier"}
        </button>
      </div>

      {/* ── Top Telemetry Metrics ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-[#090e1b] border border-white/[0.10]">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider">TOTAL DOSSIERS</div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1 tabular-nums">{cases.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#090e1b] border border-white/[0.10]">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider">EVIDENCE SEEDS</div>
          <div className="text-xl sm:text-2xl font-bold text-cyan-400 mt-1 tabular-nums">{totalObs}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#090e1b] border border-white/[0.10]">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider">EXTRACTED ENTITIES</div>
          <div className="text-xl sm:text-2xl font-bold text-indigo-400 mt-1 tabular-nums">{totalEntities}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#090e1b] border border-white/[0.10]">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider">ATTRIBUTED HYPOTHESES</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1 tabular-nums">{totalHypotheses}</div>
        </div>
      </div>

      {/* ── Create Case Modal Drawer ───────────────────────────────── */}
      {showCreate && (
        <form id="new" onSubmit={handleCreate} className="p-6 border border-white/[0.16] bg-[#090e1b] rounded-2xl space-y-4 shadow-2xl scroll-mt-28">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.10]">
            <div>
              <h2 className="text-white font-display font-bold text-base">Initialize Threat Case Dossier</h2>
              <p className="text-xs text-zinc-400">Assign initial scope and tracking parameters</p>
            </div>
            <span className="font-mono text-xs text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/40">
              NEW DOSSIER
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1.5 font-medium">CASE TITLE</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Operation DarkLocker Breach Attribution"
              className="w-full px-4 py-2.5 bg-black/60 border border-white/[0.15] rounded-xl text-white text-sm focus:border-cyan-400 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1.5 font-medium">BRIEFING &amp; SCOPE NOTES</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Record target forum handles, crypto addresses, and suspected infrastructure..."
              rows={3}
              className="w-full px-4 py-2.5 bg-black/60 border border-white/[0.15] rounded-xl text-white text-sm focus:border-cyan-400 focus:outline-none transition-colors resize-none font-sans"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black rounded-lg text-xs font-mono font-bold uppercase transition-colors disabled:opacity-50"
            >
              {creating ? "Initializing..." : "Create Dossier"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2.5 rounded-lg border border-white/[0.14] bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Search & Filter Controls ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 bg-[#090e1b] rounded-xl border border-white/[0.10]">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dossiers by title, reference ID, or target handle..."
            className="w-full pl-9 pr-4 py-2 bg-transparent text-white placeholder-zinc-400 text-xs font-mono focus:outline-none"
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-1 border-t sm:border-t-0 sm:border-l border-white/[0.10] pt-2 sm:pt-0 sm:pl-3 text-xs font-mono">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1 rounded-lg transition-colors ${statusFilter === "all" ? "bg-white/10 text-white font-semibold" : "text-zinc-400 hover:text-white"}`}
          >
            All ({cases.length})
          </button>
          <button
            onClick={() => setStatusFilter("in_progress")}
            className={`px-3 py-1 rounded-lg transition-colors ${statusFilter === "in_progress" ? "bg-amber-500/20 text-amber-300 font-semibold" : "text-zinc-400 hover:text-white"}`}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatusFilter("open")}
            className={`px-3 py-1 rounded-lg transition-colors ${statusFilter === "open" ? "bg-cyan-500/20 text-cyan-300 font-semibold" : "text-zinc-400 hover:text-white"}`}
          >
            Open
          </button>
        </div>
      </div>

      {/* ── Dossier Grid View ──────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-20 border border-white/[0.10] rounded-2xl bg-[#090e1b] text-zinc-400 font-mono text-xs">
          Scanning case database...
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="border border-white/[0.14] rounded-2xl bg-[#090e1b] p-16 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 mx-auto rounded-xl bg-black border border-white/[0.14] flex items-center justify-center text-cyan-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-display font-bold text-lg">No Matching Threat Dossiers</h3>
            <p className="text-xs text-zinc-300 mt-1 max-w-md mx-auto font-sans">
              No cases matched your search query or filter. Initialize a new case or clear filters to view recorded intelligence.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black rounded-lg text-xs font-mono font-bold uppercase transition-colors"
          >
            + Initialize New Dossier
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((c) => (
            <a
              key={c.id}
              href={`/cases/${c.id}`}
              className="p-6 border border-white/[0.12] hover:border-cyan-400/50 bg-[#090e1b] hover:bg-[#0e1529] rounded-2xl transition-all flex flex-col justify-between group shadow-xl hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between mb-3 font-mono text-xs">
                  <span className="text-cyan-400 font-semibold group-hover:text-cyan-300">
                    REF: {c.id.slice(0, 10)}
                  </span>
                  <span className="font-mono text-[10px] uppercase px-2.5 py-0.5 rounded-md border border-white/[0.15] bg-black/60 text-zinc-200 font-medium">
                    {c.status.replace("_", " ")}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-display font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {c.title}
                </h3>
                {c.description && (
                  <p className="text-xs text-zinc-300 mb-5 line-clamp-2 leading-relaxed font-sans">
                    {c.description}
                  </p>
                )}
              </div>

              <div>
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/[0.08] text-center font-mono">
                  <div className="p-2.5 bg-black/50 rounded-xl border border-white/[0.08]">
                    <div className="text-base font-bold text-cyan-400 tabular-nums">{c.observation_count}</div>
                    <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">OBS</div>
                  </div>
                  <div className="p-2.5 bg-black/50 rounded-xl border border-white/[0.08]">
                    <div className="text-base font-bold text-indigo-400 tabular-nums">{c.entity_count}</div>
                    <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">ENTITIES</div>
                  </div>
                  <div className="p-2.5 bg-black/50 rounded-xl border border-white/[0.08]">
                    <div className="text-base font-bold text-emerald-400 tabular-nums">{c.hypothesis_count}</div>
                    <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">HYPOTHESES</div>
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-white/[0.08] flex items-center justify-between font-mono text-xs text-zinc-400">
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  <span className="text-cyan-400 group-hover:translate-x-1 transition-transform font-medium flex items-center gap-1">
                    <span>Inspect dossier</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
