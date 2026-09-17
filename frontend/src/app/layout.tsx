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
          <nav className="glass sticky top-0 z-50 border-b border-[#1e2d3d]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <a href="/" className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm animate-pulse-glow">
                    P
                  </div>
                  <span className="text-lg font-semibold tracking-wider text-[#e2e8f0] group-hover:text-[#00f0ff] transition-colors">
                    PHANTOM
                  </span>
                  <span className="hidden sm:inline text-xs text-[#64748b] font-mono">v0.1</span>
                </a>
                <div className="flex items-center gap-6">
                  <a href="/cases" className="text-sm text-[#94a3b8] hover:text-[#00f0ff] transition-colors">
                    Cases
                  </a>
                  <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" title="System Online" />
                </div>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
