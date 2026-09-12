import React, { useState } from "react";
import { LogIn, UserPlus, Shield, ArrowRight, AlertCircle } from "lucide-react";

export default function OAuthAuth() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [isLoading, setIsLoading] = useState(false);

  // Trigger Google OAuth Redirect
  const handleGoogleAuth = () => {
    setIsLoading(true);
    // Directs browser to your Express backend OAuth route
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || ""}/api/auth/google`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F17] px-4 py-12 text-slate-100 antialiased font-sans">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/10 bg-[#111927] p-8 shadow-2xl backdrop-blur-md">
        {/* HEADER SECTION */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {mode === "signin" ? <LogIn size={24} /> : <UserPlus size={24} />}
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
            {mode === "signin" ? "Welcome back" : "Create an account"}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {mode === "signin"
              ? "Sign in to access your dashboard and saved routes"
              : "Get started with automated logistics management"}
          </p>
        </div>

        {/* TAB TOGGLE */}
        <div className="grid grid-cols-2 rounded-xl bg-[#182232] p-1 border border-white/5">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`rounded-lg py-2 text-xs font-semibold transition-all ${
              mode === "signin"
                ? "bg-cyan-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-lg py-2 text-xs font-semibold transition-all ${
              mode === "signup"
                ? "bg-cyan-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* OAUTH BUTTON CONTAINER */}
        <div className="space-y-4 pt-2">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#162032] px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                {/* Official Google SVG Icon */}
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {mode === "signin"
                    ? "Continue with Google"
                    : "Sign up with Google"}
                </span>
                <ArrowRight
                  size={16}
                  className="ml-auto text-slate-400 transition-transform group-hover:translate-x-1"
                />
              </>
            )}
          </button>
        </div>

        {/* SECURITY FOOTER */}
        <div className="border-t border-white/5 pt-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <Shield size={12} className="text-emerald-400" />
            <span>Encrypted 256-bit OAuth authentication process</span>
          </div>
        </div>
      </div>
    </div>
  );
}
