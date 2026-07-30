"use client";
import { useEffect, useState } from "react";
import { Bug, Zap } from "lucide-react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has already seen the splash screen in this session
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    
    if (hasSeenSplash) {
      setVisible(false);
    } else {
      // Mark as seen and hide after animation
      sessionStorage.setItem("hasSeenSplash", "true");
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible || !mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink">
      <div className="relative">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full animate-pulse" />
        
        {/* Main content */}
        <div className="relative flex flex-col items-center gap-6">
          {/* Icon animation */}
          <div className="relative">
            <div className="absolute inset-0 bg-accent/30 blur-xl rounded-full animate-ping" />
            <div className="relative bg-gradient-to-br from-accent to-accent/70 p-6 rounded-2xl shadow-2xl">
              <Bug className="w-16 h-16 text-ink" />
            </div>
          </div>
          
          {/* Text animation */}
          <div className="text-center space-y-2">
            <h1 className="font-mono text-3xl font-bold tracking-tight text-paper animate-fade-in">
              Triage
            </h1>
            <p className="text-paper/50 text-sm font-mono animate-fade-in-up">
              Automated Bug Classification
            </p>
          </div>
          
          {/* Loading indicator */}
          <div className="flex items-center gap-2 text-accent/60 animate-fade-in-up">
            <Zap className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider">Initializing</span>
          </div>
        </div>
      </div>
      
      {/* Fade out overlay */}
      <div className="absolute inset-0 bg-ink animate-fade-out pointer-events-none" />
    </div>
  );
}
