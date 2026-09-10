import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Glowing Icon Container */}
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
          <AlertTriangle size={48} className="text-cyan-400" />
        </div>

        {/* 404 Badge & Error Text */}
        <span className="inline-block rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
          404 Error
        </span>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Page Not Found
        </h1>

        <p className="mt-2 text-sm text-gray-400 leading-relaxed">
          The dispatch route or dashboard page you are looking for doesn't exist
          or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#111822] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <Home size={16} />
            Back to Dashboard
          </Link>
        </div>

        {/* Footer Status */}
        <p className="mt-12 text-xs text-gray-600">
          SmartRide Dispatch System · Route Error
        </p>
      </div>
    </div>
  );
}
