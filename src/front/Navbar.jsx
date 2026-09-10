import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Car, Menu, X, ChevronRight } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B0F14]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-black shadow-lg shadow-cyan-500/20 transition group-hover:scale-105">
            <Car size={22} className="font-bold" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Smart<span className="text-cyan-400">Ride</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#home"
            className="text-sm font-medium text-gray-300 transition hover:text-cyan-400"
          >
            Home
          </a>
          <a
            href="#about"
            className="text-sm font-medium text-gray-300 transition hover:text-cyan-400"
          >
            About
          </a>
          <a
            href="#community"
            className="text-sm font-medium text-gray-300 transition hover:text-cyan-400"
          >
            Community
          </a>
          <a
            href="#contact"
            className="text-sm font-medium text-gray-300 transition hover:text-cyan-400"
          >
            Contact
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            to="/messages"
            className="text-sm font-semibold text-gray-300 transition hover:text-white"
          >
            Sign In
          </Link>
          <Link
            to="/messages"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
          >
            Get Started
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={toggleMenu}
          className="rounded-xl border border-white/10 bg-[#111822] p-2 text-gray-300 transition hover:text-white md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {isOpen && (
        <div className="border-b border-white/10 bg-[#111822] px-4 pt-4 pb-6 md:hidden">
          <div className="flex flex-col gap-4">
            <a
              href="#home"
              onClick={toggleMenu}
              className="text-base font-medium text-gray-300 hover:text-cyan-400"
            >
              Home
            </a>
            <a
              href="#about"
              onClick={toggleMenu}
              className="text-base font-medium text-gray-300 hover:text-cyan-400"
            >
              About
            </a>
            <a
              href="#community"
              onClick={toggleMenu}
              className="text-base font-medium text-gray-300 hover:text-cyan-400"
            >
              About
            </a>
            <a
              href="#contact"
              onClick={toggleMenu}
              className="text-base font-medium text-gray-300 hover:text-cyan-400"
            >
              Contact
            </a>
            <hr className="border-white/10" />
            <div className="flex flex-col gap-3 pt-2">
              <Link
                to="/messages"
                onClick={toggleMenu}
                className="text-center text-sm font-semibold text-gray-300"
              >
                Sign In
              </Link>
              <Link
                to="/messages"
                onClick={toggleMenu}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 text-xs font-bold uppercase text-black"
              >
                Get Started
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
