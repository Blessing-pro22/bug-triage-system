"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, Bug } from "@/lib/api";
import { SeverityBadge, TeamBadge } from "@/components/Badges";

export default function SubmitPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reporter, setReporter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Bug | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const bug = await api.submitBug({ title, description, reporter: reporter || undefined });
      setResult(bug);
    } catch (err: any) {
      setError(err.message || "Something went wrong submitting the report.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="border border-accent/30 bg-accent/5 rounded-md p-6 text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-accent mb-3">Triaged automatically</p>
          <h2 className="font-medium text-lg mb-4">{result.title}</h2>
          <div className="flex justify-center gap-2 mb-4">
            <SeverityBadge severity={result.predicted_severity} />
            <TeamBadge team={result.predicted_team} />
          </div>
          <p className="font-mono text-[11px] text-paper/40 mb-6">
            confidence: severity {result.severity_confidence}% · team {result.team_confidence}%
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-sm bg-accent text-ink hover:opacity-90 transition-opacity"
            >
              View queue
            </button>
            <button
              onClick={() => { setResult(null); setTitle(""); setDescription(""); setReporter(""); }}
              className="font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-sm border border-line text-paper/70 hover:border-accent hover:text-accent transition-colors"
            >
              Report another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-mono text-2xl font-medium tracking-tight mb-1">Report a bug</h1>
      <p className="text-paper/50 text-sm mb-8">
        Describe what happened. Severity and owning team are assigned the moment you submit.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Title">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Checkout button unresponsive on Safari"
            className="w-full bg-panel border border-line rounded-sm px-3 py-2.5 text-paper placeholder:text-paper/25 focus:outline-none focus:border-accent"
          />
        </Field>

        <Field label="Description">
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you expect to happen, and what happened instead? Include steps to reproduce if you have them."
            className="w-full bg-panel border border-line rounded-sm px-3 py-2.5 text-paper placeholder:text-paper/25 focus:outline-none focus:border-accent resize-none"
          />
        </Field>

        <Field label="Your name (optional)">
          <input
            value={reporter}
            onChange={(e) => setReporter(e.target.value)}
            placeholder="e.g. jane_qa"
            className="w-full bg-panel border border-line rounded-sm px-3 py-2.5 text-paper placeholder:text-paper/25 focus:outline-none focus:border-accent"
          />
        </Field>

        {error && (
          <p className="font-mono text-xs text-signal-critical">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full font-mono text-xs uppercase tracking-wider px-4 py-3 rounded-sm bg-accent text-ink hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? "Classifying…" : "Submit report"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block font-mono text-[11px] uppercase tracking-wider text-paper/40 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
