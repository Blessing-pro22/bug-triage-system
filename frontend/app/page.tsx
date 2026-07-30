"use client";
import { useEffect, useState } from "react";
import { api, Bug, AnalyticsSummary, TrendPoint, Status, Severity, Team } from "@/lib/api";
import { SeverityBadge, TeamBadge, StatusBadge } from "@/components/Badges";
import TriageTicker from "@/components/TriageTicker";
import { SeverityBreakdown, TeamLoadChart, TrendChart } from "@/components/AnalyticsCharts";
import { Activity, TrendingUp, Clock, AlertCircle, Filter, LayoutGrid } from "lucide-react";

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
    <div className="animate-fade-in">
      <TriageTicker bugs={bugs} />

      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-mono text-3xl font-bold tracking-tight mb-2 text-white">Triage queue</h1>
            <p className="text-paper/50 text-sm max-w-2xl">
              Every report below was classified automatically on submission. Override anything the model gets wrong — corrections are what future retraining learns from.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-panel/50 rounded-lg border border-line/50">
            <Activity className="w-4 h-4 text-accent" />
            <span className="font-mono text-xs text-paper/60">Live updates</span>
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total reports" value={summary.total_bugs} icon={<LayoutGrid className="w-5 h-5" />} />
            <StatCard label="Open" value={summary.open_bugs} accent="text-accent" icon={<AlertCircle className="w-5 h-5" />} />
            <StatCard label="Resolved" value={summary.resolved_bugs} icon={<Activity className="w-5 h-5" />} />
            <StatCard
              label="Avg. resolution"
              value={summary.avg_resolution_hours != null ? `${summary.avg_resolution_hours}h` : "—"}
              icon={<Clock className="w-5 h-5" />}
            />
          </div>
        )}

        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-panel/50 rounded-lg border border-line/50">
            <Filter className="w-4 h-4 text-paper/50" />
            <span className="font-mono text-xs text-paper/50 uppercase tracking-wider">Filters</span>
          </div>
          <div className="flex flex-wrap gap-2">
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
        </div>

        <div className="border border-line/50 rounded-xl overflow-hidden backdrop-blur-sm bg-panel/30 shadow-lg">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-panel/50 rounded-full border border-line/50">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-paper/40 font-mono text-sm">Loading queue…</span>
              </div>
            </div>
          ) : bugs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-panel/50 flex items-center justify-center border border-line/50">
                  <Filter className="w-8 h-8 text-paper/30" />
                </div>
                <p className="text-paper/40 font-mono text-sm">No bugs match these filters yet.</p>
              </div>
            </div>
          ) : (
            bugs.map((bug, index) => (
              <div 
                key={bug.id} 
                className="p-5 border-b border-line/50 last:border-b-0 bg-panel/20 hover:bg-panel/40 transition-all duration-200 hover:shadow-md animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
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
        <section className="animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h2 className="font-mono text-xl font-bold tracking-tight text-white">Analytics</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <ChartCard title="By severity"><SeverityBreakdown data={summary.by_severity} /></ChartCard>
            <ChartCard title="By team"><TeamLoadChart data={summary.by_team} /></ChartCard>
            <ChartCard title="Reports / day (30d)"><TrendChart data={trend} /></ChartCard>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value, accent, icon }: { label: string; value: string | number; accent?: string; icon?: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-panel/50 to-panel/30 border border-line/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300 group">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <div className={`font-mono text-3xl font-bold ${accent || "text-white"} mb-1`}>{value}</div>
      <div className="text-paper/40 text-xs mt-2 font-mono uppercase tracking-wider flex items-center gap-2">
        {icon && <span className="text-accent/60">{icon}</span>}
        {label}
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5 bg-gradient-to-br from-panel/50 to-panel/30 border border-line/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="font-mono text-xs uppercase tracking-wider text-paper/50 mb-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-accent" />
        {title}
      </div>
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
      className="bg-panel/50 border border-line/50 rounded-lg px-3 py-2 text-paper/70 focus:outline-none focus:border-accent focus:text-accent focus:ring-1 focus:ring-accent/50 transition-all duration-200 font-mono text-xs cursor-pointer hover:bg-panel/70"
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
      className="font-mono text-[11px] uppercase tracking-wider px-4 py-2 rounded-lg border border-line/50 text-paper/70 hover:border-accent hover:text-accent hover:bg-accent/10 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      {children}
    </button>
  );
}
