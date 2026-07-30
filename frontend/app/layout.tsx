"use client";
import { useState } from "react";
import "./globals.css";
import type { Metadata } from "next";
import SplashScreen from "@/components/SplashScreen";
import { Menu, X } from "lucide-react";

export const metadata: Metadata = {
  title: "Triage — Automated Bug Triage System",
  description: "Classifies and routes bug reports automatically.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <html lang="en">
      <body className="font-sans min-h-screen">
        <SplashScreen />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <header className="flex items-center justify-between mb-8 sm:mb-10">
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
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2 bg-panel/50 rounded-xl border border-line/50 px-2 py-1.5 backdrop-blur-sm">
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 bg-panel/50 rounded-lg border border-line/50 text-paper/70 hover:text-accent hover:border-accent transition-all duration-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </header>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mb-8 p-4 bg-panel/50 rounded-xl border border-line/50 backdrop-blur-sm animate-fade-in">
              <div className="flex flex-col gap-2">
                <a 
                  href="/landing" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-mono text-xs uppercase tracking-wider text-paper/50 hover:text-accent px-4 py-3 rounded-lg hover:bg-accent/10 transition-all duration-200"
                >
                  Home
                </a>
                <a 
                  href="/dashboard" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-mono text-xs uppercase tracking-wider text-paper/50 hover:text-accent px-4 py-3 rounded-lg hover:bg-accent/10 transition-all duration-200"
                >
                  Dashboard
                </a>
                <a 
                  href="/analytics" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-mono text-xs uppercase tracking-wider text-paper/50 hover:text-accent px-4 py-3 rounded-lg hover:bg-accent/10 transition-all duration-200"
                >
                  Analytics
                </a>
                <a 
                  href="/submit" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-mono text-xs uppercase tracking-wider text-paper/50 hover:text-accent px-4 py-3 rounded-lg hover:bg-accent/10 transition-all duration-200"
                >
                  Report a bug
                </a>
              </div>
            </nav>
          )}

          {children}
        </div>
      </body>
    </html>
  );
}
