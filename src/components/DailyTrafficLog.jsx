import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Calendar,
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Inbox,
  AlertCircle,
  Car,
  Filter,
  Activity,
  Menu,
  Server,
  BarChart2,
  Users,
} from "lucide-react";
import Sidebar from "./Sidebar";

// =====================================================
// CONFIG & CONSTANTS
// =====================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SORT_OPTIONS = [
  {
    value: "date-desc",
    label: "Newest Date First",
    sortBy: "date",
    order: "desc",
  },
  {
    value: "date-asc",
    label: "Oldest Date First",
    sortBy: "date",
    order: "asc",
  },
  {
    value: "total_requests-desc",
    label: "Most Requests",
    sortBy: "total_requests",
    order: "desc",
  },
  {
    value: "total_requests-asc",
    label: "Least Requests",
    sortBy: "total_requests",
    order: "asc",
  },
  {
    value: "unique_ips-desc",
    label: "Most Unique IPs",
    sortBy: "unique_ips",
    order: "desc",
  },
  {
    value: "unique_ips-asc",
    label: "Least Unique IPs",
    sortBy: "unique_ips",
    order: "asc",
  },
];

function formatDateDisplay(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// =====================================================
// REUSABLE INPUT & SELECT COMPONENTS
// =====================================================

function FieldInput({ icon: Icon, ...props }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-[#1A2330] px-3 focus-within:ring-2 focus-within:ring-cyan-400/60">
      <Icon size={16} className="shrink-0 text-gray-400" />
      <input
        {...props}
        className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-gray-500 outline-none"
      />
    </div>
  );
}

function FieldSelect({ icon: Icon, value, onChange, options }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-[#1A2330] px-3 focus-within:ring-2 focus-within:ring-cyan-400/60">
      <Icon size={16} className="shrink-0 text-gray-400" />
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none bg-transparent py-2.5 text-sm text-white outline-none [&>option]:bg-[#111822]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// =====================================================
// MAIN DAILY TRAFFIC COMPONENT
// =====================================================

export default function DailyTrafficLog() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter & Search States
  const [searchDate, setSearchDate] = useState("");
  const [minRequests, setMinRequests] = useState("");
  const [sortValue, setSortValue] = useState("date-desc");
  const [page, setPage] = useState(1);
  const limit = 25;

  // Data States
  const [rawLogs, setRawLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const activeSort = useMemo(
    () => SORT_OPTIONS.find((o) => o.value === sortValue) || SORT_OPTIONS[0],
    [sortValue],
  );

  // Fetch raw daily traffic logs on mount
  const fetchDailyTraffic = useCallback(async (signal) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/traffic/fetchDailyTraffic`, {
        signal,
      });

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const json = await res.json();
      const fetchedData = Array.isArray(json) ? json : json.data || [];
      setRawLogs(fetchedData);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Could not load daily traffic data");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchDailyTraffic(controller.signal);
    return () => controller.abort();
  }, [fetchDailyTraffic]);

  // Reset page when filter inputs change
  useEffect(() => {
    setPage(1);
  }, [searchDate, minRequests, sortValue]);

  // FRONTEND FILTERING
  const filteredLogs = useMemo(() => {
    return rawLogs.filter((log) => {
      // Date Filter
      if (
        searchDate.trim() &&
        !log.date?.toLowerCase().includes(searchDate.trim().toLowerCase())
      ) {
        return false;
      }

      // Min Requests Filter
      if (minRequests && Number(log.total_requests) < Number(minRequests)) {
        return false;
      }

      return true;
    });
  }, [rawLogs, searchDate, minRequests]);

  // FRONTEND SORTING
  const sortedLogs = useMemo(() => {
    const logsCopy = [...filteredLogs];
    const { sortBy, order } = activeSort;

    return logsCopy.sort((a, b) => {
      let valA = a[sortBy] ?? "";
      let valB = b[sortBy] ?? "";

      if (sortBy === "date") {
        valA = new Date(valA).getTime() || 0;
        valB = new Date(valB).getTime() || 0;
      } else {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }

      if (valA < valB) return order === "asc" ? -1 : 1;
      if (valA > valB) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredLogs, activeSort]);

  // FRONTEND PAGINATION
  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / limit));
  const currentPageLogs = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return sortedLogs.slice(startIndex, startIndex + limit);
  }, [sortedLogs, page, limit]);

  const hasFilters = searchDate || minRequests || sortValue !== "date-desc";

  const clearFilters = () => {
    setSearchDate("");
    setMinRequests("");
    setSortValue("date-desc");
  };

  // Aggregated Summary Stats
  const totalRequestsSum = useMemo(
    () =>
      sortedLogs.reduce(
        (acc, curr) => acc + (Number(curr.total_requests) || 0),
        0,
      ),
    [sortedLogs],
  );

  const avgUniqueIps = useMemo(() => {
    if (!sortedLogs.length) return 0;
    const totalIps = sortedLogs.reduce(
      (acc, curr) => acc + (Number(curr.unique_ips) || 0),
      0,
    );
    return Math.round(totalIps / sortedLogs.length);
  }, [sortedLogs]);

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white md:flex">
      {/* SIDEBAR */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* MAIN WRAPPER */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* MOBILE TOPBAR */}
        <header className="flex items-center justify-between border-b border-white/5 bg-[#0B0F14] px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <Car className="text-cyan-400" size={22} />
            <span className="font-semibold text-white">SmartRide</span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar menu"
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <Menu size={22} />
          </button>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* HEADER */}
            <div>
              <h1 className="text-xl font-bold text-white md:text-2xl">
                Daily Traffic Aggregates
              </h1>
              <p className="text-sm text-gray-400">
                View day-by-day aggregated site traffic and unique visitor
                counts.
              </p>
            </div>

            {/* STAT STRIP */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatChip
                icon={Calendar}
                label="Days Logged"
                value={sortedLogs.length}
              />
              <StatChip
                icon={BarChart2}
                label="Total Cumulative Requests"
                value={totalRequestsSum.toLocaleString()}
              />
              <StatChip
                icon={Users}
                label="Avg Unique IPs / Day"
                value={avgUniqueIps.toLocaleString()}
              />
            </div>

            {/* FILTER BAR */}
            <div className="rounded-2xl border border-white/5 bg-[#111822] p-4 shadow-lg md:p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Search by Date */}
                <FieldInput
                  icon={Calendar}
                  type="text"
                  placeholder="Filter by Date (e.g. 2026-09-11)"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />

                {/* Min Requests */}
                <FieldInput
                  icon={Filter}
                  type="number"
                  placeholder="Min. Total Requests"
                  value={minRequests}
                  onChange={(e) => setMinRequests(e.target.value)}
                />

                {/* Sorting Dropdown */}
                <FieldSelect
                  icon={ArrowDownUp}
                  value={sortValue}
                  onChange={(e) => setSortValue(e.target.value)}
                  options={SORT_OPTIONS}
                />
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
                >
                  <RotateCcw size={14} />
                  Clear filters
                </button>
              )}
            </div>

            {/* ERROR DISPLAY */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            {/* CONTENT VIEWS */}
            {loading ? (
              <LoadingState />
            ) : currentPageLogs.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Desktop / Tablet Table View */}
                <div className="hidden overflow-x-auto rounded-2xl border border-white/5 bg-[#111822] shadow-lg md:block">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-xs font-medium text-gray-400">
                        <th className="px-6 py-4 whitespace-nowrap">Date</th>
                        <th className="px-6 py-4 whitespace-nowrap">
                          Formatted Date
                        </th>
                        <th className="px-6 py-4 whitespace-nowrap">
                          Total Requests
                        </th>
                        <th className="px-6 py-4 whitespace-nowrap">
                          Unique IP Addresses
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPageLogs.map((log, idx) => (
                        <tr
                          key={log.date || idx}
                          className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition"
                        >
                          {/* Raw Date string */}
                          <td className="whitespace-nowrap px-6 py-4 font-mono text-cyan-400 font-medium">
                            {log.date}
                          </td>

                          {/* Human Readable Date */}
                          <td className="whitespace-nowrap px-6 py-4 text-gray-300">
                            {formatDateDisplay(log.date)}
                          </td>

                          {/* Total Requests */}
                          <td className="whitespace-nowrap px-6 py-4 text-white font-medium">
                            <span className="inline-flex items-center gap-2 rounded-lg bg-cyan-400/10 px-2.5 py-1 text-xs text-cyan-300 border border-cyan-400/20">
                              <BarChart2 size={13} />
                              {log.total_requests} requests
                            </span>
                          </td>

                          {/* Unique IPs */}
                          <td className="whitespace-nowrap px-6 py-4 text-gray-300">
                            <span className="inline-flex items-center gap-2 rounded-lg bg-purple-400/10 px-2.5 py-1 text-xs text-purple-300 border border-purple-400/20">
                              <Users size={13} />
                              {log.unique_ips} unique IPs
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="space-y-3 md:hidden">
                  {currentPageLogs.map((log, idx) => (
                    <div
                      key={log.date || idx}
                      className="rounded-2xl border border-white/5 bg-[#111822] p-4 shadow-lg space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="font-mono text-sm font-semibold text-cyan-400">
                          {log.date}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDateDisplay(log.date)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="rounded-xl bg-white/[0.02] p-2.5 border border-white/5">
                          <p className="text-[11px] text-gray-400">
                            Total Requests
                          </p>
                          <p className="mt-0.5 text-lg font-bold text-cyan-300">
                            {log.total_requests}
                          </p>
                        </div>
                        <div className="rounded-xl bg-white/[0.02] p-2.5 border border-white/5">
                          <p className="text-[11px] text-gray-400">
                            Unique IPs
                          </p>
                          <p className="mt-0.5 text-lg font-bold text-purple-300">
                            {log.unique_ips}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PAGINATION */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    <ChevronLeft size={16} />
                    Prev
                  </button>

                  <span className="text-sm text-gray-400">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// =====================================================
// HELPER COMPONENTS
// =====================================================

function StatChip({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#111822] px-4 py-3 shadow-lg">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-cyan-400 shrink-0" />}
        <p className="text-xs text-gray-400">{label}</p>
      </div>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#111822] p-12 text-center shadow-lg">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
      <p className="mt-4 text-sm text-gray-400">
        Loading daily traffic records…
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#111822] p-12 text-center shadow-lg">
      <Inbox size={32} className="mx-auto text-gray-600" />
      <p className="mt-3 text-sm font-medium text-white">
        No daily logs match these filters
      </p>
      <p className="mt-1 text-sm text-gray-400">
        Try adjusting or clearing the filters above.
      </p>
    </div>
  );
}
