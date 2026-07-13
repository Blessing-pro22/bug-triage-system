import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Triage — Automated Bug Triage System",
  description: "Classifies and routes bug reports automatically.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <header className="flex items-center justify-between mb-10">
            <a href="/" className="flex items-center gap-2 group">
              <span className="severity-dot bg-accent group-hover:scale-125 transition-transform" />
              <span className="font-mono text-sm tracking-widest text-paper/90 uppercase">
                Triage
              </span>
            </a>
            <nav className="flex gap-6 font-mono text-xs uppercase tracking-wider text-paper/50">
              <a href="/" className="hover:text-accent transition-colors">Dashboard</a>
              <a href="/submit" className="hover:text-accent transition-colors">Report a bug</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
