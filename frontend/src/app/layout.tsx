import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PHANTOM — Evidence-Driven Threat Actor Attribution",
  description: "An evidence-driven threat intelligence and investigation platform for correlating fragmented digital observations into explainable threat-actor attribution hypotheses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#0a0e17] antialiased">
        <div className="min-h-screen bg-grid">
          {/* Top navigation */}
          <nav className="glass sticky top-0 z-50 border-b border-[#1e2d3d]/80 backdrop-blur-md">
            <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-10">
              <div className="flex items-center justify-between h-16">
                <a href="/" className="flex items-center gap-3.5 group">
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-cyan-500/30 bg-[#0d131f] flex items-center justify-center shadow-lg shadow-cyan-500/10 group-hover:border-cyan-400/60 transition-all">
                    <img
                      src="/logo.png"
                      alt="PHANTOM Logo"
                      className="w-full h-full object-contain p-0.5"
                    />
                  </div>
                  <span className="text-xl font-extrabold tracking-wider text-[#e2e8f0] group-hover:text-[#00f0ff] transition-colors">
                    PHANTOM
                  </span>
                  <span className="hidden sm:inline text-xs text-[#64748b] font-mono px-2 py-0.5 rounded bg-[#111827] border border-[#1e2d3d]">
                    v0.1
                  </span>
                </a>
                <div className="flex items-center gap-6">
                  <a
                    href="/cases"
                    className="text-sm font-medium text-[#94a3b8] hover:text-[#00f0ff] transition-colors"
                  >
                    Cases
                  </a>
                  <a
                    href="/cases/new"
                    className="hidden sm:inline-flex px-3.5 py-1.5 bg-cyan-500/10 text-[#00f0ff] border border-cyan-500/30 hover:bg-cyan-500/20 rounded-lg text-xs font-medium transition-all"
                  >
                    + New Case
                  </a>
                  <div className="flex items-center gap-2 text-xs text-[#64748b]">
                    <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" title="System Online" />
                    <span className="hidden md:inline">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
