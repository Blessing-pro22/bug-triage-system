"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Bug, AnalyticsSummary, TrendPoint, Status, Severity, Team } from "@/lib/api";
import { SeverityBadge, TeamBadge, StatusBadge } from "@/components/Badges";
import TriageTicker from "@/components/TriageTicker";
import { SeverityBreakdown, TeamLoadChart, TrendChart } from "@/components/AnalyticsCharts";
import ActivityLog from "@/components/ActivityLog";
import { Activity, TrendingUp, Clock, AlertCircle, Filter, LayoutGrid, Search, Brain, ChevronRight } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ status?: string; team?: string; severity?: string }>({});
  const [searchQuery, setSearchQuery] = useState("");

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
      <div className="max-w-2xl mx-auto mt-12">
        <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-signal-critical/10 to-signal-critical/5 border border-signal-critical/30 backdrop-blur-sm shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertCircle className="w-24 h-24 text-signal-critical" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-signal-critical/20 rounded-full border border-signal-critical/30 mb-6">
              <AlertCircle className="w-4 h-4 text-signal-critical" />
              <p className="font-mono text-xs uppercase tracking-wider text-signal-critical">Connection Error</p>
            </div>
            <h2 className="font-bold text-2xl mb-4 text-white">Unable to load bug reports</h2>
            <p className="text-paper/60 mb-8 max-w-md">
              {error || "We couldn't connect to the server. Please check your connection and try again."}
            </p>
            <button
              onClick={loadAll}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-6 py-3 rounded-xl bg-signal-critical text-white hover:bg-signal-critical/90 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Activity className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <TriageTicker bugs={bugs} />

      <section className="mb-8 sm:mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-mono text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-white">Triage queue</h1>
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
            <StatCard 
              label="Total reports" 
              value={summary.total_bugs} 
              icon={<LayoutGrid className="w-5 h-5" />} 
              trend={"+12%"}
              trendUp={true}
            />
            <StatCard 
              label="Open" 
              value={summary.open_bugs} 
              accent="text-accent" 
              icon={<AlertCircle className="w-5 h-5" />}
              attention={summary.open_bugs > 50}
            />
            <StatCard 
              label="Resolved" 
              value={summary.resolved_bugs} 
              icon={<Activity className="w-5 h-5" />}
              trend={"+18%"}
              trendUp={true}
            />
            <StatCard
              label="Avg. resolution"
              value={summary.avg_resolution_hours != null ? `${summary.avg_resolution_hours}h` : "—"}
              icon={<Clock className="w-5 h-5" />}
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-panel/50 rounded-lg border border-line/50">
            <Filter className="w-4 h-4 text-paper/50" />
            <span className="font-mono text-xs text-paper/50 uppercase tracking-wider">Filters</span>
          </div>
          <div className="flex-1 max-w-md w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/30" />
              <input
                type="text"
                placeholder="Search bugs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-panel/50 border border-line/50 rounded-lg pl-10 pr-4 py-2 text-paper placeholder:text-paper/25 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all duration-200 font-mono text-xs"
              />
            </div>
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
              options={["new", "triaged", "assigned", "in_progress", "resolved", "closed", "reopened"]}
              onChange={(v) => setFilters((f) => ({ ...f, status: v || undefined }))}
            />
          </div>
        </div>

        <div className="border border-line/50 rounded-xl overflow-hidden backdrop-blur-sm bg-panel/30 shadow-lg">
          {loading ? (
            <div className="p-12 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-5 border-b border-line/30 last:border-b-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-4 bg-panel/50 rounded animate-pulse" />
                        <div className="w-20 h-4 bg-panel/50 rounded animate-pulse" />
                        <div className="w-20 h-4 bg-panel/50 rounded animate-pulse" />
                      </div>
                      <div className="w-3/4 h-5 bg-panel/50 rounded animate-pulse" />
                      <div className="w-1/2 h-4 bg-panel/50 rounded animate-pulse" />
                      <div className="w-1/3 h-3 bg-panel/50 rounded animate-pulse" />
                    </div>
                    <div className="w-24 h-8 bg-panel/50 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : bugs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center border border-accent/30">
                  <Brain className="w-10 h-10 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white mb-2">No bugs in the queue 🎉</h3>
                  <p className="text-paper/50 text-sm max-w-md">
                    New bug reports will appear here automatically after AI-powered classification.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            bugs.filter(bug => 
              searchQuery === "" || 
              bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              bug.description.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((bug, index) => (
              <div 
                key={bug.id} 
                onClick={() => router.push(`/bug/${bug.id}`)}
                className="p-4 sm:p-5 border-b border-line/50 last:border-b-0 bg-panel/20 hover:bg-panel/40 transition-all duration-200 hover:shadow-md animate-fade-in-up cursor-pointer group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs text-paper/30">#{bug.id}</span>
                      <SeverityBadge severity={bug.final_severity || bug.predicted_severity} />
                      <TeamBadge team={bug.final_team || bug.predicted_team} />
                      <StatusBadge status={bug.status} />
                    </div>
                    <h3 className="font-medium text-paper truncate text-sm sm:text-base">{bug.title}</h3>
                    <p className="text-paper/50 text-sm mt-0.5 line-clamp-1 text-xs sm:text-sm">{bug.description}</p>
                    <p className="font-mono text-[10px] sm:text-[11px] text-paper/30 mt-2 flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Brain className="w-3 h-3 text-accent" />
                        AI confidence: severity {bug.severity_confidence}% · team {bug.team_confidence}%
                      </span>
                      {bug.reporter ? `· reported by ${bug.reporter}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0 items-center sm:flex-row flex-col">
                    {(bug.status === "new" || bug.status === "triaged") && (
                      <ActionButton onClick={(e: React.MouseEvent) => { e.stopPropagation(); setBugStatus(bug.id, "assigned" as Status); }}>Assign</ActionButton>
                    )}
                    {bug.status === "assigned" && (
                      <ActionButton onClick={(e: React.MouseEvent) => { e.stopPropagation(); setBugStatus(bug.id, "in_progress" as Status); }}>Start</ActionButton>
                    )}
                    {bug.status === "in_progress" && (
                      <ActionButton onClick={(e: React.MouseEvent) => { e.stopPropagation(); setBugStatus(bug.id, "resolved" as Status); }}>Resolve</ActionButton>
                    )}
                    {bug.status === "resolved" && (
                      <ActionButton onClick={(e: React.MouseEvent) => { e.stopPropagation(); setBugStatus(bug.id, "closed" as Status); }}>Close</ActionButton>
                    )}
                    {bug.status === "closed" && (
                      <ActionButton onClick={(e: React.MouseEvent) => { e.stopPropagation(); setBugStatus(bug.id, "reopened" as Status); }}>Reopen</ActionButton>
                    )}
                    <ChevronRight className="w-5 h-5 text-paper/30 group-hover:text-accent transition-colors hidden sm:block" />
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
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <ChartCard title="By severity"><SeverityBreakdown data={summary.by_severity} /></ChartCard>
            <ChartCard title="By team"><TeamLoadChart data={summary.by_team} /></ChartCard>
            <ChartCard title="Reports / day (30d)"><TrendChart data={trend} /></ChartCard>
          </div>
        </section>
      )}

      <section className="animate-fade-in-up">
        <ActivityLog />
      </section>
    </div>
  );
}

function StatCard({ label, value, accent, icon, trend, trendUp, attention }: { 
  label: string; 
  value: string | number; 
  accent?: string; 
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  attention?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-panel/50 to-panel/30 border ${attention ? 'border-signal-major/50' : 'border-line/50'} backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300 group`}>
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <div className={`font-mono text-3xl font-bold ${accent || "text-white"} mb-1`}>{value}</div>
      <div className="text-paper/40 text-xs mt-2 font-mono uppercase tracking-wider flex items-center gap-2">
        {icon && <span className="text-accent/60">{icon}</span>}
        {label}
      </div>
      {trend && (
        <div className={`mt-2 text-xs font-mono flex items-center gap-1 ${trendUp ? 'text-accent' : 'text-signal-critical'}`}>
          <TrendingUp className={`w-3 h-3 ${!trendUp && 'rotate-180'}`} />
          {trend}
        </div>
      )}
      {attention && (
        <div className="mt-2 text-xs font-mono text-signal-major flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Attention needed
        </div>
      )}
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

function ActionButton({ onClick, children }: { onClick: (e: React.MouseEvent) => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="font-mono text-[11px] uppercase tracking-wider px-4 py-2 rounded-lg border border-line/50 text-paper/70 hover:border-accent hover:text-accent hover:bg-accent/10 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      {children}
    </button>
  );
}
