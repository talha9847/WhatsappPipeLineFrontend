import React from "react";
import { Menu, Bell, UserCircle } from "lucide-react";

// =====================================================
// DASHBOARD NAVBAR
// =====================================================
//
// This is the topbar for the authenticated dashboard
// area — distinct from the public LandingPage Navbar,
// same visual language (dark surface, cyan accent).
// `onMenuClick` opens the mobile Sidebar drawer.

export default function DashboardNavbar({ onMenuClick, title = "Messages" }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/5 bg-[#0B0F14]/95 backdrop-blur px-4 py-3 md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="rounded-lg p-2 text-gray-300 hover:bg-white/5 hover:text-white md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <Menu size={22} />
        </button>

        <h1 className="text-lg font-semibold text-white md:text-xl">{title}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-cyan-400 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <Bell size={20} />
        </button>

        <button
          type="button"
          aria-label="Account"
          className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-3 text-gray-300 hover:bg-white/5 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <UserCircle size={26} className="text-cyan-400" />
          <span className="hidden text-sm font-medium sm:inline">Talha</span>
        </button>
      </div>
    </header>
  );
}
