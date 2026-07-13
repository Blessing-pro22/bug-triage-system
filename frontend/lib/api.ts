const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Severity = "trivial" | "minor" | "major" | "critical";
export type Team = "frontend" | "backend" | "security";
export type Status = "open" | "in_progress" | "resolved" | "closed";

export interface Bug {
  id: number;
  title: string;
  description: string;
  reporter: string | null;
  predicted_severity: Severity;
  predicted_team: Team;
  severity_confidence: number | null;
  team_confidence: number | null;
  final_severity: Severity | null;
  final_team: Team | null;
  status: Status;
  created_at: string;
  resolved_at: string | null;
}

export interface AnalyticsSummary {
  total_bugs: number;
  open_bugs: number;
  resolved_bugs: number;
  avg_resolution_hours: number | null;
  by_severity: Record<string, number>;
  by_team: Record<string, number>;
  by_status: Record<string, number>;
}

export interface TrendPoint {
  day: string;
  count: number;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  listBugs: (params?: { status?: string; team?: string; severity?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<Bug[]>(`/api/bugs${qs ? `?${qs}` : ""}`);
  },
  submitBug: (data: { title: string; description: string; reporter?: string }) =>
    request<Bug>("/api/bugs", { method: "POST", body: JSON.stringify(data) }),
  updateBug: (id: number, data: Partial<{ status: Status; final_severity: Severity; final_team: Team }>) =>
    request<Bug>(`/api/bugs/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteBug: (id: number) => request<void>(`/api/bugs/${id}`, { method: "DELETE" }),
  analyticsSummary: () => request<AnalyticsSummary>("/api/analytics/summary"),
  analyticsTrend: () => request<TrendPoint[]>("/api/analytics/trend"),
};
