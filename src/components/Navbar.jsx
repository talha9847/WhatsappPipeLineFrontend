import React from "react";
import { Menu, Car, User, LogOut } from "lucide-react";

export default function Navbar({ onOpenSidebar, user, onLogout }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-white/5 bg-[#0B0F14] px-4 md:px-8">
      {/* Mobile Sidebar Trigger & Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open sidebar menu"
          className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 md:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2 md:hidden">
          <Car className="text-cyan-400" size={22} />
          <span className="font-semibold text-white">SmartRide</span>
        </div>
      </div>

      {/* User Actions & Profile */}
      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#111822] px-3 py-1.5 text-sm text-gray-200">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                <User size={16} />
              </div>
              <span
                onClick={() => {
                  console.log(user);
                }}
                className="hidden font-medium sm:inline"
              >
                {user.name || "User"}
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <a
              href="/signin"
              className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition hover:bg-cyan-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              Sign In
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
