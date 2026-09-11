import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Globe,
  Monitor,
  Calendar,
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Inbox,
  AlertCircle,
  Car,
  Clock,
  Filter,
  Activity,
  Menu,
  Server,
  Terminal,
} from "lucide-react";
import Sidebar from "./Sidebar";

// =====================================================
// CONFIG & CONSTANTS
// =====================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SORT_OPTIONS = [
  {
    value: "created_at-desc",
    label: "Newest first",
    sortBy: "created_at",
    order: "desc",
  },
  {
    value: "created_at-asc",
    label: "Oldest first",
    sortBy: "created_at",
    order: "asc",
  },
  {
    value: "ip_address-asc",
    label: "IP Address (A–Z)",
    sortBy: "ip_address",
    order: "asc",
  },
  {
    value: "method-asc",
    label: "Method (A–Z)",
    sortBy: "method",
    order: "asc",
  },
];

const METHOD_OPTIONS = [
  { value: "", label: "All HTTP Methods" },
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
  { value: "PUT", label: "PUT" },
  { value: "DELETE", label: "DELETE" },
  { value: "PATCH", label: "PATCH" },
];

function formatTimestamp(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
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
// MAIN TRAFFIC LOGS PAGE
// =====================================================

export default function TrafficLog() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter States
  const [q, setQ] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [location, setLocation] = useState("");
  const [method, setMethod] = useState("");
  const [path, setPath] = useState("");
  const [sortValue, setSortValue] = useState("created_at-desc");
  const [page, setPage] = useState(1);
  const limit = 25;

  // Raw fetched logs from backend
  const [rawLogs, setRawLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const activeSort = useMemo(
    () => SORT_OPTIONS.find((o) => o.value === sortValue) || SORT_OPTIONS[0],
    [sortValue],
  );

  // Fetch raw logs from backend once on mount
  const fetchTrafficLogs = useCallback(async (signal) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/traffic/fetchTrafficLogs`, {
        signal,
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const json = await res.json();
      // Supports array responses directly or wrapped object like { data: [...] }
      const fetchedData = Array.isArray(json) ? json : json.data || [];
      setRawLogs(fetchedData);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Could not load traffic logs");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchTrafficLogs(controller.signal);
    return () => controller.abort();
  }, [fetchTrafficLogs]);

  // Reset page to 1 whenever filters or search terms change
  useEffect(() => {
    setPage(1);
  }, [q, ipAddress, location, method, path, sortValue]);

  // FRONTEND FILTERING & SEARCHING
  const filteredLogs = useMemo(() => {
    return rawLogs.filter((log) => {
      // Global Search (q)
      if (q.trim()) {
        const query = q.toLowerCase();
        const matchesQ =
          (log.ip_address && log.ip_address.toLowerCase().includes(query)) ||
          (log.location && log.location.toLowerCase().includes(query)) ||
          (log.path && log.path.toLowerCase().includes(query)) ||
          (log.user_agent && log.user_agent.toLowerCase().includes(query)) ||
          (log.method && log.method.toLowerCase().includes(query));

        if (!matchesQ) return false;
      }

      // IP Filter
      if (
        ipAddress.trim() &&
        !log.ip_address?.toLowerCase().includes(ipAddress.trim().toLowerCase())
      ) {
        return false;
      }

      // Endpoint Path Filter
      if (
        path.trim() &&
        !log.path?.toLowerCase().includes(path.trim().toLowerCase())
      ) {
        return false;
      }

      // Location Filter
      if (
        location.trim() &&
        !log.location?.toLowerCase().includes(location.trim().toLowerCase())
      ) {
        return false;
      }

      // HTTP Method Filter
      if (method && log.method?.toUpperCase() !== method.toUpperCase()) {
        return false;
      }

      return true;
    });
  }, [rawLogs, q, ipAddress, location, method, path]);

  // FRONTEND SORTING
  const sortedLogs = useMemo(() => {
    const logsCopy = [...filteredLogs];
    const { sortBy, order } = activeSort;

    return logsCopy.sort((a, b) => {
      let valA = a[sortBy] ?? "";
      let valB = b[sortBy] ?? "";

      if (sortBy === "created_at") {
        valA = new Date(valA).getTime() || 0;
        valB = new Date(valB).getTime() || 0;
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = String(valB).toLowerCase();
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

  const hasFilters =
    q ||
    ipAddress ||
    location ||
    method ||
    path ||
    sortValue !== "created_at-desc";

  const clearFilters = () => {
    setQ("");
    setIpAddress("");
    setLocation("");
    setMethod("");
    setPath("");
    setSortValue("created_at-desc");
  };

  const internalIpCount = useMemo(
    () =>
      sortedLogs.filter(
        (l) =>
          l.ip_address === "::1" ||
          l.ip_address?.startsWith("127.") ||
          l.ip_address?.startsWith("10."),
      ).length,
    [sortedLogs],
  );

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white md:flex">
      {/* SIDEBAR COMPONENT */}
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
            {/* STAT STRIP */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatChip
                label="Total Traffic Requests"
                value={sortedLogs.length}
              />
              <StatChip
                label="Logs Shown on Page"
                value={currentPageLogs.length}
              />
              <StatChip
                label="Local / Internal Requests"
                value={internalIpCount}
                tone={internalIpCount > 0 ? "warn" : "default"}
              />
            </div>

            {/* FILTER BAR */}
            <div className="rounded-2xl border border-white/5 bg-[#111822] p-4 shadow-lg md:p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* Search Term */}
                <div className="sm:col-span-2 lg:col-span-2">
                  <FieldInput
                    icon={Search}
                    type="text"
                    placeholder="Search IP, location, endpoint path, or user agent…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>

                {/* IP Address Filter */}
                <FieldInput
                  icon={Server}
                  type="text"
                  placeholder="IP Address"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                />

                {/* Path Filter */}
                <FieldInput
                  icon={Terminal}
                  type="text"
                  placeholder="Endpoint Path"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                />

                {/* Location Filter */}
                <FieldInput
                  icon={Globe}
                  type="text"
                  placeholder="Location / Country"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />

                {/* HTTP Method Dropdown */}
                <FieldSelect
                  icon={Filter}
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  options={METHOD_OPTIONS}
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
                        <th className="px-5 py-3 whitespace-nowrap">
                          Timestamp
                        </th>
                        <th className="px-5 py-3 whitespace-nowrap">
                          Method & Path
                        </th>
                        <th className="px-5 py-3 whitespace-nowrap">
                          IP Address
                        </th>
                        <th className="px-5 py-3 whitespace-nowrap">
                          Location
                        </th>
                        <th className="px-5 py-3">User Agent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPageLogs.map((log, idx) => (
                        <tr
                          key={log.id || idx}
                          className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition align-top"
                        >
                          {/* Timestamp */}
                          <td className="whitespace-nowrap px-5 py-3.5 text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <Clock
                                size={14}
                                className="text-gray-500 shrink-0"
                              />
                              <span>{formatTimestamp(log.created_at)}</span>
                            </div>
                          </td>

                          {/* Method & Path */}
                          <td className="px-5 py-3.5 break-all max-w-xs">
                            <div className="flex items-center gap-2">
                              <MethodBadge method={log.method} />
                              <span className="font-mono text-xs text-white">
                                {log.path}
                              </span>
                            </div>
                          </td>

                          {/* IP Address */}
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className="font-mono text-xs text-cyan-300">
                              {log.ip_address}
                            </span>
                          </td>

                          {/* Location */}
                          <td className="px-5 py-3.5 whitespace-nowrap text-gray-300">
                            <div className="flex items-center gap-1.5">
                              <Globe
                                size={14}
                                className="text-gray-500 shrink-0"
                              />
                              <span>{log.location || "Unknown"}</span>
                            </div>
                          </td>

                          {/* User Agent */}
                          <td className="min-w-[220px] max-w-sm px-5 py-3.5 text-xs text-gray-400 break-words leading-relaxed font-mono">
                            {log.user_agent}
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
                      key={log.id || idx}
                      className="rounded-2xl border border-white/5 bg-[#111822] p-4 shadow-lg space-y-3"
                    >
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={12} />
                          {formatTimestamp(log.created_at)}
                        </span>
                        <MethodBadge method={log.method} />
                      </div>

                      {/* Path */}
                      <div className="font-mono text-xs text-white break-all bg-white/5 p-2 rounded-lg border border-white/5">
                        {log.path}
                      </div>

                      {/* Network Details */}
                      <div className="flex items-center justify-between text-xs text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Server
                            size={14}
                            className="text-cyan-400 shrink-0"
                          />
                          <span className="font-mono text-cyan-300">
                            {log.ip_address}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Globe size={12} />
                          <span>{log.location || "Unknown"}</span>
                        </div>
                      </div>

                      {/* User Agent */}
                      <p className="border-t border-white/5 pt-2 text-[11px] text-gray-400 font-mono break-words leading-relaxed">
                        {log.user_agent}
                      </p>
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
// HELPER COMPONENTS & BADGES
// =====================================================

function MethodBadge({ method }) {
  if (!method) return null;
  const normalized = method.toUpperCase();

  const styles = {
    GET: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    POST: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
    PUT: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    DELETE: "border-red-500/30 bg-red-500/10 text-red-400",
    PATCH: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  };

  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-mono font-bold tracking-wider ${
        styles[normalized] || "border-gray-500/30 bg-gray-500/10 text-gray-400"
      }`}
    >
      {normalized}
    </span>
  );
}

function StatChip({ label, value, tone = "default" }) {
  const toneClasses =
    tone === "warn"
      ? "border-amber-500/30 text-amber-300"
      : "border-white/5 text-white";

  return (
    <div
      className={`rounded-xl border bg-[#111822] px-4 py-3 shadow-lg ${toneClasses}`}
    >
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#111822] p-12 text-center shadow-lg">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
      <p className="mt-4 text-sm text-gray-400">Loading traffic logs…</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#111822] p-12 text-center shadow-lg">
      <Inbox size={32} className="mx-auto text-gray-600" />
      <p className="mt-3 text-sm font-medium text-white">
        No traffic logs match these filters
      </p>
      <p className="mt-1 text-sm text-gray-400">
        Try adjusting or clearing the filters above.
      </p>
    </div>
  );
}
