"use client";
import { useEffect, useState } from "react";
import { api, ActivityLog as ActivityLogType } from "@/lib/api";
import { 
  Activity, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Edit,
  Brain,
  ArrowRight
} from "lucide-react";

export default function ActivityLog() {
  const [activities, setActivities] = useState<ActivityLogType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        const data = await api.getActivityLog();
        setActivities(data.slice(0, 10)); // Show last 10 activities
      } catch (err) {
        console.error("Failed to load activity log", err);
      } finally {
        setLoading(false);
      }
    }
    loadActivities();
  }, []);

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "status_changed":
        return <Edit className="w-4 h-4 text-[#F4D35E]" />;
      case "ai_classified":
        return <Brain className="w-4 h-4 text-accent" />;
      case "bug_resolved":
        return <CheckCircle2 className="w-4 h-4 text-[#2DD4BF]" />;
      case "bug_created":
        return <AlertCircle className="w-4 h-4 text-signal-major" />;
      default:
        return <Activity className="w-4 h-4 text-paper/50" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="rounded-2xl p-6 bg-gradient-to-br from-panel/50 to-panel/30 border border-line/50 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-panel/50 rounded-lg">
            <Activity className="w-5 h-5 text-paper/60" />
          </div>
          <h2 className="font-mono text-lg font-bold tracking-tight text-white">Recent Activity</h2>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-panel/30 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 bg-gradient-to-br from-panel/50 to-panel/30 border border-line/50 backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-panel/50 rounded-lg">
            <Activity className="w-5 h-5 text-paper/60" />
          </div>
          <h2 className="font-mono text-lg font-bold tracking-tight text-white">Recent Activity</h2>
        </div>
        <span className="text-paper/40 text-xs font-mono uppercase tracking-wider">Last 10 events</span>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-paper/20 mx-auto mb-3" />
          <p className="text-paper/40 text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-4 bg-panel/30 rounded-xl border border-line/30 hover:border-line/50 transition-colors"
            >
              <div className="p-2 bg-panel/50 rounded-lg shrink-0">
                {getActionIcon(activity.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-paper/80 text-sm mb-1">{activity.details}</p>
                <div className="flex items-center gap-3 text-paper/40 text-xs">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {activity.user}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(activity.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
