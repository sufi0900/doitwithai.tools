"use client";

import React, { useState } from "react";

export default function FounderLoginGate() {
  const [passkeyInput, setPasskeyInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await fetch("/api/founder-hub/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey: passkeyInput }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setAuthError(data.error || "Invalid passkey. Access denied.");
      } else {
        // Authenticated on backend. Reload page to let server render the protected dashboard.
        window.location.reload();
      }
    } catch {
      setAuthError("Network error while verifying Founder passkey.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4">
          <span>🔒 Backend Protected Founder Route</span>
          <span>·</span>
          <span>Zero Client Leak</span>
        </div>

        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          DoItWithAI Founder Command Center
        </h1>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          This portal is strictly protected on the backend. All documentation, keyword sheets,
          and architectural records are kept on the server and are never served until an
          authenticated session cookie is verified.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Founder Passkey / Credential
            </label>
            <input
              type="password"
              value={passkeyInput}
              onChange={(e) => setPasskeyInput(e.target.value)}
              placeholder="Enter Founder Passkey..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg transition disabled:opacity-50"
          >
            {authLoading ? "Verifying with Backend..." : "Unlock Founder Command Center →"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
          <p className="font-semibold text-slate-300">🛡️ Backend Security Architecture:</p>
          <p>
            No data or keyword JSON is included in this page&apos;s bundle. Search bots receive HTTP
            headers with <code className="text-blue-300 font-mono">X-Robots-Tag: noindex, nofollow</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
