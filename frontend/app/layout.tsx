import "./globals.css";
import type { Metadata } from "next";
import SplashScreen from "@/components/SplashScreen";

export const metadata: Metadata = {
  title: "Triage — Automated Bug Triage System",
  description: "Classifies and routes bug reports automatically.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen">
        <SplashScreen />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <header className="flex items-center justify-between mb-10">
            <a href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/30 blur-lg rounded-full group-hover:blur-xl transition-all duration-300" />
                <div className="relative bg-gradient-to-br from-accent to-accent/70 p-2.5 rounded-xl shadow-lg group-hover:shadow-accent/20 transition-all duration-300">
                  <span className="severity-dot bg-ink w-2 h-2" />
                </div>
              </div>
              <span className="font-mono text-sm tracking-widest text-paper/90 uppercase font-semibold group-hover:text-accent transition-colors">
                Triage
              </span>
            </a>
            <nav className="flex items-center gap-2 bg-panel/50 rounded-xl border border-line/50 px-2 py-1.5 backdrop-blur-sm">
              <a href="/landing" className="font-mono text-xs uppercase tracking-wider text-paper/50 hover:text-accent px-4 py-2 rounded-lg hover:bg-accent/10 transition-all duration-200">
                Home
              </a>
              <a href="/dashboard" className="font-mono text-xs uppercase tracking-wider text-paper/50 hover:text-accent px-4 py-2 rounded-lg hover:bg-accent/10 transition-all duration-200">
                Dashboard
              </a>
              <a href="/analytics" className="font-mono text-xs uppercase tracking-wider text-paper/50 hover:text-accent px-4 py-2 rounded-lg hover:bg-accent/10 transition-all duration-200">
                Analytics
              </a>
              <a href="/submit" className="font-mono text-xs uppercase tracking-wider text-paper/50 hover:text-accent px-4 py-2 rounded-lg hover:bg-accent/10 transition-all duration-200">
                Report a bug
              </a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
