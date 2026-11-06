import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PHANTOM — Threat Actor De-Anonymization Engine",
  description: "An evidence-driven threat intelligence platform correlating fragmented dark-web observations into court-ready attribution hypotheses.",
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
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#04060a] text-[#f1f5f9] antialiased selection:bg-[#00f0ff]/20 selection:text-[#00f0ff]">
        <div className="min-h-screen flex flex-col w-full relative">
          {/* ── Glassy 90vw Floating Pill Navbar ───────────────────────── */}
          <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-5xl transition-all">
            <nav className="flex items-center justify-between px-5 py-2.5 rounded-full border border-white/[0.14] bg-[#070b14]/85 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
              {/* Brand (Logo + Product Name) */}
              <a href="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-400/40 bg-black flex items-center justify-center shrink-0 group-hover:border-cyan-300 transition-colors">
                  <img
                    src="/logo.jpg"
                    alt="PHANTOM Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-sm font-bold tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                    PHANTOM
                  </span>
                </div>
              </a>

              {/* Navigation Links (Clean, No Nested Center Pill) */}
              <div className="hidden md:flex items-center gap-7">
                <a
                  href="/"
                  className="text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Overview
                </a>
                <a
                  href="/cases"
                  className="text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Dossiers
                </a>
                <a
                  href="/#architecture"
                  className="text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Subsystems
                </a>
              </div>

              {/* Primary Action Button */}
              <div className="flex items-center gap-3">
                <a
                  href="/cases#new"
                  className="px-4 py-1.5 bg-white text-black hover:bg-zinc-200 font-mono font-semibold text-xs rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
                >
                  + New Case
                </a>
              </div>
            </nav>
          </header>

          {/* Main Application Area */}
          <main className="flex-1 w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
