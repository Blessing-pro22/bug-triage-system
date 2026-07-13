"use client";
import { useEffect, useState } from "react";
import { api, Bug, AnalyticsSummary, TrendPoint, Status, Severity, Team } from "@/lib/api";
import { SeverityBadge, TeamBadge, StatusBadge } from "@/components/Badges";
import TriageTicker from "@/components/TriageTicker";
import { SeverityBreakdown, TeamLoadChart, TrendChart } from "@/components/AnalyticsCharts";

export default function DashboardPage() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ status?: string; team?: string; severity?: string }>({});

  async function loadAll() {
    try {
      setError(null);
      const [b, s, t] = await Promise.all([
        api.listBugs(filters),
        api.analyticsSummary(),
        api.analyticsTrend(),
      ]);
      setBugs(b);
      setSummary(s);
      setTrend(t);
    } catch (e: any) {
      setError(e.message || "Could not reach the API. Is the backend running on :8000?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function setBugStatus(id: number, status: Status) {
    await api.updateBug(id, { status });
    loadAll();
  }

  if (error) {
    return (
      <div className="border border-signal-critical/30 bg-signal-critical/5 rounded-md p-6 font-mono text-sm text-signal-critical">
        {error}
      </div>
    );
  }

  return (
    <div>
      <TriageTicker bugs={bugs} />

      <section className="mb-10">
        <h1 className="font-mono text-2xl font-medium tracking-tight mb-1">Triage queue</h1>
        <p className="text-paper/50 text-sm mb-6">
          Every report below was classified automatically on submission. Override anything the model gets wrong — corrections are what future retraining learns from.
        </p>

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard label="Total reports" value={summary.total_bugs} />
            <StatCard label="Open" value={summary.open_bugs} accent="text-accent" />
            <StatCard label="Resolved" value={summary.resolved_bugs} />
            <StatCard
              label="Avg. resolution"
              value={summary.avg_resolution_hours != null ? `${summary.avg_resolution_hours}h` : "—"}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4 font-mono text-xs">
          <FilterSelect
            label="Severity"
            value={filters.severity || ""}
            options={["critical", "major", "minor", "trivial"]}
            onChange={(v) => setFilters((f) => ({ ...f, severity: v || undefined }))}
          />
          <FilterSelect
            label="Team"
            value={filters.team || ""}
            options={["frontend", "backend", "security"]}
            onChange={(v) => setFilters((f) => ({ ...f, team: v || undefined }))}
          />
          <FilterSelect
            label="Status"
            value={filters.status || ""}
            options={["open", "in_progress", "resolved", "closed"]}
            onChange={(v) => setFilters((f) => ({ ...f, status: v || undefined }))}
          />
        </div>

        <div className="border border-line rounded-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-paper/40 font-mono text-xs">Loading queue…</div>
          ) : bugs.length === 0 ? (
            <div className="p-8 text-center text-paper/40 font-mono text-xs">
              No bugs match these filters yet.
            </div>
          ) : (
            bugs.map((bug) => (
              <div key={bug.id} className="p-4 border-b border-line last:border-b-0 bg-panel/40 hover:bg-panel transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs text-paper/30">#{bug.id}</span>
                      <SeverityBadge severity={bug.final_severity || bug.predicted_severity} />
                      <TeamBadge team={bug.final_team || bug.predicted_team} />
                      <StatusBadge status={bug.status} />
                    </div>
                    <h3 className="font-medium text-paper truncate">{bug.title}</h3>
                    <p className="text-paper/50 text-sm mt-0.5 line-clamp-1">{bug.description}</p>
                    <p className="font-mono text-[11px] text-paper/30 mt-1.5">
                      confidence: severity {bug.severity_confidence}% · team {bug.team_confidence}%
                      {bug.reporter ? ` · reported by ${bug.reporter}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {bug.status === "open" && (
                      <ActionButton onClick={() => setBugStatus(bug.id, "in_progress" as Status)}>Start</ActionButton>
                    )}
                    {bug.status === "in_progress" && (
                      <ActionButton onClick={() => setBugStatus(bug.id, "resolved" as Status)}>Resolve</ActionButton>
                    )}
                    {bug.status === "resolved" && (
                      <ActionButton onClick={() => setBugStatus(bug.id, "closed" as Status)}>Close</ActionButton>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {summary && (
        <section>
          <h2 className="font-mono text-lg font-medium tracking-tight mb-4">Analytics</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <ChartCard title="By severity"><SeverityBreakdown data={summary.by_severity} /></ChartCard>
            <ChartCard title="By team"><TeamLoadChart data={summary.by_team} /></ChartCard>
            <ChartCard title="Reports / day (30d)"><TrendChart data={trend} /></ChartCard>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="border border-line rounded-md p-4 bg-panel/40">
      <div className={`font-mono text-2xl font-medium ${accent || "text-paper"}`}>{value}</div>
      <div className="text-paper/40 text-xs mt-1 font-mono uppercase tracking-wider">{label}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-line rounded-md p-4 bg-panel/40">
      <div className="font-mono text-xs uppercase tracking-wider text-paper/50 mb-2">{title}</div>
      {children}
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-panel border border-line rounded-sm px-2.5 py-1.5 text-paper/70 focus:outline-none focus:border-accent focus:text-accent"
    >
      <option value="">{label}: all</option>
      {options.map((o) => (
        <option key={o} value={o}>{o.replace("_", " ")}</option>
      ))}
    </select>
  );
}

function ActionButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-sm border border-line text-paper/70 hover:border-accent hover:text-accent transition-colors"
    >
      {children}
    </button>
  );
}
