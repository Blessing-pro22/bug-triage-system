"use client";
import { Bug } from "@/lib/api";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#FF4D4F",
  major: "#FF9F43",
  minor: "#F4D35E",
  trivial: "#5B6672",
};

export default function TriageTicker({ bugs }: { bugs: Bug[] }) {
  if (!bugs || bugs.length === 0) return null;
  const doubled = [...bugs, ...bugs];

  return (
    <div className="relative overflow-hidden border-y border-line bg-panel/60 py-2.5 mb-8">
      <div className="flex ticker-track w-max">
        {doubled.map((bug, i) => {
          const safeSeverity = (bug.final_severity || bug.predicted_severity || "major").toLowerCase();
          const safeTeam = (bug.final_team || bug.predicted_team || "backend").toLowerCase();
          const color = SEVERITY_COLORS[safeSeverity] || "#FF9F43";

          return (
            <div key={`${bug.id || i}-${i}`} className="flex items-center gap-2 px-5 whitespace-nowrap font-mono text-xs">
              <span
                className="severity-dot"
                style={{ backgroundColor: color }}
              />
              <span className="text-paper/40">#{bug.id || "0"}</span>
              <span className="text-paper/80">{bug.title || "Untitled Bug"}</span>
              <span className="text-paper/30">→</span>
              <span className="text-accent">{safeTeam}</span>
              <span className="text-paper/20 mx-2">|</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}