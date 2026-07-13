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

export function SeverityBadge({ severity }: { severity: string }) {
  const color = SEVERITY_COLORS[severity] || "#5B6672";
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider px-2 py-1 rounded-sm border"
      style={{ color, borderColor: `${color}55`, backgroundColor: `${color}14` }}
    >
      <span className="severity-dot" style={{ backgroundColor: color }} />
      {severity}
    </span>
  );
}

export function TeamBadge({ team }: { team: string }) {
  return (
    <span className="inline-flex items-center font-mono text-[11px] uppercase tracking-wider px-2 py-1 rounded-sm border border-line text-paper/70 bg-panel">
      {TEAM_LABELS[team] || team}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: "text-accent border-accent/40 bg-accent/10",
    in_progress: "text-[#F4D35E] border-[#F4D35E]/40 bg-[#F4D35E]/10",
    resolved: "text-paper/60 border-line bg-panel",
    closed: "text-paper/40 border-line bg-panel",
  };
  return (
    <span className={`inline-flex font-mono text-[11px] uppercase tracking-wider px-2 py-1 rounded-sm border ${map[status] || ""}`}>
      {status.replace("_", " ")}
    </span>
  );
}
