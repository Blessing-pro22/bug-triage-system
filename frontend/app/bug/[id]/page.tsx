"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, Bug, Status, Severity, Team } from "@/lib/api";
import { SeverityBadge, TeamBadge, StatusBadge } from "@/components/Badges";
import { 
  ArrowLeft, 
  Brain, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  TrendingUp,
  MessageSquare,
  Edit,
  ThumbsUp,
  ThumbsDown,
  Loader2
} from "lucide-react";

export default function BugDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bugId = parseInt(params.id as string);
  const [bug, setBug] = useState<Bug | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [correctSeverity, setCorrectSeverity] = useState<Severity | null>(null);
  const [correctTeam, setCorrectTeam] = useState<Team | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    async function loadBug() {
      try {
        setError(null);
        const bugData = await api.listBugs();
        const foundBug = bugData.find(b => b.id === bugId);
        if (foundBug) {
          setBug(foundBug);
        } else {
          setError("Bug not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load bug details");
      } finally {
        setLoading(false);
      }
    }
    loadBug();
  }, [bugId]);

  async function setBugStatus(status: Status) {
    if (!bug) return;
    await api.updateBug(bug.id, { status });
    const updatedBug = { ...bug, status };
    setBug(updatedBug);
  }

  async function submitFeedback() {
    if (!bug) return;
    setSubmittingFeedback(true);
    try {
      await api.submitFeedback(bug.id, {
        corrected_severity: correctSeverity || undefined,
        corrected_team: correctTeam || undefined,
      });
      setFeedbackSubmitted(true);
      setShowFeedback(false);
      // Reload bug to get updated data
      const bugData = await api.listBugs();
      const foundBug = bugData.find(b => b.id === bugId);
      if (foundBug) setBug(foundBug);
    } catch (err) {
      console.error("Failed to submit feedback", err);
    } finally {
      setSubmittingFeedback(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-12">
        <div className="space-y-6">
          <div className="w-1/3 h-8 bg-panel/50 rounded animate-pulse" />
          <div className="w-2/3 h-12 bg-panel/50 rounded animate-pulse" />
          <div className="w-full h-32 bg-panel/50 rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-panel/50 rounded animate-pulse" />
            <div className="h-24 bg-panel/50 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !bug) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-signal-critical/10 to-signal-critical/5 border border-signal-critical/30 backdrop-blur-sm shadow-2xl">
          <div className="relative">
            <h2 className="font-bold text-2xl mb-4 text-white">Bug not found</h2>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-6 py-3 rounded-xl bg-accent text-ink hover:bg-accent/90 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const confidenceLevel = bug.severity_confidence && bug.severity_confidence >= 80 ? "High" : 
                          bug.severity_confidence && bug.severity_confidence >= 60 ? "Medium" : "Low";

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button
        onClick={() => router.push("/")}
        className="inline-flex items-center gap-2 text-paper/50 hover:text-accent transition-colors mb-6 font-mono text-xs uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-panel/50 to-panel/30 border border-line/50 backdrop-blur-sm shadow-xl">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-sm text-accent font-semibold">BUG-{String(bug.id).padStart(5, '0')}</span>
                <StatusBadge status={bug.status} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">{bug.title}</h1>
              <div className="flex flex-wrap gap-3">
                <SeverityBadge severity={bug.final_severity || bug.predicted_severity} />
                <TeamBadge team={bug.final_team || bug.predicted_team} />
              </div>
            </div>
            <div className="flex gap-2">
              {(bug.status === "new" || bug.status === "triaged") && (
                <button
                  onClick={() => setBugStatus("assigned" as Status)}
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-xl bg-accent text-ink hover:bg-accent/90 transition-all duration-200"
                >
                  <Clock className="w-4 h-4" />
                  Assign
                </button>
              )}
              {bug.status === "assigned" && (
                <button
                  onClick={() => setBugStatus("in_progress" as Status)}
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-xl bg-accent text-ink hover:bg-accent/90 transition-all duration-200"
                >
                  <Clock className="w-4 h-4" />
                  Start
                </button>
              )}
              {bug.status === "in_progress" && (
                <button
                  onClick={() => setBugStatus("resolved" as Status)}
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-xl bg-accent text-ink hover:bg-accent/90 transition-all duration-200"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Resolve
                </button>
              )}
              {bug.status === "resolved" && (
                <button
                  onClick={() => setBugStatus("closed" as Status)}
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-xl bg-accent text-ink hover:bg-accent/90 transition-all duration-200"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Close
                </button>
              )}
              {bug.status === "closed" && (
                <button
                  onClick={() => setBugStatus("reopened" as Status)}
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-xl bg-signal-critical text-white hover:bg-signal-critical/90 transition-all duration-200"
                >
                  <AlertCircle className="w-4 h-4" />
                  Reopen
                </button>
              )}
            </div>
          </div>
        </div>

        {/* AI Analysis Card */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/30 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Brain className="w-5 h-5 text-accent" />
            </div>
            <h2 className="font-mono text-lg font-bold tracking-tight text-white">AI Triage Analysis</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-paper/60 text-sm font-mono uppercase tracking-wider">Severity Confidence</span>
                  <span className="text-accent font-bold">{bug.severity_confidence}%</span>
                </div>
                <div className="h-2 bg-panel/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all duration-500"
                    style={{ width: `${bug.severity_confidence}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {confidenceLevel === "High" ? (
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-signal-major" />
                  )}
                  <span className={`text-sm ${confidenceLevel === "High" ? "text-accent" : "text-signal-major"}`}>
                    {confidenceLevel} confidence
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-paper/60 text-sm font-mono uppercase tracking-wider">Team Confidence</span>
                  <span className="text-accent font-bold">{bug.team_confidence}%</span>
                </div>
                <div className="h-2 bg-panel/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all duration-500"
                    style={{ width: `${bug.team_confidence}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-panel/30 rounded-xl border border-line/50">
                <div className="text-paper/60 text-xs font-mono uppercase tracking-wider mb-1">Predicted Severity</div>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={bug.predicted_severity} />
                  {bug.final_severity && bug.final_severity !== bug.predicted_severity && (
                    <span className="text-xs text-paper/40">(overridden)</span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-panel/30 rounded-xl border border-line/50">
                <div className="text-paper/60 text-xs font-mono uppercase tracking-wider mb-1">Predicted Team</div>
                <div className="flex items-center gap-2">
                  <TeamBadge team={bug.predicted_team} />
                  {bug.final_team && bug.final_team !== bug.predicted_team && (
                    <span className="text-xs text-paper/40">(overridden)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Feedback Section */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-panel/50 to-panel/30 border border-line/50 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-panel/50 rounded-lg">
                <Brain className="w-5 h-5 text-paper/60" />
              </div>
              <h2 className="font-mono text-lg font-bold tracking-tight text-white">AI Classification Feedback</h2>
            </div>
            {!feedbackSubmitted && !showFeedback && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFeedback(true)}
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-lg border border-line/50 text-paper/70 hover:border-accent hover:text-accent transition-all duration-200"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Correct AI
                </button>
                <button
                  onClick={() => { setFeedbackSubmitted(true); }}
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-lg bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30 transition-all duration-200"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Correct
                </button>
              </div>
            )}
          </div>

          {feedbackSubmitted && (
            <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-xl border border-accent/30">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              <div>
                <p className="text-white font-medium">Feedback recorded</p>
                <p className="text-paper/50 text-sm">Thank you for helping improve the AI model.</p>
              </div>
            </div>
          )}

          {showFeedback && (
            <div className="space-y-4">
              <p className="text-paper/60 text-sm">AI classified this as:</p>
              <div className="flex gap-3">
                <SeverityBadge severity={bug.predicted_severity} />
                <TeamBadge team={bug.predicted_team} />
              </div>
              
              <div className="space-y-4 pt-4 border-t border-line/50">
                <div>
                  <label className="block text-paper/60 text-xs font-mono uppercase tracking-wider mb-2">Correct Severity</label>
                  <select
                    value={correctSeverity || ""}
                    onChange={(e) => setCorrectSeverity(e.target.value as Severity)}
                    className="w-full bg-panel/50 border border-line/50 rounded-lg px-4 py-2 text-paper focus:outline-none focus:border-accent transition-all duration-200"
                  >
                    <option value="">No change</option>
                    <option value="critical">Critical</option>
                    <option value="major">Major</option>
                    <option value="minor">Minor</option>
                    <option value="trivial">Trivial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-paper/60 text-xs font-mono uppercase tracking-wider mb-2">Correct Team</label>
                  <select
                    value={correctTeam || ""}
                    onChange={(e) => setCorrectTeam(e.target.value as Team)}
                    className="w-full bg-panel/50 border border-line/50 rounded-lg px-4 py-2 text-paper focus:outline-none focus:border-accent transition-all duration-200"
                  >
                    <option value="">No change</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="security">Security</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={submitFeedback}
                    disabled={submittingFeedback}
                    className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-lg bg-accent text-ink hover:bg-accent/90 transition-all duration-200 disabled:opacity-50"
                  >
                    {submittingFeedback ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Correction"
                    )}
                  </button>
                  <button
                    onClick={() => setShowFeedback(false)}
                    className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-lg border border-line/50 text-paper/70 hover:border-accent hover:text-accent transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="rounded-2xl p-6 bg-gradient-to-br from-panel/50 to-panel/30 border border-line/50 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-panel/50 rounded-lg">
              <MessageSquare className="w-5 h-5 text-paper/60" />
            </div>
            <h2 className="font-mono text-lg font-bold tracking-tight text-white">Description</h2>
          </div>
          <p className="text-paper/80 leading-relaxed whitespace-pre-wrap">{bug.description}</p>
        </div>

        {/* Metadata */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl p-5 bg-gradient-to-br from-panel/50 to-panel/30 border border-line/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-4 h-4 text-paper/50" />
              <span className="text-paper/60 text-xs font-mono uppercase tracking-wider">Created</span>
            </div>
            <div className="text-white font-medium">
              {new Date(bug.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>

          <div className="rounded-xl p-5 bg-gradient-to-br from-panel/50 to-panel/30 border border-line/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <User className="w-4 h-4 text-paper/50" />
              <span className="text-paper/60 text-xs font-mono uppercase tracking-wider">Reporter</span>
            </div>
            <div className="text-white font-medium">
              {bug.reporter || "Anonymous"}
            </div>
          </div>

          {bug.resolved_at && (
            <div className="rounded-xl p-5 bg-gradient-to-br from-panel/50 to-panel/30 border border-line/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span className="text-paper/60 text-xs font-mono uppercase tracking-wider">Resolved</span>
              </div>
              <div className="text-white font-medium">
                {new Date(bug.resolved_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
