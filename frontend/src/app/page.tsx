"use client";

import { useEffect, useState } from "react";
import { api, type Case } from "@/lib/api";
import AeroShards from "@/components/AeroShards";

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
    <div className="space-y-16 animate-fade-in w-full pb-12">
      {/* Immersive Full-Size Hero Section */}
      <section className="relative w-full min-h-[75vh] lg:min-h-[82vh] rounded-3xl overflow-hidden border border-[#1e2d3d]/80 shadow-2xl flex flex-col items-center justify-center text-center p-8 sm:p-12 lg:p-20 bg-[#070a10]">
        {/* Dynamic Interactive Background */}
        <div className="absolute inset-0 h-full w-full z-0">
          <AeroShards
            backgroundColor="#070a10"
            shardColor="#00f0ff"
            accentColor="#a855f7"
            placement="full"
            flow="stream"
            material="pearl"
            detail="balanced"
            effect="none"
            scale={1.05}
            spread={1.1}
            depth={1.1}
            speed={0.9}
            spin={1}
            interaction="repel"
            density={1.4}
            shardSize={1.1}
            stretch={1.1}
            turbulence={1.1}
            glow={1.3}
            edgeSoftness={2}
            bloom={0.65}
            grain={0.03}
            chromaticAberration={0.006}
            transitionDuration={1}
            interactionRadius={1.6}
            interactionStrength={0.6}
            rippleIntensity={1.2}
            holdToGather={true}
          />
        </div>

        {/* Ambient Gradient Masks */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070a10] via-[#070a10]/50 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#070a10]/30 to-[#070a10]/90 pointer-events-none z-10" />

        {/* Foreground Content */}
        <div className="relative z-20 max-w-5xl mx-auto flex flex-col items-center">
          {/* Hackathon Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-[#111827]/80 backdrop-blur-md text-xs sm:text-sm text-[#94a3b8] mb-6 shadow-lg shadow-cyan-500/10">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="font-semibold text-white">Smart India Hackathon 2026</span>
            <span className="text-[#64748b]">·</span>
            <span className="font-mono text-[#00f0ff]">SIH26151 — Dark-Web De-anonymization</span>
          </div>

          {/* Main Title */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight mb-6">
            <span className="bg-gradient-to-r from-[#00f0ff] via-[#c084fc] to-[#00f0ff] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(0,240,255,0.3)]">
              PHANTOM
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-2xl sm:text-3xl font-medium text-[#e2e8f0] max-w-3xl mx-auto mb-4 tracking-tight">
            Evidence-Driven Threat Actor Attribution Platform
          </p>
          <p className="text-base sm:text-lg text-[#94a3b8] max-w-2xl mx-auto mb-10 leading-relaxed">
            Correlate fragmented dark-web traces, aliases, crypto wallets, and temporal signals into transparent, explainable attribution hypotheses.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-5 w-full">
            <a
              href="/cases"
              className="px-8 py-3.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-size-200 text-white rounded-xl font-semibold text-base hover:shadow-cyan-500/30 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-xl shadow-cyan-500/20 border border-cyan-400/30"
            >
              Open Investigation Dashboard →
            </a>
            <a
              href="/cases/new"
              className="px-8 py-3.5 glass glass-hover rounded-xl font-semibold text-base text-[#e2e8f0] hover:text-white hover:border-[#00f0ff]/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-[#1e2d3d] shadow-lg"
            >
              + Create New Case
            </a>
          </div>
        </div>
      </section>

      {/* Core Philosophy Features */}
      <section className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              icon: "🔗",
              title: "Multi-Signal Correlation",
              desc: "Correlates aliases, cryptocurrency wallets, PGP fingerprints, infrastructure, stylometry, and temporal activity patterns across platforms.",
              gradient: "from-cyan-500/15 via-cyan-500/5 to-transparent",
              border: "border-cyan-500/30",
              badge: "Graph + PIF",
            },
            {
              icon: "🔍",
              title: "Explainable Evidence",
              desc: "Every relationship traces back to specific evidence observations. Strong evidence, supporting signals, and contradictions are visibly audited.",
              gradient: "from-purple-500/15 via-purple-500/5 to-transparent",
              border: "border-purple-500/30",
              badge: "Provenance",
            },
            {
              icon: "👤",
              title: "Human-in-the-Loop",
              desc: "AI assists, investigators decide. Hypotheses can be accepted, rejected, annotated, or flagged for further corroborating intelligence.",
              gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent",
              border: "border-emerald-500/30",
              badge: "Analyst Review",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className={`glass glass-hover rounded-2xl p-8 bg-gradient-to-br ${feature.gradient} border ${feature.border} relative overflow-hidden group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl p-2.5 rounded-xl bg-[#0a0e17]/80 border border-[#1e2d3d] w-fit">
                  {feature.icon}
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[#111827] border border-[#1e2d3d] text-[#94a3b8]">
                  {feature.badge}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-[#00f0ff] transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Attribution Pipeline Flow */}
      <section className="glass rounded-2xl p-8 sm:p-10 border border-[#1e2d3d]/80 w-full shadow-xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1e2d3d]">
          <div>
            <h2 className="text-xl font-bold text-white">Attribution Pipeline Architecture</h2>
            <p className="text-sm text-[#64748b] mt-1">
              End-to-end evidence normalization, graph linkage, signal scoring, and hypothesis generation
            </p>
          </div>
          <span className="hidden sm:inline-flex text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/20">
            Autonomous + Human Review
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-sm py-2">
          {[
            { label: "Observations", icon: "📄" },
            { label: "Extraction", icon: "⚙️" },
            { label: "Normalization", icon: "📏" },
            { label: "Evidence Store", icon: "🗄️" },
            { label: "Neo4j Graph", icon: "🕸️" },
            { label: "Signal Scoring", icon: "📊" },
            { label: "Contradiction Check", icon: "⚠️" },
            { label: "Hypothesis Builder", icon: "💡" },
            { label: "Analyst Review", icon: "🛡️" },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-[#0f172a] border border-[#1e2d3d] text-[#e2e8f0] hover:text-[#00f0ff] hover:border-cyan-500/40 hover:bg-[#131d35] transition-all flex items-center gap-2 shadow-sm cursor-default">
                <span>{step.icon}</span>
                <span className="font-semibold">{step.label}</span>
              </div>
              {i < arr.length - 1 && (
                <span className="text-[#00f0ff] text-base font-bold animate-pulse">→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Recent Cases */}
      {!loading && !error && cases.length > 0 && (
        <section className="w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Active Investigation Cases</h2>
              <p className="text-sm text-[#64748b] mt-1">Review active dossiers and evidence graphs</p>
            </div>
            <a href="/cases" className="text-sm font-semibold text-[#00f0ff] hover:underline flex items-center gap-1.5">
              View all cases ({cases.length}) →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {cases.slice(0, 4).map((c) => (
              <a
                key={c.id}
                href={`/cases/${c.id}`}
                className="glass glass-hover rounded-2xl p-7 block animate-fade-in group border border-[#1e2d3d]/80 hover:border-cyan-500/40 transition-all shadow-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#00f0ff] transition-colors">
                    {c.title}
                  </h3>
                  <span className={`status-${c.status} text-xs px-3 py-1 rounded-full font-semibold capitalize`}>
                    {c.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-[#94a3b8] mb-5 line-clamp-2 leading-relaxed">
                  {c.description || "No description provided."}
                </p>
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
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Backend Status Notice */}
      {error && (
        <div className="glass rounded-2xl p-6 border-l-4 border-amber-500 bg-amber-500/5">
          <p className="text-amber-400 font-semibold text-base">⚠ {error}</p>
          <p className="text-sm text-[#94a3b8] mt-2">
            Start the container services and backend with:
            <code className="font-mono bg-[#111827] text-cyan-400 px-2 py-1 rounded ml-2 border border-[#1e2d3d]">
              docker compose up -d
            </code>
          </p>
        </div>
      )}

      {/* Technology Stack Footer Grid */}
      <section className="glass rounded-2xl p-8 border border-[#1e2d3d]/60">
        <h2 className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-4">
          Core Technologies &amp; Architecture Stack
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {[
            "Next.js 16",
            "React 19",
            "TypeScript",
            "Tailwind CSS",
            "Cytoscape.js",
            "FastAPI",
            "Python 3.11+",
            "PostgreSQL 16",
            "Neo4j 5 (APOC)",
            "Redis 7",
            "Docker Compose",
            "WebGPU / Shaders",
          ].map((tech) => (
            <span
              key={tech}
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-[#0f172a] border border-[#1e2d3d] text-[#94a3b8] hover:text-[#00f0ff] hover:border-cyan-500/30 transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
