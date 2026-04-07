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
    <header className="top-nav">
      <div className="top-nav__brand">Helpdesk</div>
      <div className="top-nav__actions">
        <span className="top-nav__user">
          {user?.name?.trim() || user?.email || "User"}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="top-nav__button"
        >
          {isSigningOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
      {error ? <p className="top-nav__error">{error}</p> : null}
    </header>
  );
}
