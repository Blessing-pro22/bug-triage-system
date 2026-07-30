"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, Bug } from "@/lib/api";
import { SeverityBadge, TeamBadge } from "@/components/Badges";
import { Send, Plus, ArrowRight, CheckCircle2, AlertCircle, Brain, Loader2 } from "lucide-react";

export default function SubmitPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [environment, setEnvironment] = useState("");
  const [reporter, setReporter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Bug | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setAnalyzing(true);
    setError(null);
    try {
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      const bug = await api.submitBug({ title, description, reporter: reporter || undefined });
      setAnalyzing(false);
      setResult(bug);
    } catch (err: any) {
      setAnalyzing(false);
      setError(err.message || "Something went wrong submitting the report.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/30 backdrop-blur-sm shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <CheckCircle2 className="w-24 h-24 text-accent" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full border border-accent/30 mb-6">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <p className="font-mono text-xs uppercase tracking-wider text-accent">Triaged automatically</p>
            </div>
            <h2 className="font-bold text-2xl mb-4 text-white">{result.title}</h2>
            <div className="flex justify-center gap-3 mb-6">
              <SeverityBadge severity={result.predicted_severity} />
              <TeamBadge team={result.predicted_team} />
            </div>
            <p className="font-mono text-xs text-paper/40 mb-8">
              confidence: severity {result.severity_confidence}% · team {result.team_confidence}%
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider px-6 py-3 rounded-xl bg-accent text-ink hover:bg-accent/90 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                View queue
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setResult(null); setTitle(""); setDescription(""); setReporter(""); }}
                className="inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider px-6 py-3 rounded-xl border border-line/50 text-paper/70 hover:border-accent hover:text-accent hover:bg-accent/10 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Report another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-mono text-3xl font-bold tracking-tight mb-3 text-white">Report a bug</h1>
        <p className="text-paper/50 text-sm max-w-md">
          Describe what happened. Severity and owning team are assigned the moment you submit using AI-powered classification.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Field label="Title">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Checkout button unresponsive on Safari"
            className="w-full bg-panel/50 border border-line/50 rounded-xl px-4 py-3.5 text-paper placeholder:text-paper/25 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all duration-200 font-sans"
          />
        </Field>

        <Field label="Description">
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what happened in detail..."
            className="w-full bg-panel/50 border border-line/50 rounded-xl px-4 py-3.5 text-paper placeholder:text-paper/25 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all duration-200 resize-none font-sans"
          />
        </Field>

        <Field label="Steps to reproduce (optional)">
          <textarea
            rows={3}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="1. Open login page
2. Enter credentials
3. Click login button"
            className="w-full bg-panel/50 border border-line/50 rounded-xl px-4 py-3.5 text-paper placeholder:text-paper/25 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all duration-200 resize-none font-sans"
          />
        </Field>

        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Expected result (optional)">
            <input
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              placeholder="User should be logged in"
              className="w-full bg-panel/50 border border-line/50 rounded-xl px-4 py-3.5 text-paper placeholder:text-paper/25 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all duration-200 font-sans"
            />
          </Field>

          <Field label="Actual result (optional)">
            <input
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              placeholder="Login fails with error message"
              className="w-full bg-panel/50 border border-line/50 rounded-xl px-4 py-3.5 text-paper placeholder:text-paper/25 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all duration-200 font-sans"
            />
          </Field>
        </div>

        <Field label="Environment (optional)">
          <input
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            placeholder="Browser: Chrome, OS: Windows 11, Version: 2.4.1"
            className="w-full bg-panel/50 border border-line/50 rounded-xl px-4 py-3.5 text-paper placeholder:text-paper/25 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all duration-200 font-sans"
          />
        </Field>

        <Field label="Your name (optional)">
          <input
            value={reporter}
            onChange={(e) => setReporter(e.target.value)}
            placeholder="e.g. jane_qa"
            className="w-full bg-panel/50 border border-line/50 rounded-xl px-4 py-3.5 text-paper placeholder:text-paper/25 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all duration-200 font-sans"
          />
        </Field>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-signal-critical/10 border border-signal-critical/30 rounded-xl">
            <AlertCircle className="w-4 h-4 text-signal-critical" />
            <p className="font-mono text-xs text-signal-critical">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider px-6 py-4 rounded-xl bg-gradient-to-r from-accent to-accent/80 text-ink hover:from-accent/90 hover:to-accent/70 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              AI is analyzing your report...
            </>
          ) : submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit report
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block font-mono text-xs uppercase tracking-wider text-paper/40 mb-2 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
        {label}
      </span>
      {children}
    </label>
  );
}
