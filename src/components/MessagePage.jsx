import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Search,
  MapPin,
  Navigation,
  Truck,
  Phone,
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Inbox,
  AlertCircle,
  Car,
  Menu,
  Clock,
  Tag,
  Activity,
  CheckCircle2,
  HelpCircle,
  Calendar,
  Filter,
} from "lucide-react";
import Sidebar from "./Sidebar";

// =====================================================
// CONFIG & CONSTANTS
// =====================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DEBOUNCE_MS = 400;

const SORT_OPTIONS = [
  { value: "time-desc", label: "Newest first", sortBy: "time", order: "desc" },
  { value: "time-asc", label: "Oldest first", sortBy: "time", order: "asc" },
  {
    value: "source-asc",
    label: "Source (A–Z)",
    sortBy: "source",
    order: "asc",
  },
  {
    value: "destination-asc",
    label: "Destination (A–Z)",
    sortBy: "destination",
    order: "asc",
  },
  {
    value: "vehicle-asc",
    label: "Vehicle (A–Z)",
    sortBy: "vehicle",
    order: "asc",
  },
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
  });
}

// =====================================================
// HELPER COMPONENTS & BADGES
// =====================================================

function FieldInput({ icon: Icon, ...props }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-[#182232] px-3.5 py-1 border border-white/5 transition-all focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/20">
      <Icon size={16} className="shrink-0 text-gray-400" />
      <input
        {...props}
        className="w-full bg-transparent py-2 text-sm text-white placeholder:text-gray-500 outline-none"
      />
    </div>
  );
}

function MessageTypeBadge({ type }) {
  const styles = {
    available: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    required: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    inquiry: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    other: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  const style = styles[type] || styles.other;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} capitalize`}
    >
      {type || "other"}
    </span>
  );
}

function RequirementBadge({ type }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 capitalize">
      <Tag size={10} />
      {type || "other"}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    available: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    required: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    unknown: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  };

  const style = styles[status] || styles.unknown;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${style} capitalize`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${status === "available" ? "bg-emerald-400" : status === "required" ? "bg-rose-400" : "bg-gray-400"}`}
      />
      {status || "unknown"}
    </span>
  );
}

function ConfidenceIndicator({ confidence }) {
  if (confidence === null || confidence === undefined)
    return <span className="text-gray-500 text-xs">—</span>;

  const percentage = Math.round(confidence * 100);
  let color = "text-emerald-400";
  let barBg = "bg-emerald-400";

  if (percentage < 50) {
    color = "text-rose-400";
    barBg = "bg-rose-400";
  } else if (percentage < 80) {
    color = "text-amber-400";
    barBg = "bg-amber-400";
  }

  return (
    <div
      className="flex items-center gap-2"
      title={`Parse Confidence: ${percentage}%`}
    >
      <div className="h-1.5 w-12 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full ${barBg} rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`text-xs font-mono font-medium ${color}`}>
        {percentage}%
      </span>
    </div>
  );
}

// =====================================================
// MAIN MESSAGES PAGE
// =====================================================

export default function MessagesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [q, setQ] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [contact, setContact] = useState("");
  const [messageTypeFilter, setMessageTypeFilter] = useState("");
  const [requirementTypeFilter, setRequirementTypeFilter] = useState("");
  const [sortValue, setSortValue] = useState("time-desc");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const activeSort = useMemo(
    () => SORT_OPTIONS.find((o) => o.value === sortValue) || SORT_OPTIONS[0],
    [sortValue],
  );

  useEffect(() => {
    setPage(1);
  }, [
    q,
    source,
    destination,
    vehicle,
    contact,
    messageTypeFilter,
    requirementTypeFilter,
    sortValue,
  ]);

  const fetchMessages = useCallback(
    async (signal) => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (q.trim()) params.set("q", q.trim());
      if (source.trim()) params.set("source", source.trim());
      if (destination.trim()) params.set("destination", destination.trim());
      if (vehicle.trim()) params.set("vehicle", vehicle.trim());
      if (contact.trim()) params.set("contact", contact.trim());
      if (messageTypeFilter) params.set("message_type", messageTypeFilter);
      if (requirementTypeFilter)
        params.set("requirement_type", requirementTypeFilter);

      params.set("sortBy", activeSort.sortBy);
      params.set("order", activeSort.order);
      params.set("page", String(page));
      params.set("limit", String(limit));

      try {
        const res = await fetch(
          `${API_BASE_URL}/api/messages?${params.toString()}`,
          { signal },
        );

        if (!res.ok) throw new Error(`Request failed (${res.status})`);

        const json = await res.json();

        setMessages(json.data || []);
        setPagination(
          json.pagination || {
            page: 1,
            totalPages: 1,
            total: (json.data || []).length,
          },
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Could not load messages");
        }
      } finally {
        setLoading(false);
      }
    },
    [
      q,
      source,
      destination,
      vehicle,
      contact,
      messageTypeFilter,
      requirementTypeFilter,
      activeSort,
      page,
      limit,
    ],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(
      () => fetchMessages(controller.signal),
      DEBOUNCE_MS,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fetchMessages]);

  const hasFilters =
    q ||
    source ||
    destination ||
    vehicle ||
    contact ||
    messageTypeFilter ||
    requirementTypeFilter ||
    sortValue !== "time-desc";

  const clearFilters = () => {
    setQ("");
    setSource("");
    setDestination("");
    setVehicle("");
    setContact("");
    setMessageTypeFilter("");
    setRequirementTypeFilter("");
    setSortValue("time-desc");
  };

  const lowConfidenceCount = useMemo(() => {
    return messages.filter(
      (m) => m.parse_confidence === null || m.parse_confidence < 0.6,
    ).length;
  }, [messages]);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 md:flex antialiased font-sans">
      {/* SIDEBAR COMPONENT */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* MAIN WRAPPER */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* MOBILE TOPBAR */}
        <header className="flex items-center justify-between border-b border-white/10 bg-[#0E1522] px-4 py-3 md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Car size={18} />
            </div>
            <span className="font-semibold text-white tracking-wide">
              SmartRide
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar menu"
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <Menu size={22} />
          </button>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* PAGE TITLE & STATS */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Parsed Messages
                </h1>
                <p className="mt-1 text-xs text-slate-400">
                  Manage and filter LLM structured logistics requests
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <StatChip label="Total Found" value={pagination.total} />
                <StatChip label="Current Page" value={messages.length} />
                <StatChip
                  label="Low Confidence"
                  value={lowConfidenceCount}
                  tone={lowConfidenceCount > 0 ? "warn" : "default"}
                />
              </div>
            </div>

            {/* FILTER BAR */}
            <div className="rounded-2xl border border-white/10 bg-[#111927] p-4 shadow-xl backdrop-blur-md space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 pb-1">
                <Filter size={14} className="text-cyan-400" />
                <span>Search & Filter Options</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2">
                  <FieldInput
                    icon={Search}
                    type="text"
                    placeholder="Search source, destination, vehicle, contact, text…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>

                <FieldInput
                  icon={MapPin}
                  type="text"
                  placeholder="Source location"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />

                <FieldInput
                  icon={Navigation}
                  type="text"
                  placeholder="Destination location"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />

                <FieldInput
                  icon={Truck}
                  type="text"
                  placeholder="Vehicle type / name"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                />

                <FieldInput
                  icon={Phone}
                  type="text"
                  placeholder="Contact details"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />

                {/* Message Type Select */}
                <div className="flex items-center gap-2 rounded-xl bg-[#182232] px-3.5 py-1 border border-white/5 focus-within:border-cyan-500/50">
                  <Tag size={16} className="shrink-0 text-gray-400" />
                  <select
                    value={messageTypeFilter}
                    onChange={(e) => setMessageTypeFilter(e.target.value)}
                    className="w-full bg-transparent py-2 text-sm text-white outline-none cursor-pointer [&>option]:bg-[#111927]"
                  >
                    <option value="">All Message Types</option>
                    <option value="available">Available</option>
                    <option value="required">Required</option>
                    <option value="inquiry">Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Requirement Type Select */}
                <div className="flex items-center gap-2 rounded-xl bg-[#182232] px-3.5 py-1 border border-white/5 focus-within:border-cyan-500/50">
                  <Activity size={16} className="shrink-0 text-gray-400" />
                  <select
                    value={requirementTypeFilter}
                    onChange={(e) => setRequirementTypeFilter(e.target.value)}
                    className="w-full bg-transparent py-2 text-sm text-white outline-none cursor-pointer [&>option]:bg-[#111927]"
                  >
                    <option value="">All Requirements</option>
                    <option value="vehicle">Vehicle</option>
                    <option value="driver">Driver</option>
                    <option value="booking">Booking</option>
                    <option value="trip">Trip</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Sort Option */}
                <div className="flex items-center gap-2 rounded-xl bg-[#182232] px-3.5 py-1 border border-white/5 focus-within:border-cyan-500/50 sm:col-span-2 lg:col-span-4">
                  <ArrowDownUp size={16} className="shrink-0 text-gray-400" />
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    Sort By:
                  </span>
                  <select
                    value={sortValue}
                    onChange={(e) => setSortValue(e.target.value)}
                    className="w-full bg-transparent py-2 text-sm text-white outline-none cursor-pointer [&>option]:bg-[#111927]"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {hasFilters && (
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition"
                  >
                    <RotateCcw size={13} />
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>

            {/* ERROR ALERT */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                <AlertCircle size={18} className="shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* MESSAGES CONTENT AREA */}
            {loading && messages.length === 0 ? (
              <LoadingState />
            ) : messages.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-[#111927] shadow-xl md:block">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-[#162032] text-xs font-semibold uppercase tracking-wider text-slate-400">
                          <th className="px-4 py-3.5">Category</th>
                          <th className="px-4 py-3.5">Vehicle / Status</th>
                          <th className="px-4 py-3.5">Route (From → To)</th>
                          <th className="px-4 py-3.5">Parsed Schedule</th>
                          <th className="px-4 py-3.5">Contact</th>
                          <th className="px-4 py-3.5">Confidence</th>
                          <th className="px-4 py-3.5">Full Message</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {messages.map((m, idx) => (
                          <tr
                            key={m.id || idx}
                            className="hover:bg-white/[0.02] transition align-top"
                          >
                            {/* Message Type & Requirement */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1.5 items-start">
                                <MessageTypeBadge type={m.message_type} />
                                <RequirementBadge type={m.requirement_type} />
                              </div>
                            </td>

                            {/* Vehicle & Vehicle Status */}
                            <td className="px-4 py-4">
                              <div className="space-y-1">
                                <div className="font-semibold text-white break-words">
                                  {m.vehicle || "—"}
                                </div>
                                <StatusBadge status={m.vehicle_status} />
                              </div>
                            </td>

                            {/* Source → Destination */}
                            <td className="px-4 py-4">
                              <div className="space-y-1 max-w-[200px]">
                                <div className="flex items-center gap-1.5 text-slate-200">
                                  <MapPin
                                    size={13}
                                    className="text-emerald-400 shrink-0"
                                  />
                                  <span className="font-medium truncate">
                                    {m.source || "—"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-200">
                                  <Navigation
                                    size={13}
                                    className="text-cyan-400 shrink-0"
                                  />
                                  <span className="font-medium truncate">
                                    {m.destination || "—"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Parsed Time */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-slate-300 text-xs font-mono">
                                <Clock
                                  size={13}
                                  className="text-amber-400 shrink-0"
                                />
                                <span>{m.time || "Unspecified"}</span>
                              </div>
                            </td>

                            {/* Contact */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              {m.contact ? (
                                <a
                                  href={`tel:${m.contact}`}
                                  className="inline-flex items-center gap-1.5 text-cyan-400 hover:underline text-xs font-mono"
                                >
                                  <Phone size={13} />
                                  {m.contact}
                                </a>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>

                            {/* Confidence Score */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              <ConfidenceIndicator
                                confidence={m.parse_confidence}
                              />
                            </td>

                            {/* Raw Message */}
                            <td className="min-w-[240px] max-w-xs px-4 py-4">
                              <p className="text-xs text-slate-300 leading-relaxed break-words line-clamp-3 hover:line-clamp-none transition-all">
                                {m.message}
                              </p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card Layout */}
                <div className="space-y-3 md:hidden">
                  {messages.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="rounded-2xl border border-white/10 bg-[#111927] p-4 shadow-lg space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                        <div className="flex items-center gap-2">
                          <MessageTypeBadge type={m.message_type} />
                          <RequirementBadge type={m.requirement_type} />
                        </div>
                        <ConfidenceIndicator confidence={m.parse_confidence} />
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-base font-semibold text-white">
                            {m.vehicle || "Vehicle Unspecified"}
                          </div>
                          <div className="mt-1">
                            <StatusBadge status={m.vehicle_status} />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#162032] p-3 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            From
                          </span>
                          <span className="text-slate-200 font-medium">
                            {m.source || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            To
                          </span>
                          <span className="text-slate-200 font-medium">
                            {m.destination || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 pt-1 gap-2">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Clock size={13} className="text-amber-400" />
                          <span>{m.time || "Time not specified"}</span>
                        </div>

                        {m.contact && (
                          <a
                            href={`tel:${m.contact}`}
                            className="flex items-center gap-1 text-cyan-400 font-mono font-medium"
                          >
                            <Phone size={13} />
                            {m.contact}
                          </a>
                        )}
                      </div>

                      <div className="border-t border-white/5 pt-2.5">
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {m.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PAGINATION CONTROLS */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">
                    Showing Page{" "}
                    <span className="text-white font-medium">
                      {pagination.page}
                    </span>{" "}
                    of{" "}
                    <span className="text-white font-medium">
                      {pagination.totalPages}
                    </span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={pagination.page <= 1 || loading}
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-[#162032] px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={14} />
                      Previous
                    </button>

                    <button
                      type="button"
                      disabled={
                        pagination.page >= pagination.totalPages || loading
                      }
                      onClick={() => setPage((p) => p + 1)}
                      className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-[#162032] px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight size={14} />
                    </button>
                  </div>
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
// AUXILIARY COMPONENTS
// =====================================================

function StatChip({ label, value, tone = "default" }) {
  const toneClasses =
    tone === "warn"
      ? "border-amber-500/30 text-amber-300 bg-amber-500/5"
      : "border-white/10 text-white bg-[#111927]";

  return (
    <div
      className={`rounded-2xl border px-3 py-2.5 shadow-lg flex flex-col justify-center min-w-[90px] ${toneClasses}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-lg sm:text-xl font-bold font-mono">{value}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111927] p-12 text-center shadow-xl">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
      <p className="mt-4 text-sm font-medium text-slate-400">
        Loading structured messages…
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111927] p-12 text-center shadow-xl">
      <Inbox size={36} className="mx-auto text-slate-600" />
      <p className="mt-3 text-base font-semibold text-white">
        No structured messages found
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Try clearing or adjusting your active filter constraints.
      </p>
    </div>
  );
}
