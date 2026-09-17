"use client";

import { useEffect, useState } from "react";
import { api, type Case } from "@/lib/api";

export default function HomePage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.listCases()
      .then(setCases)
      .catch(() => setError("Backend not connected. Start Docker and backend server."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero */}
      <section className="text-center py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent rounded-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1e2d3d] bg-[#111827]/50 text-xs text-[#64748b] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            Smart India Hackathon 2026 · SIH26151
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-[#00f0ff] via-[#a855f7] to-[#00f0ff] bg-clip-text text-transparent">
              PHANTOM
            </span>
          </h1>
          <p className="text-xl text-[#94a3b8] max-w-2xl mx-auto mb-2">
            Evidence-Driven Threat Actor Attribution
          </p>
          <p className="text-sm text-[#64748b] max-w-xl mx-auto">
            Correlate fragmented digital observations across underground ecosystems
            into explainable, evidence-backed attribution hypotheses.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="/cases"
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium text-sm hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
            >
              Open Investigation Dashboard
            </a>
            <a
              href="/cases/new"
              className="px-6 py-2.5 glass glass-hover rounded-lg font-medium text-sm text-[#94a3b8] hover:text-white transition-all"
            >
              Create New Case
            </a>
          </div>
        </div>
      </section>

      {/* Core Philosophy */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: "🔗",
            title: "Multi-Signal Correlation",
            desc: "Correlate aliases, wallets, PGP keys, infrastructure, behavior, and temporal patterns — not just single indicators.",
            color: "from-cyan-500/10 to-cyan-500/0",
          },
          {
            icon: "🔍",
            title: "Explainable Evidence",
            desc: "Every relationship traces back to specific evidence. Strong evidence, supporting signals, and contradictions — all visible.",
            color: "from-purple-500/10 to-purple-500/0",
          },
          {
            icon: "👤",
            title: "Human-in-the-Loop",
            desc: "AI and analytics assist — investigators decide. Accept, reject, annotate, or keep hypotheses unresolved.",
            color: "from-amber-500/10 to-amber-500/0",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className={`glass glass-hover rounded-xl p-6 bg-gradient-to-br ${feature.color} animate-fade-in`}
          >
            <div className="text-2xl mb-3">{feature.icon}</div>
            <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-[#94a3b8]">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Pipeline Flow */}
      <section className="glass rounded-xl p-8">
        <h2 className="text-lg font-semibold text-white mb-6">Attribution Pipeline</h2>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
          {[
            "Observations",
            "→",
            "Extraction",
            "→",
            "Normalization",
            "→",
            "Evidence Store",
            "→",
            "Graph",
            "→",
            "Correlation",
            "→",
            "Fusion",
            "→",
            "Contradictions",
            "→",
            "Hypothesis",
            "→",
            "Review",
          ].map((step, i) =>
            step === "→" ? (
              <span key={i} className="text-[#00f0ff]">→</span>
            ) : (
              <span
                key={i}
                className="px-3 py-1.5 rounded-md bg-[#1a2332] border border-[#1e2d3d] text-[#94a3b8] hover:text-[#00f0ff] hover:border-[#00f0ff30] transition-colors cursor-default"
              >
                {step}
              </span>
            )
          )}
        </div>
      </section>

      {/* Recent Cases */}
      {!loading && !error && cases.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Cases</h2>
            <a href="/cases" className="text-sm text-[#00f0ff] hover:underline">
              View all →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cases.slice(0, 4).map((c) => (
              <a
                key={c.id}
                href={`/cases/${c.id}`}
                className="glass glass-hover rounded-xl p-5 block animate-fade-in"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-medium">{c.title}</h3>
                  <span className={`status-${c.status} text-xs px-2 py-0.5 rounded-full`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-sm text-[#64748b] mb-3 line-clamp-2">{c.description}</p>
                <div className="flex gap-4 text-xs text-[#64748b]">
                  <span>{c.observation_count} observations</span>
                  <span>{c.entity_count} entities</span>
                  <span>{c.hypothesis_count} hypotheses</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Status */}
      {error && (
        <div className="glass rounded-xl p-6 border-l-4 border-amber-500">
          <p className="text-amber-400 text-sm font-medium">⚠ {error}</p>
          <p className="text-xs text-[#64748b] mt-2">
            Run <code className="font-mono bg-[#1a2332] px-1.5 py-0.5 rounded">docker compose up -d</code> then{" "}
            <code className="font-mono bg-[#1a2332] px-1.5 py-0.5 rounded">cd backend &amp;&amp; uvicorn app.main:app --reload</code>
          </p>
        </div>
      )}

      {/* Tech Stack */}
      <section className="glass rounded-xl p-6">
        <h2 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-4">Technology Stack</h2>
        <div className="flex flex-wrap gap-2">
          {["Next.js", "TypeScript", "Tailwind CSS", "Cytoscape.js", "FastAPI", "Python", "PostgreSQL", "Neo4j", "Docker"].map((tech) => (
            <span key={tech} className="px-3 py-1 rounded-full text-xs font-mono bg-[#1a2332] border border-[#1e2d3d] text-[#94a3b8]">
              {tech}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
