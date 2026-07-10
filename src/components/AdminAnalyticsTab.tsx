import React, { useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import { Download, RefreshCw } from "lucide-react";
import { AdminAnalyticsResponse } from "../types";

type AnalyticsFilter = "daily" | "weekly" | "monthly";

interface AdminAnalyticsTabProps {
  analytics: AdminAnalyticsResponse | null;
  isLoading: boolean;
  filter: AnalyticsFilter;
  onFilterChange: (filter: AnalyticsFilter) => void;
  onRefresh: () => void;
  onExportCsv: () => void;
}

function toWeekKey(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function toMonthKey(isoDate: string) {
  return isoDate.slice(0, 7);
}

export default function AdminAnalyticsTab({
  analytics,
  isLoading,
  filter,
  onFilterChange,
  onRefresh,
  onExportCsv,
}: AdminAnalyticsTabProps) {
  const chartRows = useMemo(() => {
    if (!analytics) {
      return [];
    }

    if (filter === "daily") {
      return analytics.swipesByDay;
    }

    const buckets = new Map<string, { day: string; total: number; right: number; left: number; uniqueActors: number }>();
    for (const row of analytics.swipesByDay) {
      const key = filter === "weekly" ? toWeekKey(row.day) : toMonthKey(row.day);
      const existing = buckets.get(key) || { day: key, total: 0, right: 0, left: 0, uniqueActors: 0 };
      existing.total += row.total;
      existing.right += row.right;
      existing.left += row.left;
      existing.uniqueActors = Math.max(existing.uniqueActors, row.uniqueActors);
      buckets.set(key, existing);
    }

    return Array.from(buckets.values()).sort((a, b) => a.day.localeCompare(b.day));
  }, [analytics, filter]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      <div className="bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D] rounded-2xl p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Platform Admin Analytics</h2>
            <p className="text-xs text-[#8B949E] mt-1">
              Global performance telemetry and cross-user behavior analytics for the full platform.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-xl p-1">
              {(["daily", "weekly", "monthly"] as AnalyticsFilter[]).map((item) => (
                <button
                  key={item}
                  onClick={() => onFilterChange(item)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    filter === item
                      ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                      : "text-[#8B949E] hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              onClick={onExportCsv}
              disabled={!analytics}
              className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-100 dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-xl p-3">
              <p className="text-[10px] text-[#8B949E] uppercase font-bold tracking-wider">Users</p>
              <p className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">{analytics.totals.users}</p>
            </div>
            <div className="bg-slate-100 dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-xl p-3">
              <p className="text-[10px] text-[#8B949E] uppercase font-bold tracking-wider">Swipe Events</p>
              <p className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">{analytics.totals.swipeEvents}</p>
            </div>
            <div className="bg-slate-100 dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-xl p-3">
              <p className="text-[10px] text-[#8B949E] uppercase font-bold tracking-wider">Signed Users</p>
              <p className="text-xl font-black text-blue-400 font-mono mt-1">{analytics.uniqueActors.uniqueAuthenticatedUsers}</p>
            </div>
            <div className="bg-slate-100 dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-xl p-3">
              <p className="text-[10px] text-[#8B949E] uppercase font-bold tracking-wider">Guest Sessions</p>
              <p className="text-xl font-black text-amber-400 font-mono mt-1">{analytics.uniqueActors.uniqueGuestSessions}</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-sm text-[#8B949E] py-6 text-center">Loading analytics...</div>
        )}

        {!isLoading && analytics && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-slate-100 dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-2xl p-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Swipe Volume Trend ({filter})</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartRows} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                    <XAxis dataKey="day" stroke="#8B949E" fontSize={11} tickLine={false} />
                    <YAxis stroke="#8B949E" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2.2} name="Total Swipes" dot={false} />
                    <Line type="monotone" dataKey="right" stroke="#3B82F6" strokeWidth={2} name="Right Swipes" dot={false} />
                    <Line type="monotone" dataKey="left" stroke="#EF4444" strokeWidth={2} name="Left Swipes" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-2xl p-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Top Categories By Swipe Volume</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topCategories} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                    <XAxis dataKey="category" stroke="#8B949E" fontSize={10} tickLine={false} />
                    <YAxis stroke="#8B949E" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} name="Swipe Events" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
