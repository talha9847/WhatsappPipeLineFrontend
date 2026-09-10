import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  Car,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  //   { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  ,
];

function NavItem({ to, label, icon: Icon, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
          isActive
            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-400/30"
            : "text-gray-300 border border-transparent hover:bg-white/5 hover:text-white",
        ].join(" ")
      }
    >
      <Icon size={18} className="shrink-0" />
      <span>{label}</span>
    </NavLink>
  );
}

// =====================================================
// SIDEBAR
// =====================================================
//
// Desktop (md+): static column, always visible.
// Mobile: fixed drawer that slides in from the left with
// a backdrop, controlled by `open` / `onClose` from the
// parent layout (hamburger button lives in the topbar).

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={[
          "fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity md:hidden",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-white/5 bg-[#0B0F14]",
          "flex flex-col transition-transform duration-200 ease-out",
          "md:sticky md:top-0 md:h-screen md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Car className="text-cyan-400" size={24} />
            <span className="text-lg font-semibold text-white">SmartRide</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} onNavigate={onClose} />
          ))}
        </nav>

        <div className="border-t border-white/5 px-5 py-4">
          <p className="text-xs text-gray-500">Dispatch pipeline · connected</p>
        </div>
      </aside>
    </>
  );
}
