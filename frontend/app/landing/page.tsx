"use client";
import { useRouter } from "next/navigation";
import { Brain, Zap, BarChart3, ArrowRight, CheckCircle2, Shield, Target } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full border border-accent/30 mb-6">
              <Brain className="w-4 h-4 text-accent" />
              <span className="text-accent font-mono text-xs uppercase tracking-wider">AI-Powered Bug Triage</span>
            </div>
            <h1 className="font-mono text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
              Report. Analyze. Prioritize. Resolve.
            </h1>
            <p className="text-paper/60 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Intelligent bug classification and prioritization system that automatically categorizes and routes bug reports using machine learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/submit")}
                className="inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider px-8 py-4 rounded-xl bg-gradient-to-r from-accent to-accent/80 text-ink hover:from-accent/90 hover:to-accent/70 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Zap className="w-5 h-5" />
                Report a Bug
              </button>
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider px-8 py-4 rounded-xl border border-line/50 text-paper/70 hover:border-accent hover:text-accent hover:bg-accent/10 transition-all duration-200"
              >
                <BarChart3 className="w-5 h-5" />
                View Dashboard
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <FeatureCard
              icon={<Brain className="w-6 h-6" />}
              title="AI-Powered Classification"
              description="Automatically categorize and prioritize incoming bug reports using advanced machine learning models."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Human-in-the-Loop"
              description="Developers can correct AI predictions and improve future classifications through continuous learning."
            />
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title="Analytics Dashboard"
              description="Track bugs, severity, resolution times, and AI model performance with comprehensive analytics."
            />
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="font-mono text-3xl font-bold tracking-tight text-white text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <StepCard
                step="1"
                title="Submit Bug"
                description="Report an issue with title, description, and optional details."
              />
              <StepCard
                step="2"
                title="AI Analysis"
                description="Our ML model analyzes and classifies severity and team assignment."
              />
              <StepCard
                step="3"
                title="Review & Assign"
                description="Review AI predictions and correct if needed before assignment."
              />
              <StepCard
                step="4"
                title="Track Progress"
                description="Monitor resolution progress and provide feedback for improvement."
              />
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <StatCard value="91.4%" label="Classification Accuracy" />
            <StatCard value="2.3s" label="Avg. Classification Time" />
            <StatCard value="24/7" label="Automated Processing" />
          </div>

          {/* CTA Section */}
          <div className="relative overflow-hidden rounded-2xl p-12 bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 backdrop-blur-sm shadow-2xl text-center">
            <div className="relative">
              <h2 className="font-mono text-3xl font-bold tracking-tight text-white mb-4">Ready to streamline your bug triage?</h2>
              <p className="text-paper/70 mb-8 max-w-xl mx-auto">
                Join teams already using AI-powered bug classification to save time and improve accuracy.
              </p>
              <button
                onClick={() => router.push("/submit")}
                className="inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider px-8 py-4 rounded-xl bg-gradient-to-r from-accent to-accent/80 text-ink hover:from-accent/90 hover:to-accent/70 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-panel/50 to-panel/30 border border-line/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="p-3 bg-accent/20 rounded-xl w-fit mb-4 text-accent">
        {icon}
      </div>
      <h3 className="font-semibold text-lg text-white mb-2">{title}</h3>
      <p className="text-paper/60 text-sm">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="relative">
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-ink font-bold text-sm">
        {step}
      </div>
      <div className="p-6 rounded-2xl bg-gradient-to-br from-panel/50 to-panel/30 border border-line/50 backdrop-blur-sm shadow-lg pt-8">
        <h3 className="font-semibold text-lg text-white mb-2">{title}</h3>
        <p className="text-paper/60 text-sm">{description}</p>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-panel/50 to-panel/30 border border-line/50 backdrop-blur-sm shadow-lg text-center">
      <div className="font-mono text-4xl font-bold text-accent mb-2">{value}</div>
      <div className="text-paper/60 text-sm font-mono uppercase tracking-wider">{label}</div>
    </div>
  );
}
