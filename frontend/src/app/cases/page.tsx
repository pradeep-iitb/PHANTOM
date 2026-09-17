"use client";

import { useEffect, useState } from "react";
import { api, type Case } from "@/lib/api";

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const loadCases = () => {
    api.listCases()
      .then(setCases)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCases(); }, []);

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
    } catch (err) {
      alert("Failed to create case");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Investigation Cases</h1>
          <p className="text-sm text-[#64748b] mt-1">Manage and investigate threat actor attribution cases</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
        >
          + New Case
        </button>
      </div>

      {/* Create Case Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="glass rounded-xl p-6 animate-fade-in space-y-4">
          <h2 className="text-white font-semibold">Create New Investigation Case</h2>
          <div>
            <label className="block text-sm text-[#94a3b8] mb-1">Case Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., ShadowX Investigation"
              className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e2d3d] rounded-lg text-white text-sm focus:border-[#00f0ff] focus:outline-none focus:ring-1 focus:ring-[#00f0ff30] transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[#94a3b8] mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the investigation scope..."
              rows={3}
              className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e2d3d] rounded-lg text-white text-sm focus:border-[#00f0ff] focus:outline-none focus:ring-1 focus:ring-[#00f0ff30] transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Case"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 glass rounded-lg text-sm text-[#94a3b8] hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Cases List */}
      {loading ? (
        <div className="text-center py-12 text-[#64748b]">
          <div className="animate-spin w-8 h-8 border-2 border-[#1e2d3d] border-t-[#00f0ff] rounded-full mx-auto mb-3" />
          Loading cases...
        </div>
      ) : cases.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-white font-semibold mb-2">No Cases Yet</h3>
          <p className="text-sm text-[#64748b] mb-4">Create your first investigation case to get started.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg text-sm font-medium"
          >
            + Create First Case
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cases.map((c) => (
            <a
              key={c.id}
              href={`/cases/${c.id}`}
              className="glass glass-hover rounded-2xl p-7 block animate-fade-in group border border-[#1e2d3d]/80 hover:border-cyan-500/40 transition-all shadow-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-white font-bold text-lg group-hover:text-[#00f0ff] transition-colors">
                  {c.title}
                </h3>
                <span className={`status-${c.status} text-xs px-3 py-1 rounded-full font-semibold capitalize`}>
                  {c.status.replace("_", " ")}
                </span>
              </div>
              {c.description && (
                <p className="text-sm text-[#94a3b8] mb-5 line-clamp-2 leading-relaxed">{c.description}</p>
              )}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#070a10] rounded-xl p-3 text-center border border-[#1e2d3d]/50">
                  <div className="text-xl font-bold text-[#00f0ff]">{c.observation_count}</div>
                  <div className="text-[11px] text-[#64748b] uppercase tracking-wider font-semibold">Observations</div>
                </div>
                <div className="bg-[#070a10] rounded-xl p-3 text-center border border-[#1e2d3d]/50">
                  <div className="text-xl font-bold text-[#a855f7]">{c.entity_count}</div>
                  <div className="text-[11px] text-[#64748b] uppercase tracking-wider font-semibold">Entities</div>
                </div>
                <div className="bg-[#070a10] rounded-xl p-3 text-center border border-[#1e2d3d]/50">
                  <div className="text-xl font-bold text-[#f59e0b]">{c.hypothesis_count}</div>
                  <div className="text-[11px] text-[#64748b] uppercase tracking-wider font-semibold">Hypotheses</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-[#64748b] flex items-center justify-between border-t border-[#1e2d3d]/60 pt-3">
                <span>Created {new Date(c.created_at).toLocaleDateString()}</span>
                <span className="text-[#00f0ff] font-medium group-hover:translate-x-1 transition-transform">Inspect dossier →</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
