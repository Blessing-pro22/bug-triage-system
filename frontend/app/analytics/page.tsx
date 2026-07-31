"use client";
import { useEffect, useState } from "react";
import { api, AIPerformance } from "@/lib/api";
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  PieChart
} from "lucide-react";

export default function AnalyticsPage() {
  const [performance, setPerformance] = useState<AIPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPerformance() {
      try {
        setError(null);
        const data = await api.getAIPerformance();
        setPerformance(data);
      } catch (err: any) {
        setError(err.message || "Failed to load AI performance data");
      } finally {
        setLoading(false);
      }
    }
    loadPerformance();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 sm:h-32 bg-panel/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-signal-critical/10 to-signal-critical/5 border border-signal-critical/30 backdrop-blur-sm shadow-2xl">
          <div className="relative">
            <h2 className="font-bold text-2xl mb-4 text-white">Unable to load analytics</h2>
            <p className="text-paper/60 mb-8">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-panel/50 to-panel/30 border border-line/50 backdrop-blur-sm shadow-xl">
          <div className="relative">
            <h2 className="font-bold text-2xl mb-4 text-white">No performance data available</h2>
            <p className="text-paper/60">Submit some bug reports to see AI performance metrics.</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle case where there are no predictions (all zeros)
  if (performance.total_predictions === 0) {
    return (
      <div className="animate-fade-in">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-accent/20 rounded-xl">
              <Brain className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="font-mono text-3xl font-bold tracking-tight text-white">AI Model Performance</h1>
              <p className="text-paper/50 text-sm">Track how well the AI classification system is performing</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-panel/50 to-panel/30 border border-line/50 backdrop-blur-sm shadow-xl">
          <div className="relative text-center">
            <div className="inline-flex flex-col items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center border border-accent/30">
                <Brain className="w-10 h-10 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-2">No data available yet</h3>
                <p className="text-paper/50 text-sm max-w-md">
                  Submit some bug reports to start tracking AI performance metrics. The system needs data to calculate accuracy, precision, recall, and F1 score.
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/submit'}
              className="inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-accent/80 text-ink hover:from-accent/90 hover:to-accent/70 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Submit First Bug Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: "Classification Accuracy",
      value: `${performance.classification_accuracy.toFixed(1)}%`,
      icon: <Target className="w-5 h-5" />,
      color: "text-accent",
      bgColor: "from-accent/10 to-accent/5",
      borderColor: "border-accent/30"
    },
    {
      label: "Precision",
      value: `${performance.precision.toFixed(1)}%`,
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "text-[#2DD4BF]",
      bgColor: "from-[#2DD4BF]/10 to-[#2DD4BF]/5",
      borderColor: "border-[#2DD4BF]/30"
    },
    {
      label: "Recall",
      value: `${performance.recall.toFixed(1)}%`,
      icon: <Activity className="w-5 h-5" />,
      color: "text-[#F4D35E]",
      bgColor: "from-[#F4D35E]/10 to-[#F4D35E]/5",
      borderColor: "border-[#F4D35E]/30"
    },
    {
      label: "F1 Score",
      value: performance.f1_score.toFixed(3),
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-[#FF9F43]",
      bgColor: "from-[#FF9F43]/10 to-[#FF9F43]/5",
      borderColor: "border-[#FF9F43]/30"
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-accent/20 rounded-xl">
            <Brain className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="font-mono text-3xl font-bold tracking-tight text-white">AI Model Performance</h1>
            <p className="text-paper/50 text-sm">Track how well the AI classification system is performing</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-xl p-4 sm:p-6 bg-gradient-to-br ${metric.bgColor} border ${metric.borderColor} backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300`}
          >
            <div className="absolute top-0 right-0 p-3 opacity-10">
              {metric.icon}
            </div>
            <div className={`font-mono text-2xl sm:text-3xl font-bold ${metric.color} mb-2`}>{metric.value}</div>
            <div className="text-paper/60 text-[10px] sm:text-xs font-mono uppercase tracking-wider flex items-center gap-2">
              <span className={metric.color}>{metric.icon}</span>
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Stats */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
        <div className="rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-panel/50 to-panel/30 border border-line/50 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 bg-panel/50 rounded-lg">
              <BarChart3 className="w-4 sm:w-5 h-4 sm:h-5 text-paper/60" />
            </div>
            <h2 className="font-mono text-base sm:text-lg font-bold tracking-tight text-white">Prediction Statistics</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-panel/30 rounded-xl border border-line/50">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Activity className="w-3 sm:w-4 h-3 sm:h-4 text-accent" />
                </div>
                <span className="text-paper/80 text-xs sm:text-sm">Total Predictions</span>
              </div>
              <span className="font-mono text-lg sm:text-xl font-bold text-white">{performance.total_predictions}</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-panel/30 rounded-xl border border-line/50">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <CheckCircle2 className="w-3 sm:w-4 h-3 sm:h-4 text-accent" />
                </div>
                <span className="text-paper/80 text-xs sm:text-sm">Correct Predictions</span>
              </div>
              <span className="font-mono text-lg sm:text-xl font-bold text-accent">{performance.correct_predictions}</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-panel/30 rounded-xl border border-line/50">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-signal-major/20 rounded-lg">
                  <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4 text-signal-major" />
                </div>
                <span className="text-paper/80 text-xs sm:text-sm">Human Corrections</span>
              </div>
              <span className="font-mono text-lg sm:text-xl font-bold text-signal-major">{performance.human_corrections}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-panel/50 to-panel/30 border border-line/50 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 bg-panel/50 rounded-lg">
              <PieChart className="w-4 sm:w-5 h-4 sm:h-5 text-paper/60" />
            </div>
            <h2 className="font-mono text-base sm:text-lg font-bold tracking-tight text-white">Model Health</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-paper/60 text-xs sm:text-sm">Accuracy Trend</span>
                <span className="text-accent font-mono text-xs sm:text-sm">+2.3%</span>
              </div>
              <div className="h-2 bg-panel/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all duration-500" style={{ width: '78%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-paper/60 text-xs sm:text-sm">Confidence Score</span>
                <span className="text-[#2DD4BF] font-mono text-xs sm:text-sm">High</span>
              </div>
              <div className="h-2 bg-panel/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#2DD4BF] to-[#2DD4BF]/70 transition-all duration-500" style={{ width: '85%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-paper/60 text-xs sm:text-sm">Training Progress</span>
                <span className="text-[#F4D35E] font-mono text-xs sm:text-sm">In Progress</span>
              </div>
              <div className="h-2 bg-panel/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#F4D35E] to-[#F4D35E]/70 transition-all duration-500" style={{ width: '62%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/30 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className="p-3 bg-accent/20 rounded-xl shrink-0">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white mb-2">About AI Performance Metrics</h3>
            <div className="text-paper/70 text-xs sm:text-sm space-y-2">
              <p><strong>Classification Accuracy:</strong> Percentage of correct predictions across all classifications.</p>
              <p><strong>Precision:</strong> How many selected items are relevant (true positives / (true positives + false positives)).</p>
              <p><strong>Recall:</strong> How many relevant items are selected (true positives / (true positives + false negatives)).</p>
              <p><strong>F1 Score:</strong> Harmonic mean of precision and recall, providing a balanced measure.</p>
              <p className="mt-4 text-accent">Human corrections help improve the model over time through continuous learning.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
