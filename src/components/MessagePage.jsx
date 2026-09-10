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
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  Car,
  X,
  Menu,
} from "lucide-react";
import Sidebar from "./Sidebar";

// =====================================================
// SIDEBAR & NAV CONFIG
// =====================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DEBOUNCE_MS = 400;

// =====================================================
// MESSAGES PAGE & MAIN LAYOUT
// =====================================================

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

export default function MessagesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [q, setQ] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [contact, setContact] = useState("");
  const [sortValue, setSortValue] = useState("time-desc");
  const [page, setPage] = useState(1);
  const [limit] = useState(25);

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
  }, [q, source, destination, vehicle, contact, sortValue]);

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

      params.set("sortBy", activeSort.sortBy);
      params.set("order", activeSort.order);
      params.set("page", String(page));
      params.set("limit", String(limit));

      try {
        const res = await fetch(
          `${API_BASE_URL}/api/messages?${params.toString()}`,
          {
            signal,
          },
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
    [q, source, destination, vehicle, contact, activeSort, page, limit],
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
    sortValue !== "time-desc";

  const clearFilters = () => {
    setQ("");
    setSource("");
    setDestination("");
    setVehicle("");
    setContact("");
    setSortValue("time-desc");
  };

  const unparsedOnPage = messages.filter((m) => m.structuredParseFailed).length;

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
              <StatChip label="Total matching" value={pagination.total} />
              <StatChip label="Shown this page" value={messages.length} />
              <StatChip
                label="Unparsed on page"
                value={unparsedOnPage}
                tone={unparsedOnPage > 0 ? "warn" : "default"}
              />
            </div>

            {/* FILTER BAR */}
            <div className="rounded-2xl border border-white/5 bg-[#111822] p-4 shadow-lg md:p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2 lg:col-span-2">
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
                  placeholder="Source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />

                <FieldInput
                  icon={Navigation}
                  type="text"
                  placeholder="Destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />

                <FieldInput
                  icon={Truck}
                  type="text"
                  placeholder="Vehicle"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                />

                <FieldInput
                  icon={Phone}
                  type="text"
                  placeholder="Contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />

                <div className="flex items-center gap-2 rounded-xl bg-[#1A2330] px-3 focus-within:ring-2 focus-within:ring-cyan-400/60">
                  <ArrowDownUp size={16} className="shrink-0 text-gray-400" />
                  <select
                    value={sortValue}
                    onChange={(e) => setSortValue(e.target.value)}
                    className="w-full appearance-none bg-transparent py-2.5 text-sm text-white outline-none [&>option]:bg-[#111822]"
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

            {/* ERROR */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            {/* CONTENT */}
            {loading && messages.length === 0 ? (
              <LoadingState />
            ) : messages.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Desktop / tablet table */}
                <div className="hidden overflow-x-auto rounded-2xl border border-white/5 bg-[#111822] shadow-lg md:block">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-xs font-medium text-gray-400">
                        <th className="px-5 py-3 whitespace-nowrap">Time</th>
                        <th className="px-5 py-3 whitespace-nowrap">Vehicle</th>
                        <th className="px-5 py-3 whitespace-nowrap">Source</th>
                        <th className="px-5 py-3 whitespace-nowrap">
                          Destination
                        </th>
                        <th className="px-5 py-3 whitespace-nowrap">Contact</th>
                        <th className="px-5 py-3">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map((m) => (
                        <tr
                          key={m.id}
                          className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition align-top"
                        >
                          <td className="whitespace-nowrap px-5 py-3.5 text-gray-400">
                            {formatTimestamp(m.messageTimestamp)}
                          </td>
                          <td className="px-5 py-3.5 text-white break-words">
                            {m.vehicle || "—"}
                          </td>
                          <td className="px-5 py-3.5 text-white break-words">
                            {m.source || "—"}
                          </td>
                          <td className="px-5 py-3.5 text-white break-words">
                            {m.destination || "—"}
                          </td>
                          <td className="px-5 py-3.5 text-gray-300 whitespace-nowrap">
                            {m.contactNumber || "—"}
                          </td>
                          <td className="min-w-[250px] max-w-md px-5 py-3.5 text-gray-300 break-words leading-relaxed">
                            <span>{m.messageText}</span>
                            {m.structuredParseFailed && <UnparsedBadge />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="space-y-3 md:hidden">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-2xl border border-white/5 bg-[#111822] p-4 shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {formatTimestamp(m.messageTimestamp)}
                        </span>
                        {m.structuredParseFailed && <UnparsedBadge />}
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-white">
                        <Truck size={16} className="text-cyan-400 shrink-0" />
                        <span className="font-medium break-words">
                          {m.vehicle || "Vehicle unknown"}
                        </span>
                      </div>

                      <div className="mt-1 flex items-start gap-2 text-sm text-gray-300">
                        <MapPin
                          size={14}
                          className="text-gray-500 shrink-0 mt-1"
                        />
                        <span className="break-words">
                          <span className="text-white font-medium">
                            {m.source || "—"}
                          </span>
                          <span className="mx-1.5 text-gray-500">→</span>
                          <span className="text-white font-medium">
                            {m.destination || "—"}
                          </span>
                        </span>
                      </div>

                      {m.contactNumber && (
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-300">
                          <Phone size={14} className="text-gray-500 shrink-0" />
                          <span className="break-all">{m.contactNumber}</span>
                        </div>
                      )}

                      <p className="mt-3 border-t border-white/5 pt-2.5 text-sm text-gray-300 break-words whitespace-pre-wrap leading-relaxed">
                        {m.messageText}
                      </p>
                    </div>
                  ))}
                </div>

                {/* PAGINATION */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <button
                    type="button"
                    disabled={pagination.page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    <ChevronLeft size={16} />
                    Prev
                  </button>

                  <span className="text-sm text-gray-400">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      pagination.page >= pagination.totalPages || loading
                    }
                    onClick={() => setPage((p) => p + 1)}
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

function UnparsedBadge() {
  return (
    <span className="ml-2 inline-block rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">
      unparsed
    </span>
  );
}

function LoadingState() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#111822] p-12 text-center shadow-lg">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
      <p className="mt-4 text-sm text-gray-400">Loading messages…</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#111822] p-12 text-center shadow-lg">
      <Inbox size={32} className="mx-auto text-gray-600" />
      <p className="mt-3 text-sm font-medium text-white">
        No messages match these filters
      </p>
      <p className="mt-1 text-sm text-gray-400">
        Try adjusting or clearing the filters above.
      </p>
    </div>
  );
}
