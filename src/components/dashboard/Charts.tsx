"use client";

import { useSyncExternalStore } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = ["#3377f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];

const CHART_HEIGHT = 260;

const emptySubscribe = () => () => {};

/** True on the client (after hydration), false during SSR and the first paint. */
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/**
 * Recharts measures the DOM to size its SVG, so its server markup never matches
 * the client's first paint and React reports a hydration mismatch. Rendering an
 * equally-sized placeholder until after hydration keeps SSR and the first client
 * render identical, then swaps in the real chart on the client only.
 */
function ChartFrame({ children }: { children: React.ReactNode }) {
  const isClient = useIsClient();

  if (!isClient) {
    return <div style={{ width: "100%", height: CHART_HEIGHT }} aria-hidden="true" />;
  }
  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      {children as React.ReactElement}
    </ResponsiveContainer>
  );
}

export function PostingActivityChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <ChartFrame>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#3377f6" strokeWidth={2} dot={false} name="Posting" />
      </LineChart>
    </ChartFrame>
  );
}

export function VisitorChart({ data }: { data: { date: string; visits: number }[] }) {
  return (
    <ChartFrame>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="visits" fill="#3377f6" radius={[4, 4, 0, 0]} name="Pengunjung" />
      </BarChart>
    </ChartFrame>
  );
}

export function UsersByRoleChart({ data }: { data: { role: string; count: number }[] }) {
  return (
    <ChartFrame>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={90} label>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ChartFrame>
  );
}

export function ArticleVolumeChart({ data }: { data: { category: string; count: number }[] }) {
  return (
    <ChartFrame>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, bottom: 0, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={90} />
        <Tooltip />
        <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} name="Berita" />
      </BarChart>
    </ChartFrame>
  );
}
