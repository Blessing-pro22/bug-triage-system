"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import { AnalyticsSummary, TrendPoint } from "@/lib/api";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#FF4D4F",
  major: "#FF9F43",
  minor: "#F4D35E",
  trivial: "#5B6672",
};

const tooltipStyle = {
  backgroundColor: "#12181F",
  border: "1px solid #212A33",
  borderRadius: 4,
  fontSize: 12,
  fontFamily: "JetBrains Mono, monospace",
  color: "#E7ECF0",
};

export function SeverityBreakdown({ data }: { data: AnalyticsSummary["by_severity"] }) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          stroke="none"
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || "#5B6672"} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TeamLoadChart({ data }: { data: AnalyticsSummary["by_team"] }) {
  const chartData = Object.entries(data).map(([name, count]) => ({ name, count }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData}>
        <CartesianGrid stroke="#212A33" vertical={false} />
        <XAxis dataKey="name" stroke="#5B6672" fontSize={11} tickLine={false} axisLine={{ stroke: "#212A33" }} />
        <YAxis stroke="#5B6672" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#2DD4BF10" }} />
        <Bar dataKey="count" fill="#2DD4BF" radius={[3, 3, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid stroke="#212A33" vertical={false} />
        <XAxis dataKey="day" stroke="#5B6672" fontSize={10} tickLine={false} axisLine={{ stroke: "#212A33" }} />
        <YAxis stroke="#5B6672" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="count" stroke="#FF9F43" strokeWidth={2} dot={{ r: 3, fill: "#FF9F43" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
