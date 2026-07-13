"use client";
import { Bug } from "@/lib/api";
import { SeverityBadge } from "./Badges";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#FF4D4F",
  major: "#FF9F43",
  minor: "#F4D35E",
  trivial: "#5B6672",
};

/**
 * The signature element of the dashboard: a stock-ticker-style strip
 * showing the classifier's most recent decisions in real time, in the
 * spirit of a triage desk's live queue. Doubles the list so the CSS
 * scroll animation loops seamlessly.
 */
export default function TriageTicker({ bugs }: { bugs: Bug[] }) {
  if (bugs.length === 0) return null;
  const doubled = [...bugs, ...bugs];

  return (
    <div className="relative overflow-hidden border-y border-line bg-panel/60 py-2.5 mb-8">
      <div className="flex ticker-track w-max">
        {doubled.map((bug, i) => (
          <div key={`${bug.id}-${i}`} className="flex items-center gap-2 px-5 whitespace-nowrap font-mono text-xs">
            <span
              className="severity-dot"
              style={{ backgroundColor: SEVERITY_COLORS[bug.predicted_severity] }}
            />
            <span className="text-paper/40">#{bug.id}</span>
            <span className="text-paper/80">{bug.title}</span>
            <span className="text-paper/30">→</span>
            <span className="text-accent">{bug.predicted_team}</span>
            <span className="text-paper/20 mx-2">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}
