import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Clock,
  Filter,
  Tag,
  CheckCircle2,
  Plus,
  X,
  LogIn,
  MoreHorizontal,
  Heart,
  Share,
  Repeat2,
  MessageCircle,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "../context/authContext";

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

const MESSAGE_TYPES = [
  { value: "", label: "All Message Types" },
  { value: "available", label: "Available" },
  { value: "required", label: "Required" },
  { value: "inquiry", label: "Inquiry" },
  { value: "other", label: "Other" },
];

const REQUIREMENT_TYPES = [
  { value: "", label: "All Requirement Types" },
  { value: "vehicle", label: "Vehicle" },
  { value: "driver", label: "Driver" },
  { value: "booking", label: "Booking" },
  { value: "trip", label: "Trip" },
  { value: "other", label: "Other" },
];

const VEHICLE_STATUSES = [
  { value: "", label: "All Vehicle Statuses" },
  { value: "available", label: "Available" },
  { value: "required", label: "Required" },
  { value: "unknown", label: "Unknown" },
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
// MAIN MESSAGES PAGE
// =====================================================

export default function MessagesPage() {
  const navigate = useNavigate();

  const { user: authUser, loading: authLoading } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal & Redirection State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(null);

  // Filter States
  const [q, setQ] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [contact, setContact] = useState("");
  const [messageType, setMessageType] = useState("");
  const [requirementType, setRequirementType] = useState("");
  const [vehicleStatus, setVehicleStatus] = useState("");
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

  // Handle post button click
  const handleOpenPostModal = () => {
    setIsModalOpen(true);
    if (!authUser) {
      setRedirectCountdown(3);
    }
  };

  // Timer logic for redirection when unauthenticated
  useEffect(() => {
    let timer;
    if (isModalOpen && !authUser && redirectCountdown !== null) {
      if (redirectCountdown > 0) {
        timer = setTimeout(() => {
          setRedirectCountdown((prev) => prev - 1);
        }, 1000);
      } else if (redirectCountdown === 0) {
        setIsModalOpen(false);
        navigate("/signin");
      }
    }
    return () => clearTimeout(timer);
  }, [isModalOpen, authUser, redirectCountdown, navigate]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRedirectCountdown(null);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Reset to page 1 on any filter change
  useEffect(() => {
    setPage(1);
  }, [
    q,
    source,
    destination,
    vehicle,
    contact,
    messageType,
    requirementType,
    vehicleStatus,
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

      if (messageType) params.set("messageType", messageType);
      if (requirementType) params.set("requirementType", requirementType);
      if (vehicleStatus) params.set("vehicleStatus", vehicleStatus);

      params.set("sortBy", activeSort.sortBy);
      params.set("order", activeSort.order);
      params.set("page", String(page));
      params.set("limit", String(limit));

      try {
        const res = await fetch(`/api/message/messages?${params.toString()}`, {
          signal,
        });

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
      messageType,
      requirementType,
      vehicleStatus,
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
    messageType ||
    requirementType ||
    vehicleStatus ||
    sortValue !== "time-desc";

  const clearFilters = () => {
    setQ("");
    setSource("");
    setDestination("");
    setVehicle("");
    setContact("");
    setMessageType("");
    setRequirementType("");
    setVehicleStatus("");
    setSortValue("time-desc");
  };

  const unparsedOnPage = messages.filter((m) => m.structuredParseFailed).length;

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white md:flex">
      {/* SIDEBAR COMPONENT */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* MAIN WRAPPER */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* NAVBAR COMPONENT */}
        {!loading && authUser && (
          <Navbar
            onOpenSidebar={() => setSidebarOpen(true)}
            user={authUser}
            onLogout={handleLogout}
          />
        )}

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
                {/* Search Term */}
                <div className="sm:col-span-2 lg:col-span-2">
                  <FieldInput
                    icon={Search}
                    type="text"
                    placeholder="Search source, destination, vehicle, contact, text…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>

                {/* Source & Destination */}
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

                {/* Vehicle & Contact */}
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

                {/* Message Type Filter */}
                <FieldSelect
                  icon={Tag}
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                  options={MESSAGE_TYPES}
                />

                {/* Requirement Type Filter */}
                <FieldSelect
                  icon={Filter}
                  value={requirementType}
                  onChange={(e) => setRequirementType(e.target.value)}
                  options={REQUIREMENT_TYPES}
                />

                {/* Vehicle Status Filter */}
                <FieldSelect
                  icon={CheckCircle2}
                  value={vehicleStatus}
                  onChange={(e) => setVehicleStatus(e.target.value)}
                  options={VEHICLE_STATUSES}
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
            {loading && messages.length === 0 ? (
              <LoadingState />
            ) : messages.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Desktop / Tablet Table View */}
                {/* =========================================================
    DESKTOP / TABLET FEED
========================================================= */}
                <div className="hidden md:block">
                  <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-2xl border border-slate-800/80 bg-[#05070a] shadow-2xl shadow-black/20">
                    {/* Feed Header */}
                    <div className="border-b border-slate-800/80 bg-[#070a0f]/95 px-6 py-4 backdrop-blur-xl">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-white">
                              Message Feed
                            </h2>

                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            Latest transport requests and updates
                          </p>
                        </div>

                        <div className="shrink-0 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-400">
                          {messages.length}{" "}
                          {messages.length === 1 ? "post" : "posts"}
                        </div>
                      </div>
                    </div>

                    {/* Feed */}
                    <div>
                      {messages.map((m, index) => {
                        const isLast = index === messages.length - 1;

                        return (
                          <article
                            key={m.id}
                            className="group border-b border-slate-800/80 last:border-b-0 transition-colors duration-200 hover:bg-white/[0.012]"
                          >
                            <div className="flex gap-4 px-6 py-6">
                              {/* =================================================
                  AVATAR + THREAD LINE
              ================================================= */}
                              <div className="flex w-11 shrink-0 flex-col items-center">
                                <div className="relative z-10 h-11 w-11 overflow-hidden rounded-full border border-slate-700 bg-slate-900 ring-4 ring-[#05070a] transition-all duration-200 group-hover:border-cyan-500/40">
                                  <img
                                    src={
                                      m.avatar ||
                                      "https://i.pravatar.cc/100?img=12"
                                    }
                                    alt="Admin"
                                    className="h-full w-full object-cover"
                                  />
                                </div>

                                {!isLast && (
                                  <div className="mt-3 w-px flex-1 bg-slate-800 transition-colors duration-200 group-hover:bg-slate-700" />
                                )}
                              </div>

                              {/* =================================================
                  POST CONTENT
              ================================================= */}
                              <div className="min-w-0 flex-1">
                                {/* Author */}
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                                      <span className="font-bold text-white">
                                        Admin
                                      </span>

                                      <span className="text-slate-500">
                                        @admin
                                      </span>

                                      <span className="text-slate-700">·</span>

                                      <time
                                        className="text-slate-500"
                                        title={
                                          formatTimestamp
                                            ? formatTimestamp(
                                                m.messageTimestamp,
                                              )
                                            : undefined
                                        }
                                      >
                                        {formatTimestamp
                                          ? formatTimestamp(m.messageTimestamp)
                                          : "1h"}
                                      </time>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    aria-label="More options"
                                    className="shrink-0 rounded-full p-2 text-slate-600 transition hover:bg-cyan-500/10 hover:text-cyan-400"
                                  >
                                    <MoreHorizontal size={18} />
                                  </button>
                                </div>

                                {/* =================================================
                    MESSAGE
                ================================================= */}
                                <div className="mt-2 max-w-5xl whitespace-pre-line break-words text-[15px] leading-6 text-slate-200">
                                  {m.messageText || "No message available."}
                                </div>

                                {/* =================================================
                    BADGES
                ================================================= */}
                                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                  <MessageTypeBadge type={m.messageType} />
                                  <RequirementBadge type={m.requirementType} />
                                  <VehicleStatusBadge
                                    status={m.vehicleStatus}
                                  />

                                  {m.structuredParseFailed && <UnparsedBadge />}
                                </div>

                                {/* =================================================
                    TRANSPORT DETAILS
                ================================================= */}
                                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800/90 bg-[#0a0f16] shadow-lg shadow-black/10 transition-colors duration-200 group-hover:border-slate-700">
                                  {/* Details Header */}
                                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-5 py-3.5">
                                    <div className="flex items-center gap-2.5">
                                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/10 bg-cyan-500/10 text-cyan-400">
                                        <Truck size={15} />
                                      </div>

                                      <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                          Transport Details
                                        </div>

                                        <div className="mt-0.5 text-[10px] text-slate-600">
                                          Parsed request information
                                        </div>
                                      </div>
                                    </div>

                                    {m.availableTime && (
                                      <div className="flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-400">
                                        <Clock size={12} />
                                        <span>{m.availableTime}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Details Body */}
                                  <div className="grid grid-cols-1 lg:grid-cols-3">
                                    {/* Vehicle */}
                                    <div className="border-b border-slate-800/70 p-5 lg:border-b-0 lg:border-r">
                                      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                                        <Truck size={11} />
                                        Vehicle
                                      </div>

                                      <div className="break-words text-sm font-semibold leading-5 text-slate-100">
                                        {m.vehicle || "Vehicle unknown"}
                                      </div>
                                    </div>

                                    {/* Route */}
                                    <div className="border-b border-slate-800/70 p-5 lg:border-b-0 lg:border-r">
                                      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                                        <MapPin size={11} />
                                        Route
                                      </div>

                                      <div className="flex flex-wrap items-center gap-2 text-sm">
                                        <span className="break-words font-semibold text-white">
                                          {m.source || "—"}
                                        </span>

                                        <span className="shrink-0 text-cyan-500">
                                          →
                                        </span>

                                        <span className="break-words font-semibold text-white">
                                          {m.destination || "—"}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Contact */}
                                    <div className="p-5">
                                      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                                        <Phone size={11} />
                                        Contact
                                      </div>

                                      {m.contactNumber ? (
                                        <div className="flex flex-wrap gap-2">
                                          {m.contactNumber
                                            .split(/[,/]+/)
                                            .map((num) => num.trim())
                                            .filter(Boolean)
                                            .map((num, idx) => {
                                              const cleanNum = num.replace(
                                                /[^0-9]/g,
                                                "",
                                              );

                                              return (
                                                <div
                                                  key={idx}
                                                  className="flex flex-wrap gap-1.5"
                                                >
                                                  <a
                                                    href={`tel:${num}`}
                                                    title={`Call ${num}`}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-[11px] font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-700 hover:text-white"
                                                  >
                                                    <Phone size={11} />
                                                    Call
                                                  </a>

                                                  <a
                                                    href={`https://wa.me/${cleanNum}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title={`WhatsApp ${num}`}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-400 transition hover:border-emerald-500/30 hover:bg-emerald-500/20"
                                                  >
                                                    <MessageCircle size={11} />
                                                    WhatsApp
                                                  </a>
                                                </div>
                                              );
                                            })}
                                        </div>
                                      ) : (
                                        <span className="text-sm text-slate-600">
                                          No contact available
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* =================================================
                    ENGAGEMENT BAR
                ================================================= */}
                                <div className="mt-4 flex max-w-2xl items-center justify-between text-slate-600">
                                  {/* Reply */}
                                  <button
                                    type="button"
                                    className="group/action flex items-center gap-1.5 transition hover:text-cyan-400"
                                  >
                                    <span className="rounded-full p-2 transition group-hover/action:bg-cyan-500/10">
                                      <MessageCircle size={17} />
                                    </span>

                                    <span className="text-xs">
                                      {m.replyCount || 0}
                                    </span>
                                  </button>

                                  {/* Repost */}
                                  <button
                                    type="button"
                                    className="group/action flex items-center gap-1.5 transition hover:text-emerald-400"
                                  >
                                    <span className="rounded-full p-2 transition group-hover/action:bg-emerald-500/10">
                                      <Repeat2 size={17} />
                                    </span>

                                    <span className="text-xs">
                                      {m.retweetCount || 0}
                                    </span>
                                  </button>

                                  {/* Like */}
                                  <button
                                    type="button"
                                    className="group/action flex items-center gap-1.5 transition hover:text-rose-400"
                                  >
                                    <span className="rounded-full p-2 transition group-hover/action:bg-rose-500/10">
                                      <Heart size={17} />
                                    </span>

                                    <span className="text-xs">
                                      {m.likeCount || 0}
                                    </span>
                                  </button>

                                  {/* Share */}
                                  <button
                                    type="button"
                                    aria-label="Share"
                                    className="rounded-full p-2 text-slate-600 transition hover:bg-cyan-500/10 hover:text-cyan-400"
                                  >
                                    <Share size={17} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {/* =========================================================
    MOBILE FEED
========================================================= */}
                <div className="space-y-3 md:hidden">
                  {/* Mobile Feed Header */}
                  <div className="rounded-2xl border border-slate-800/80 bg-[#0a0e14] px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold text-white">
                          Message Feed
                        </h2>

                        <p className="mt-1 text-[11px] text-slate-500">
                          Latest transport requests
                        </p>
                      </div>

                      <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-400">
                        {messages.length}
                      </div>
                    </div>
                  </div>

                  {messages.map((m, index) => {
                    const isLast = index === messages.length - 1;

                    return (
                      <article
                        key={m.id}
                        className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0a0f16] shadow-lg shadow-black/10"
                      >
                        <div className="flex gap-3 p-4">
                          {/* Avatar / Thread */}
                          <div className="flex w-9 shrink-0 flex-col items-center">
                            <div className="relative z-10 h-9 w-9 overflow-hidden rounded-full border border-slate-700 bg-slate-900 ring-2 ring-[#0a0f16]">
                              <img
                                src={
                                  m.avatar || "https://i.pravatar.cc/100?img=12"
                                }
                                alt="Admin"
                                className="h-full w-full object-cover"
                              />
                            </div>

                            {!isLast && (
                              <div className="mt-2 w-px flex-1 bg-slate-800" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px]">
                                  <span className="font-bold text-white">
                                    Admin
                                  </span>

                                  <span className="text-slate-500">@admin</span>

                                  <span className="text-slate-700">·</span>

                                  <time className="text-slate-500">
                                    {formatTimestamp
                                      ? formatTimestamp(m.messageTimestamp)
                                      : "1h"}
                                  </time>
                                </div>
                              </div>

                              <button
                                type="button"
                                aria-label="More options"
                                className="shrink-0 rounded-full p-1.5 text-slate-600 transition hover:bg-cyan-500/10 hover:text-cyan-400"
                              >
                                <MoreHorizontal size={16} />
                              </button>
                            </div>

                            {/* Message */}
                            <div className="mt-2 whitespace-pre-line break-words text-sm leading-5.5 text-slate-200">
                              {m.messageText || "No message available."}
                            </div>

                            {/* Badges */}
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              <MessageTypeBadge type={m.messageType} />
                              <RequirementBadge type={m.requirementType} />
                              <VehicleStatusBadge type={m.vehicleStatus} />

                              {m.structuredParseFailed && <UnparsedBadge />}
                            </div>

                            {/* Transport Details */}
                            <div className="mt-4 overflow-hidden rounded-xl border border-slate-800/80 bg-[#070b11]">
                              {/* Details Header */}
                              <div className="flex items-center justify-between gap-2 border-b border-slate-800/70 px-3.5 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                                    <Truck size={13} />
                                  </div>

                                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Transport Details
                                  </span>
                                </div>

                                {m.availableTime && (
                                  <span className="flex shrink-0 items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold text-cyan-400">
                                    <Clock size={10} />
                                    {m.availableTime}
                                  </span>
                                )}
                              </div>

                              {/* Vehicle */}
                              <div className="border-b border-slate-800/70 px-3.5 py-3">
                                <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">
                                  Vehicle
                                </div>

                                <div className="break-words text-sm font-semibold text-slate-100">
                                  {m.vehicle || "Vehicle unknown"}
                                </div>
                              </div>

                              {/* Route */}
                              <div className="border-b border-slate-800/70 px-3.5 py-3">
                                <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">
                                  <MapPin size={10} />
                                  Route
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                  <span className="break-words font-semibold text-white">
                                    {m.source || "—"}
                                  </span>

                                  <span className="text-cyan-500">→</span>

                                  <span className="break-words font-semibold text-white">
                                    {m.destination || "—"}
                                  </span>
                                </div>
                              </div>

                              {/* Contact */}
                              <div className="px-3.5 py-3">
                                <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">
                                  <Phone size={10} />
                                  Contact
                                </div>

                                {m.contactNumber ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {m.contactNumber
                                      .split(/[,/]+/)
                                      .map((num) => num.trim())
                                      .filter(Boolean)
                                      .map((num, idx) => {
                                        const cleanNum = num.replace(
                                          /[^0-9]/g,
                                          "",
                                        );

                                        return (
                                          <div
                                            key={idx}
                                            className="flex flex-wrap gap-1.5"
                                          >
                                            <a
                                              href={`tel:${num}`}
                                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
                                            >
                                              <Phone size={10} />
                                              Call
                                            </a>

                                            <a
                                              href={`https://wa.me/${cleanNum}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                                            >
                                              <MessageCircle size={10} />
                                              WhatsApp
                                            </a>
                                          </div>
                                        );
                                      })}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-600">
                                    No contact available
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Engagement */}
                            <div className="mt-3 flex items-center justify-between border-t border-slate-800/70 pt-2">
                              <button
                                type="button"
                                className="flex items-center gap-1.5 rounded-full p-1.5 text-slate-600 transition hover:bg-cyan-500/10 hover:text-cyan-400"
                              >
                                <MessageCircle size={15} />
                                <span className="text-[10px]">
                                  {m.replyCount || 0}
                                </span>
                              </button>

                              <button
                                type="button"
                                className="flex items-center gap-1.5 rounded-full p-1.5 text-slate-600 transition hover:bg-emerald-500/10 hover:text-emerald-400"
                              >
                                <Repeat2 size={15} />
                                <span className="text-[10px]">
                                  {m.retweetCount || 0}
                                </span>
                              </button>

                              <button
                                type="button"
                                className="flex items-center gap-1.5 rounded-full p-1.5 text-slate-600 transition hover:bg-rose-500/10 hover:text-rose-400"
                              >
                                <Heart size={15} />
                                <span className="text-[10px]">
                                  {m.likeCount || 0}
                                </span>
                              </button>

                              <button
                                type="button"
                                aria-label="Share"
                                className="rounded-full p-1.5 text-slate-600 transition hover:bg-cyan-500/10 hover:text-cyan-400"
                              >
                                <Share size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
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

      {/* FLOATING ACTION BUTTON (BOTTOM RIGHT) */}
      <button
        type="button"
        onClick={handleOpenPostModal}
        aria-label="Create Post"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 transition-transform duration-200 hover:scale-105 hover:bg-cyan-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/50"
      >
        <Plus size={28} />
      </button>

      {/* POST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111822] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-semibold text-white">
                {authUser ? "Create New Post" : "Authentication Required"}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="py-6">
              {authUser ? (
                /* Authenticated State - Form Content */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setIsModalOpen(false);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">
                      Post Details
                    </label>
                    <textarea
                      rows={4}
                      className="w-full rounded-xl bg-[#1A2330] p-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder="Enter vehicle availability or requirements..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-cyan-500 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400"
                  >
                    Publish Post
                  </button>
                </form>
              ) : (
                /* Unauthenticated State - Redirect Warning */
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
                    <LogIn size={24} />
                  </div>
                  <p className="text-sm text-gray-300">
                    You must be logged in to create a post.
                  </p>
                  <p className="text-xs text-amber-400">
                    Redirecting to Sign In page in{" "}
                    <span className="font-bold text-white">
                      {redirectCountdown}
                    </span>{" "}
                    seconds...
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      navigate("/signin");
                    }}
                    className="mt-2 w-full rounded-xl bg-cyan-500 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-400"
                  >
                    Go to Sign In Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// HELPER COMPONENTS & BADGES
// =====================================================

function MessageTypeBadge({ type }) {
  if (!type) return null;
  const normalized = type.toLowerCase();

  const styles = {
    available: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    required: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
    inquiry: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    other: "border-gray-500/30 bg-gray-500/10 text-gray-400",
  };

  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${
        styles[normalized] || styles.other
      }`}
    >
      {normalized}
    </span>
  );
}

function RequirementBadge({ type }) {
  if (!type) return null;
  return (
    <span className="inline-block rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-300 capitalize">
      {type}
    </span>
  );
}

function VehicleStatusBadge({ status }) {
  if (!status || status === "unknown") return null;
  const isAvail = status.toLowerCase() === "available";

  return (
    <span
      className={`inline-block rounded-md border px-1.5 py-0.5 text-[10px] font-medium capitalize ${
        isAvail
          ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
          : "border-amber-500/20 bg-amber-500/5 text-amber-300"
      }`}
    >
      {status}
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
