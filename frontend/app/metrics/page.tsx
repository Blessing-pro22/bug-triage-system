"use client";

import { useEffect, useState } from "react";

interface MetricsData {
  severity_accuracy: number;
  team_accuracy: number;
  pipeline_info: {
    dataset_name: string;
    total_samples: number;
    algorithm: string;
    vectorizer: string;
    imbalance_handling: string;
    team_distribution: Record<string, number>;
  };
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    fetch(`${API_URL}/api/metrics`)
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load metrics:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-200">Loading ML Model Metrics...</div>;
  }

  if (!metrics) {
    return <div className="p-8 text-red-400">Failed to load ML metrics file.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-teal-400">
          🤖 ML Model Health & Analytics
        </h1>
        <p className="text-slate-400 mt-1">
          Quantitative evaluation, feature extraction specs, and class distribution insights.
        </p>
      </div>

      {/* Top KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <span className="text-xs text-slate-400 uppercase font-semibold">Severity Accuracy</span>
          <div className="text-3xl font-extrabold text-teal-300 mt-2">
            {(metrics.severity_accuracy * 100).toFixed(2)}%
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Trained on 4,706 reports</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <span className="text-xs text-slate-400 uppercase font-semibold">Team Routing Accuracy</span>
          <div className="text-3xl font-extrabold text-teal-300 mt-2">
            {(metrics.team_accuracy * 100).toFixed(2)}%
          </div>
          <span className="text-xs text-slate-500 mt-1 block">4-Class Domain Routing</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <span className="text-xs text-slate-400 uppercase font-semibold">Training Dataset</span>
          <div className="text-3xl font-extrabold text-slate-100 mt-2">
            {metrics.pipeline_info.total_samples.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Mozilla + Apache Records</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <span className="text-xs text-slate-400 uppercase font-semibold">Core Model</span>
          <div className="text-lg font-bold text-slate-200 mt-2">
            LinearSVC + TF-IDF
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Unigrams + Bigrams (1-2)</span>
        </div>
      </div>

      {/* Class Distribution & Imbalance Handling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4">
            📊 Training Set Class Distribution
          </h2>
          <div className="space-y-4">
            {Object.entries(metrics.pipeline_info.team_distribution).map(([team, count]) => {
              const percentage = ((count / metrics.pipeline_info.total_samples) * 100).toFixed(1);
              return (
                <div key={team}>
                  <div className="flex justify-between text-sm font-medium mb-1 capitalize">
                    <span className="text-slate-300">{team}</span>
                    <span className="text-slate-400">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div
                      className="bg-teal-500 h-2.5 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technical Mitigation Explainer Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-200">
            ⚙️ Algorithmic Mitigations & Pipeline Design
          </h2>
          <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
            <p>
              <strong className="text-teal-400">Class Imbalance Resolution:</strong> Backend defects comprise over 63% of raw data, while Mobile accounts for 1.2%. We implemented cost-sensitive learning via <code className="bg-slate-800 text-teal-300 px-1.5 py-0.5 rounded">class_weight='balanced'</code> during SVM loss minimization.
            </p>
            <p>
              <strong className="text-teal-400">Hybrid Fast-Path Routing:</strong> To guarantee high precision on minority classes without model starvation, the inference engine applies deterministic domain overrides for critical tokens (e.g., <em>iOS, Android, SQL Injection, Typo</em>).
            </p>
            <p>
              <strong className="text-teal-400">Sublinear Term Frequency:</strong> Scaled TF-IDF vectors restrict high-frequency repetitive words from overwhelming rare feature signals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}