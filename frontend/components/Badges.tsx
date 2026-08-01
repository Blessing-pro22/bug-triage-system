const SEVERITY_COLORS: Record<string, string> = {
  critical: "#FF4D4F",
  major: "#FF9F43",
  minor: "#F4D35E",
  trivial: "#5B6672",
};

const TEAM_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  security: "Security",
};

export function SeverityBadge({ severity }: { severity?: string | null }) {
  // Safe fallback + lowercase check
  const safeSeverity = (severity || "major").toLowerCase();
  const color = SEVERITY_COLORS[safeSeverity] || "#5B6672";

  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider px-2 py-1 rounded-sm border"
      style={{ color, borderColor: `${color}55`, backgroundColor: `${color}14` }}
    >
      <span className="severity-dot" style={{ backgroundColor: color }} />
      {safeSeverity}
    </span>
  );
}

export function TeamBadge({ team }: { team?: string | null }) {
  // Safe fallback + lowercase check
  const safeTeam = (team || "backend").toLowerCase();

  return (
    <span className="inline-flex items-center font-mono text-[11px] uppercase tracking-wider px-2 py-1 rounded-sm border border-line text-paper/70 bg-panel">
      {TEAM_LABELS[safeTeam] || safeTeam}
    </span>
  );
}

export function StatusBadge({ status }: { status?: string | null }) {
  // Safe fallback + lowercase check
  const safeStatus = (status || "new").toLowerCase();

  const map: Record<string, string> = {
    new: "text-accent border-accent/40 bg-accent/10",
    triaged: "text-[#2DD4BF] border-[#2DD4BF]/40 bg-[#2DD4BF]/10",
    assigned: "text-[#F4D35E] border-[#F4D35E]/40 bg-[#F4D35E]/10",
    in_progress: "text-[#FF9F43] border-[#FF9F43]/40 bg-[#FF9F43]/10",
    resolved: "text-paper/60 border-line bg-panel",
    closed: "text-paper/40 border-line bg-panel",
    reopened: "text-signal-critical border-signal-critical/40 bg-signal-critical/10",
  };

  return (
    <span className={`inline-flex font-mono text-[11px] uppercase tracking-wider px-2 py-1 rounded-sm border ${map[safeStatus] || "text-accent border-accent/40 bg-accent/10"}`}>
      {safeStatus.replace("_", " ")}
    </span>
  );
}