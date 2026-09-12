import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const processGoogleCallback = async () => {
      // Extract Google OAuth params from URL
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        setStatus("error");
        setErrorMessage("Access denied or authentication cancelled.");
        return;
      }

      if (!code) {
        setStatus("error");
        setErrorMessage("No authorization code received from Google.");
        return;
      }

      try {
        const backendBaseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

        // Forward the full query string (code, scope, etc.) to your Express backend
        const response = await fetch(
          `${backendBaseUrl}/api/auth/google/callback?${searchParams.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to exchange code with backend server.");
        }

        const data = await response.json();

        // Save token issued by your Express backend
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }

          setStatus("success");
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 1200);
        } else {
          throw new Error("Invalid response format from server.");
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err.message || "An error occurred while connecting to the server.",
        );
      }
    };

    processGoogleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F17] px-4 py-12 text-slate-100 antialiased font-sans">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#111927] p-8 text-center shadow-2xl backdrop-blur-md">
        {/* LOADING STATE */}
        {status === "loading" && (
          <div className="space-y-4 py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Loader2 size={28} className="animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Completing Sign In...
            </h3>
            <p className="text-xs text-slate-400">
              Exchanging authorization code with backend.
            </p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === "success" && (
          <div className="space-y-4 py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-lg font-bold text-white">
              Authentication Successful!
            </h3>
            <p className="text-xs text-slate-400">
              Redirecting you to dashboard...
            </p>
          </div>
        )}

        {/* ERROR STATE */}
        {status === "error" && (
          <div className="space-y-4 py-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-lg font-bold text-white">
              Authentication Error
            </h3>
            <p className="text-xs text-rose-300 leading-relaxed">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={() => navigate("/auth", { replace: true })}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-cyan-500 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
