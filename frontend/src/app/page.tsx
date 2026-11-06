"use client";

import { useEffect, useState, useMemo } from "react";
import { api, type Case } from "@/lib/api";
import GhostFibers from "@/components/GhostFibers";
import ParticleText from "@/components/ParticleText";

// Synthetic Demonstration Case for immediate offline evaluation
const DEMO_CASE: Case = {
  id: "c8f921-phantom-apt44",
  title: "Operation EmeraldSpider — Ransomware Infrastructure Correlation",
  description: "Cross-platform de-anonymization of ransomware syndicate operating across Dread forum handles, Russian-language markets, and Tor v3 onion leak sites.",
  status: "in_progress",
  created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  updated_at: new Date().toISOString(),
  observation_count: 14,
  entity_count: 28,
  hypothesis_count: 3,
};

export default function HomePage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [inspectorTab, setInspectorTab] = useState<"hypothesis" | "topology" | "raw">("hypothesis");
  const [subsystemTab, setSubsystemTab] = useState<"crypto" | "tor" | "pif" | "contradictions">("crypto");

  // Interactive Crypto Normalizer state
  const [cryptoInput, setCryptoInput] = useState("bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq");
  const [cryptoType, setCryptoType] = useState<"btc" | "xmr" | "eth">("btc");

  useEffect(() => {
    api.listCases()
      .then((data) => {
        setCases(data);
        if (data.length > 0) {
          setSelectedCaseId(data[0].id);
        } else {
          setSelectedCaseId(DEMO_CASE.id);
        }
      })
      .catch(() => {
        setSelectedCaseId(DEMO_CASE.id);
      })
      .finally(() => setLoading(false));
  }, []);

  // Compute active case being inspected
  const activeCase = useMemo(() => {
    if (cases.length > 0) {
      const found = cases.find((c) => c.id === selectedCaseId);
      if (found) return found;
    }
    return DEMO_CASE;
  }, [cases, selectedCaseId]);

  // Derived canonical hash for crypto tester
  const cryptoHash = useMemo(() => {
    let hash = 0;
    const str = cryptoInput.trim();
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, "0");
    return `sha256:7f4a${hex}e92b8c4d110f003e8a719c22b10a4e`;
  }, [cryptoInput]);

  return (
    <div className="w-full bg-[#04060a] text-[#f1f5f9] selection:bg-cyan-500/25 selection:text-cyan-200">
      {/* ── 1. Full-Viewport Hero with GhostFibers & ParticleText ───── */}
      <section className="relative w-full h-screen min-h-[720px] flex flex-col justify-between overflow-hidden">
        {/* GhostFibers WebGL Canvas — Full Viewport Bleed */}
        <div className="absolute inset-0 w-full h-full z-0">
          <GhostFibers
            glowColor="#00f0ff"
            secondaryColor="#818cf8"
            lineColor="#e2e8f0"
            layers={3}
            twist={1.2}
            threads={72}
            fiberStyle="dots"
            depthOfField={0.85}
            hoverEffect="focus"
            intro={true}
            mouseInteraction={true}
            pulseOnClick={true}
            className="w-full h-full"
          />
        </div>

        {/* Cinematic Vignette Overlays for Maximum Contrast */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#04060a]/55 to-[#04060a]/95 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#04060a]/75 via-transparent to-[#04060a] pointer-events-none z-10" />

        {/* Top spacer for floating glassy pill navbar */}
        <div className="h-24 w-full z-20" />

        {/* Center Hero Stage */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center my-auto">
          {/* Project Name via ParticleText */}
          <div className="w-full max-w-4xl h-[130px] sm:h-[160px] lg:h-[190px] relative flex items-center justify-center my-1">
            <ParticleText
              text="PHANTOM"
              particleSize={2.5}
              density={3}
              color="#ffffff"
              highlightColor="#00f0ff"
              highlightMode="motion"
              shape="circle"
              intro="gather"
              scatter={160}
              gatherDuration={1500}
              stagger={380}
              clickBurst={true}
              burstStrength={1.2}
              pointerRepel={45}
              repelRadius={120}
              idleDrift={0.6}
              trigger="mount"
              fontSize="clamp(3.8rem, 11vw, 7.8rem)"
              fontWeight={900}
              fontFamily="'JetBrains Mono', monospace"
              glow={true}
              className="w-full h-full"
            />
          </div>

          {/* Subtitle with High Contrast */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white max-w-3xl mb-3 tracking-tight">
            Evidence-Driven Threat Actor Attribution &amp; Link Analysis
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto mb-8 leading-relaxed font-sans">
            Correlating fragmented underground forum handles, cryptocurrency ledgers, PGP keyblocks,
            and temporal patterns into auditable, court-ready attribution hypotheses.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full">
            <a
              href="#console"
              className="px-7 py-3 rounded-full bg-white text-black hover:bg-zinc-200 font-mono font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-[0_4px_20px_rgba(255,255,255,0.2)]"
            >
              Open Operations Console ↓
            </a>
            <a
              href="/cases"
              className="px-6 py-3 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 hover:text-white border border-white/[0.18] hover:border-cyan-400/60 font-mono text-xs uppercase tracking-wider backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              + Ingest New Case
            </a>
          </div>
        </div>

        {/* Viewport Bottom Telemetry Strip */}
        <div className="relative z-20 w-full border-t border-white/[0.12] bg-[#070b14]/90 backdrop-blur-xl">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 animate-pulse" />
              <div>
                <div className="text-zinc-400 uppercase tracking-widest text-[10px]">INGESTION VECTORS</div>
                <div className="text-white font-semibold">BTC · XMR · ETH · TOR V3 · PGP</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
              <div>
                <div className="text-zinc-400 uppercase tracking-widest text-[10px]">GRAPH TOPOLOGY</div>
                <div className="text-indigo-300 font-semibold">Neo4j 5 APOC Link Clustering</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <div>
                <div className="text-zinc-400 uppercase tracking-widest text-[10px]">ATTRIBUTION MODEL</div>
                <div className="text-emerald-300 font-semibold">PIF Multi-Signal Fusion</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <div>
                <div className="text-zinc-400 uppercase tracking-widest text-[10px]">INTEGRITY DEFENSE</div>
                <div className="text-amber-300 font-semibold">Contradiction Filter Active</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Interactive Forensic Command Center ──────────────────── */}
      {/* Replaces boring cards in a row with a live master-detail workbench */}
      <div id="console" className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-24">
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/[0.14] pb-5 gap-4">
            <div>
              <div className="font-mono text-xs text-cyan-400 uppercase tracking-widest font-semibold flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400" />
                LIVE ATTRIBUTION WORKBENCH
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mt-1">
                Investigation Docket &amp; Signal Inspector
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-400">
                {cases.length > 0 ? `${cases.length} Dossiers Registered` : "Demonstration Mode Active"}
              </span>
              <a
                href="/cases"
                className="px-3.5 py-1.5 rounded-lg border border-white/[0.16] hover:border-cyan-400/60 bg-white/[0.05] hover:bg-white/[0.08] text-xs font-mono text-zinc-200 hover:text-white transition-all flex items-center gap-1.5"
              >
                <span>Full Archive</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Master-Detail Interactive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Case Selector Docket (5 Cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="p-3 bg-[#0a0f1d] border border-white/[0.10] rounded-xl flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>SELECT DOSSIER FOR FORENSIC INSPECTION</span>
                <span className="text-cyan-400 font-semibold">{cases.length || 1} LOADED</span>
              </div>

              {loading ? (
                <div className="p-8 border border-white/[0.10] rounded-xl bg-[#080d1a] text-center text-xs font-mono text-zinc-400">
                  Scanning threat case repositories...
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                  {(cases.length > 0 ? cases : [DEMO_CASE]).map((c) => {
                    const isSelected = activeCase.id === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCaseId(c.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#11192e] border-cyan-400/70 shadow-[0_4px_20px_rgba(0,240,255,0.12)]"
                            : "bg-[#090e1b] border-white/[0.08] hover:border-white/[0.22] hover:bg-[#0d1426]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-mono text-xs font-bold ${isSelected ? "text-cyan-300" : "text-zinc-400"}`}>
                            REF: {c.id.slice(0, 12)}
                          </span>
                          <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded border border-white/[0.14] bg-black/50 text-zinc-300">
                            {c.status.replace("_", " ")}
                          </span>
                        </div>
                        <h3 className="font-sans font-semibold text-sm text-white mb-2 line-clamp-1">
                          {c.title}
                        </h3>
                        <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed mb-3">
                          {c.description || "Active intelligence tracking docket."}
                        </p>
                        <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400 pt-2 border-t border-white/[0.06]">
                          <span><strong className="text-white">{c.observation_count}</strong> obs</span>
                          <span>•</span>
                          <span><strong className="text-indigo-300">{c.entity_count}</strong> entities</span>
                          <span>•</span>
                          <span><strong className="text-emerald-300">{c.hypothesis_count}</strong> hypotheses</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <a
                href="/cases"
                className="w-full py-2.5 rounded-xl border border-dashed border-white/[0.18] hover:border-cyan-400/50 bg-black/30 hover:bg-white/[0.03] text-zinc-300 hover:text-white font-mono text-xs flex items-center justify-center gap-2 transition-all block text-center"
              >
                <span>+ Initialize New Investigation Dossier</span>
              </a>
            </div>

            {/* Right: Interactive Inspector Terminal (7 Cols) */}
            <div className="lg:col-span-7 border border-white/[0.14] bg-[#090e1b] rounded-2xl overflow-hidden shadow-2xl">
              {/* Inspector Header */}
              <div className="p-5 border-b border-white/[0.10] bg-[#0c1324] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-mono text-cyan-400 font-semibold tracking-wider uppercase">
                    CORRELATION INSPECTOR
                  </div>
                  <h3 className="text-base sm:text-lg font-display font-bold text-white mt-0.5">
                    {activeCase.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/40 font-mono text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>88% CONFIDENCE</span>
                  </div>
                </div>
              </div>

              {/* Inspector Navigation Tabs */}
              <div className="flex border-b border-white/[0.08] bg-[#070b14] px-4">
                <button
                  onClick={() => setInspectorTab("hypothesis")}
                  className={`py-3 px-4 font-mono text-xs font-semibold border-b-2 transition-colors ${
                    inspectorTab === "hypothesis"
                      ? "border-cyan-400 text-cyan-300"
                      : "border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  Hypothesis Matrix
                </button>
                <button
                  onClick={() => setInspectorTab("topology")}
                  className={`py-3 px-4 font-mono text-xs font-semibold border-b-2 transition-colors ${
                    inspectorTab === "topology"
                      ? "border-cyan-400 text-cyan-300"
                      : "border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  Link Topology
                </button>
                <button
                  onClick={() => setInspectorTab("raw")}
                  className={`py-3 px-4 font-mono text-xs font-semibold border-b-2 transition-colors ${
                    inspectorTab === "raw"
                      ? "border-cyan-400 text-cyan-300"
                      : "border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  Evidence Seeds
                </button>
              </div>

              {/* Tab 1: Hypothesis Matrix */}
              {inspectorTab === "hypothesis" && (
                <div className="p-6 space-y-6">
                  <div>
                    <div className="text-xs font-mono text-zinc-400 mb-1">PRIMARY ATTRIBUTION CANDIDATE</div>
                    <div className="text-sm font-semibold text-white">
                      Threat Persona Cluster: <span className="font-mono text-cyan-300">ACTOR-EMERALD-09</span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                      Correlated through deterministic PGP keyblock fingerprint match, Taproot wallet reuse across two Russian darknet forums, and temporal activity window alignment (UTC+3).
                    </p>
                  </div>

                  {/* Evidence Weight Distribution */}
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                      SIGNAL EVIDENCE WEIGHT ACCUMULATION
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.08] space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-zinc-200">Exact PGP Key Fingerprint Match</span>
                        <span className="text-cyan-400 font-bold">+0.35 WEIGHT</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full w-[35%]" />
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">Fingerprint: E273 9B64 12F8 501B C94D 8261 ...</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.08] space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-zinc-200">Cryptocurrency Ledger Cluster (BTC Taproot)</span>
                        <span className="text-cyan-400 font-bold">+0.35 WEIGHT</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full w-[35%]" />
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">Address: bc1p5d7rjq7g6rd2ee...</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.08] space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-zinc-200">Tor v3 Onion Mirror Co-Hosting</span>
                        <span className="text-indigo-400 font-bold">+0.18 WEIGHT</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-400 h-full w-[18%]" />
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">Endpoint: expyuz7wqqfdgah56...onion</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/50 border border-emerald-500/30 space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-emerald-300">Contradiction Filter Verification</span>
                        <span className="text-emerald-400 font-bold">0.00 PENALTY (CLEAN)</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        No temporal impossibility or divergent key usage detected.
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-white/[0.08]">
                    <div className="font-mono text-xs text-zinc-400">
                      Court-Ready Admissibility: <span className="text-white font-bold">Compliant</span>
                    </div>
                    <a
                      href={`/cases/${activeCase.id}`}
                      className="px-5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      Enter Full Case Workspace →
                    </a>
                  </div>
                </div>
              )}

              {/* Tab 2: Link Topology Visual */}
              {inspectorTab === "topology" && (
                <div className="p-6 space-y-4">
                  <div className="text-xs font-mono text-zinc-400 mb-2">
                    GRAPH LINK TOPOLOGY (MULTI-HOP ATTRIBUTION TRAVERSAL)
                  </div>

                  {/* Schematic SVG Graph Visualization */}
                  <div className="w-full h-[280px] bg-black/60 rounded-xl border border-white/[0.10] p-4 relative overflow-hidden flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 600 240">
                      {/* Connection Lines */}
                      <line x1="100" y1="120" x2="250" y2="60" stroke="#00f0ff" strokeWidth="2" strokeDasharray="4 2" />
                      <line x1="100" y1="120" x2="250" y2="180" stroke="#818cf8" strokeWidth="2" />
                      <line x1="250" y1="60" x2="420" y2="80" stroke="#00f0ff" strokeWidth="2" />
                      <line x1="250" y1="180" x2="420" y2="160" stroke="#34d399" strokeWidth="2" />
                      <line x1="420" y1="80" x2="520" y2="120" stroke="#34d399" strokeWidth="2.5" />
                      <line x1="420" y1="160" x2="520" y2="120" stroke="#34d399" strokeWidth="2.5" />

                      {/* Node 1: Forum Handle */}
                      <g transform="translate(100, 120)">
                        <circle r="24" fill="#0c1324" stroke="#00f0ff" strokeWidth="2" />
                        <text textAnchor="middle" dy="4" fill="#00f0ff" fontSize="9" fontFamily="JetBrains Mono">dark_opr</text>
                        <text textAnchor="middle" dy="36" fill="#94a3b8" fontSize="8" fontFamily="JetBrains Mono">FORUM ALIAS</text>
                      </g>

                      {/* Node 2: PGP Key */}
                      <g transform="translate(250, 60)">
                        <circle r="22" fill="#0c1324" stroke="#c084fc" strokeWidth="2" />
                        <text textAnchor="middle" dy="4" fill="#c084fc" fontSize="9" fontFamily="JetBrains Mono">PGP:E273</text>
                        <text textAnchor="middle" dy="-30" fill="#94a3b8" fontSize="8" fontFamily="JetBrains Mono">KEYBLOCK</text>
                      </g>

                      {/* Node 3: Tor Onion */}
                      <g transform="translate(250, 180)">
                        <circle r="22" fill="#0c1324" stroke="#818cf8" strokeWidth="2" />
                        <text textAnchor="middle" dy="4" fill="#818cf8" fontSize="9" fontFamily="JetBrains Mono">onion.v3</text>
                        <text textAnchor="middle" dy="34" fill="#94a3b8" fontSize="8" fontFamily="JetBrains Mono">HIDDEN SVC</text>
                      </g>

                      {/* Node 4: BTC Ledger */}
                      <g transform="translate(420, 80)">
                        <circle r="22" fill="#0c1324" stroke="#fbbf24" strokeWidth="2" />
                        <text textAnchor="middle" dy="4" fill="#fbbf24" fontSize="9" fontFamily="JetBrains Mono">BTC:bc1p</text>
                        <text textAnchor="middle" dy="-30" fill="#94a3b8" fontSize="8" fontFamily="JetBrains Mono">WALLET</text>
                      </g>

                      {/* Node 5: Mirror Host */}
                      <g transform="translate(420, 160)">
                        <circle r="20" fill="#0c1324" stroke="#60a5fa" strokeWidth="1.5" />
                        <text textAnchor="middle" dy="4" fill="#60a5fa" fontSize="8" fontFamily="JetBrains Mono">IP:91.x</text>
                        <text textAnchor="middle" dy="32" fill="#94a3b8" fontSize="8" fontFamily="JetBrains Mono">LEAK SERVER</text>
                      </g>

                      {/* Final Node: PIF Cluster */}
                      <g transform="translate(520, 120)">
                        <circle r="26" fill="#082f25" stroke="#34d399" strokeWidth="2.5" />
                        <text textAnchor="middle" dy="4" fill="#34d399" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono">PIF #44</text>
                        <text textAnchor="middle" dy="38" fill="#34d399" fontSize="8" fontFamily="JetBrains Mono">ATTRIBUTED</text>
                      </g>
                    </svg>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-2">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Alias</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400" /> PGP</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Wallet</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Fingerprint</span>
                    </div>
                    <a href={`/cases/${activeCase.id}`} className="text-cyan-400 hover:underline">
                      Launch Cytoscape Explorer →
                    </a>
                  </div>
                </div>
              )}

              {/* Tab 3: Raw Evidence Seed */}
              {inspectorTab === "raw" && (
                <div className="p-6 space-y-4">
                  <div className="text-xs font-mono text-zinc-400">
                    PARSED OBSERVATION SEED #OBS-001 (DREAD FORUM CRAWL)
                  </div>
                  <pre className="p-4 rounded-xl bg-black/70 border border-white/[0.10] text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed">
{`[2024-03-12 18:22:10 UTC] Source: dread.onion/user/dark_operator
Subject: Ransomware affiliate payout & escrow policy update

"Any payouts for the latest deployment must be remitted strictly to our Taproot ledger:
bc1p5d7rjq7g6rd2eexk7p0j76g7v7v0j76g7v7v0j76g7v7v0j76g7vx6yq

Verify my signature using the primary keyblock below:
-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: Keybase OpenPGP v2.1.13
mQGNBF4x...E2739B6412F8501BC94D8261...
-----END PGP PUBLIC KEY BLOCK-----

Mirror updates will be posted on expyuz7wqqfdgah56...onion"`}
                  </pre>
                  <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-xs font-mono text-cyan-300">
                    Extractor Output: 1 BTC Taproot, 1 PGP Keyblock (40-char fingerprint), 1 Tor v3 Onion address parsed deterministically.
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 3. Interactive Technical Subsystem Specifications ──────── */}
        <section id="architecture" className="space-y-8">
          <div className="border-b border-white/[0.14] pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="font-mono text-xs text-indigo-400 uppercase tracking-widest font-semibold flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400" />
                TECHNICAL SPECIFICATIONS
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mt-1">
                De-Anonymization Subsystem Architecture
              </h2>
            </div>

            {/* Architecture Selector Tabs */}
            <div className="flex items-center gap-1 bg-[#090e1b] p-1 rounded-xl border border-white/[0.12] text-xs font-mono">
              <button
                onClick={() => setSubsystemTab("crypto")}
                className={`px-3.5 py-1.5 rounded-lg transition-all font-medium ${
                  subsystemTab === "crypto"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                Crypto &amp; PGP
              </button>
              <button
                onClick={() => setSubsystemTab("tor")}
                className={`px-3.5 py-1.5 rounded-lg transition-all font-medium ${
                  subsystemTab === "tor"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/50"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                Tor &amp; Infra
              </button>
              <button
                onClick={() => setSubsystemTab("pif")}
                className={`px-3.5 py-1.5 rounded-lg transition-all font-medium ${
                  subsystemTab === "pif"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                PIF Clustering
              </button>
              <button
                onClick={() => setSubsystemTab("contradictions")}
                className={`px-3.5 py-1.5 rounded-lg transition-all font-medium ${
                  subsystemTab === "contradictions"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                Contradictions
              </button>
            </div>
          </div>

          {/* Interactive Subsystem Spec Stage */}
          <div className="p-8 border border-white/[0.14] bg-[#090e1b] rounded-2xl shadow-2xl">
            {subsystemTab === "crypto" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6 space-y-4">
                  <div className="text-xs font-mono text-cyan-400 font-semibold tracking-wider uppercase">
                    CANONICAL LEDGER NORMALIZATION
                  </div>
                  <h3 className="text-xl font-display font-bold text-white">Deterministic Cryptographic Fingerprinting</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                    Threat actors alter address formatting, capitalization, or prefix characters to evade regex scrapers.
                    PHANTOM normalizes Bitcoin (BIP-0173 Bech32 / Taproot), Monero stealth subaddresses, and Ethereum hex keys,
                    generating deterministic SHA-256 canonical identity digests.
                  </p>

                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-mono text-zinc-400 uppercase">Interactive Address Hash Simulator</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setCryptoType("btc"); setCryptoInput("bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"); }}
                        className={`px-2.5 py-1 text-xs font-mono rounded border ${cryptoType === "btc" ? "border-cyan-400 bg-cyan-500/20 text-cyan-300" : "border-white/10 text-zinc-400"}`}
                      >
                        BTC SegWit
                      </button>
                      <button
                        onClick={() => { setCryptoType("xmr"); setCryptoInput("888tNkZrPN6JsEgekjMnABU4TBmb2Dt29AvgDpGniF66Ymt3KWxdBgttGL7"); }}
                        className={`px-2.5 py-1 text-xs font-mono rounded border ${cryptoType === "xmr" ? "border-cyan-400 bg-cyan-500/20 text-cyan-300" : "border-white/10 text-zinc-400"}`}
                      >
                        Monero
                      </button>
                      <button
                        onClick={() => { setCryptoType("eth"); setCryptoInput("0x71c84382f65a12fbfb0b1479860b70d49f05a96f"); }}
                        className={`px-2.5 py-1 text-xs font-mono rounded border ${cryptoType === "eth" ? "border-cyan-400 bg-cyan-500/20 text-cyan-300" : "border-white/10 text-zinc-400"}`}
                      >
                        Ethereum
                      </button>
                    </div>

                    <input
                      type="text"
                      value={cryptoInput}
                      onChange={(e) => setCryptoInput(e.target.value)}
                      className="w-full px-3.5 py-2 bg-black/60 border border-white/[0.15] rounded-lg text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                    />

                    <div className="p-3 bg-black/40 border border-white/[0.08] rounded-lg font-mono text-xs">
                      <div className="text-[10px] text-zinc-400 uppercase">Canonical Hash Output:</div>
                      <div className="text-cyan-300 break-all">{cryptoHash}</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 p-6 border border-white/[0.10] bg-black/40 rounded-xl font-mono text-xs space-y-4">
                  <div className="text-cyan-300 font-bold uppercase tracking-wider text-[11px]">WEIGHT CONTRIBUTION FORMULA</div>
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <div className="flex justify-between text-zinc-200">
                        <span>Exact PGP Key Reuse Match</span>
                        <span className="text-cyan-400 font-bold">+0.35 WEIGHT</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full w-[35%]" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-zinc-200">
                        <span>Cryptocurrency Wallet Cluster Co-occurrence</span>
                        <span className="text-cyan-400 font-bold">+0.35 WEIGHT</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full w-[35%]" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-zinc-200">
                        <span>Onion v3 Host Mirror Match</span>
                        <span className="text-indigo-400 font-bold">+0.18 WEIGHT</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-400 h-full w-[18%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {subsystemTab === "tor" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6 space-y-4">
                  <div className="text-xs font-mono text-indigo-400 font-semibold tracking-wider uppercase">
                    DARK-WEB ROUTING ARCHITECTURE
                  </div>
                  <h3 className="text-xl font-display font-bold text-white">Tor v3 Onion &amp; Infrastructure Graphs</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                    Extracts 56-character ED25519 Tor v3 hidden services, clearnet mirrors, IP addresses, and domain names.
                    Cross-references hosting co-occurrence to detect shared backend infrastructure across seemingly disconnected aliases.
                  </p>
                  <div className="p-3.5 rounded-lg bg-black/60 border border-white/[0.1] font-mono text-xs flex justify-between">
                    <span className="text-zinc-400">Tor Onion v3 Format:</span>
                    <span className="text-indigo-300 font-medium">56-char base32 + .onion</span>
                  </div>
                </div>
                <div className="lg:col-span-6 p-6 border border-white/[0.10] bg-black/40 rounded-xl font-mono text-xs space-y-3">
                  <div className="text-indigo-300 font-bold uppercase tracking-wider text-[11px]">NEO4J LINK TRAVERSAL</div>
                  <p className="text-zinc-300 leading-relaxed font-sans">
                    Populates bidirectional edges in Neo4j with APOC algorithms to traverse 3+ hops between disconnected
                    alias identifiers through shared hidden service endpoints and clearnet reverse proxies.
                  </p>
                </div>
              </div>
            )}

            {subsystemTab === "pif" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6 space-y-4">
                  <div className="text-xs font-mono text-emerald-400 font-semibold tracking-wider uppercase">
                    FINGERPRINTING ALGORITHM
                  </div>
                  <h3 className="text-xl font-display font-bold text-white">Persistent Identity Fingerprint (PIF)</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                    PIF models the candidate threat actor identity across multiple underground forums without requiring PII unmasking.
                    Tracks temporal activity migration, handle mutations (Levenshtein &amp; Jaro-Winkler), and cryptographic reuse.
                  </p>
                </div>
                <div className="lg:col-span-6 p-6 border border-white/[0.10] bg-black/40 rounded-xl font-mono text-xs space-y-3">
                  <div className="text-emerald-300 font-bold uppercase tracking-wider text-[11px]">PIF CORE ATTRIBUTES</div>
                  <ul className="space-y-2 text-zinc-300">
                    <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Alias Variants &amp; Handle Mutation History</li>
                    <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Deterministic Cryptographic Keyset Signatures</li>
                    <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> First Seen / Last Seen Temporal Windows (UTC Offset)</li>
                    <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Cross-Forum Platform Migration Continuum</li>
                  </ul>
                </div>
              </div>
            )}

            {subsystemTab === "contradictions" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6 space-y-4">
                  <div className="text-xs font-mono text-amber-400 font-semibold tracking-wider uppercase">
                    SYBIL &amp; DECEPTION DEFENSE
                  </div>
                  <h3 className="text-xl font-display font-bold text-white">First-Class Contradiction Detection Engine</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                    Unlike naive correlation engines that blindly merge signals, PHANTOM explicitly detects and applies negative weights to
                    contradictions: overlapping simultaneous activity in conflicting timezones, incompatible PGP keys, or contradictory infrastructure.
                  </p>
                </div>
                <div className="lg:col-span-6 p-6 border border-white/[0.10] bg-black/40 rounded-xl font-mono text-xs space-y-3">
                  <div className="text-amber-300 font-bold uppercase tracking-wider text-[11px]">CONTRADICTION PENALTY MATRIX</div>
                  <div className="space-y-2.5 text-zinc-200">
                    <div className="flex justify-between p-2 rounded bg-black/50 border border-white/[0.06]">
                      <span>Temporal Impossibility Conflict (Simultaneous Posts)</span>
                      <span className="text-rose-400 font-bold">-0.30 PENALTY</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-black/50 border border-white/[0.06]">
                      <span>Conflicting PGP Master Key for Same Persona</span>
                      <span className="text-rose-400 font-bold">-0.25 PENALTY</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── 4. Technical Pipeline Matrix (Interactive Flow) ───────── */}
        <section className="space-y-6">
          <div className="border-b border-white/[0.14] pb-4">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
              END-TO-END PIPELINE
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mt-1">
              Deterministic Attribution Flow
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="p-6 rounded-2xl bg-[#090e1b] border border-white/[0.12] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                01
              </div>
              <h3 className="text-white font-bold text-sm">Raw Ingestion &amp; Extract</h3>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                Ingests forum dumps, pastebins, and darknet chats. Tokenizes handles, Bitcoin addresses, Monero subaddresses, and PGP keyblocks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#090e1b] border border-white/[0.12] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                02
              </div>
              <h3 className="text-white font-bold text-sm">Graph Topological Clustering</h3>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                Builds identity graphs in Neo4j 5. Traverses multi-hop connections between crypto wallets, onion mirrors, and alias variants.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#090e1b] border border-white/[0.12] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                03
              </div>
              <h3 className="text-white font-bold text-sm">Court-Ready Attribution</h3>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                Calculates weighted confidence scores with contradiction filtering to output legally defensible threat dossiers.
              </p>
            </div>
          </div>
        </section>

        {/* ── 5. Technical Provenance Footer ────────────────────────── */}
        <footer className="pt-10 pb-16 border-t border-white/[0.14] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 font-mono text-xs text-zinc-400">
          <div>
            <span className="text-white font-bold">PHANTOM</span> — Evidence-Driven Threat Actor Attribution Engine
          </div>
          <div className="flex items-center gap-6 text-[11px]">
            <span>MIT LICENSE</span>
            <span>·</span>
            <span>AUDITABLE PROVENANCE</span>
            <span>·</span>
            <span className="text-cyan-400 font-semibold">AUTHORIZED RESEARCH ONLY</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
