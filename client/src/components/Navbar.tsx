import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.ts";

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setError(null);
    setIsSigningOut(true);

    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to sign out.";
      setError(message);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="border-b border-slate-200 bg-slate-900 text-slate-100 shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-300">
          Helpdesk
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-100">
            {user?.name?.trim() || user?.email || "User"}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="inline-flex items-center rounded-full border border-slate-500/70 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
        {error ? (
          <p className="w-full rounded-md border border-red-300/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}
      </div>
    </header>
  );
}
