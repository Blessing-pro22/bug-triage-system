const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Severity = "trivial" | "minor" | "major" | "critical";
export type Team = "frontend" | "backend" | "security";
export type Status = "new" | "triaged" | "assigned" | "in_progress" | "resolved" | "closed" | "reopened";

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

export interface Feedback {
  id: number;
  bug_id: number;
  original_severity: Severity;
  original_team: Team;
  corrected_severity: Severity | null;
  corrected_team: Team | null;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  bug_id: number;
  action: string;
  details: string;
  user: string;
  created_at: string;
}

export interface AIPerformance {
  classification_accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  total_predictions: number;
  correct_predictions: number;
  human_corrections: number;
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
  submitFeedback: (bugId: number, data: { corrected_severity?: Severity; corrected_team?: Team }) =>
    request<Feedback>(`/api/bugs/${bugId}/feedback`, { method: "POST", body: JSON.stringify(data) }),
  getActivityLog: () => request<ActivityLog[]>("/api/activity"),
  getAIPerformance: () => request<AIPerformance>("/api/analytics/ai-performance"),
  analyticsSummary: () => request<AnalyticsSummary>("/api/analytics/summary"),
  analyticsTrend: () => request<TrendPoint[]>("/api/analytics/trend"),
};
