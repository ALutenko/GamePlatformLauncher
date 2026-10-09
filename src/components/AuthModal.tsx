import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../api/client";
import { session } from "../auth/session";
import { CloseIcon } from "./icons";

type Mode = "signin" | "register";

interface Props {
  open: boolean;
  /** Why the modal appeared, e.g. "Sign in to download games". */
  reason?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ open, reason, onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setPassword("");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signin") await session.signIn(email.trim(), password);
      else await session.register(email.trim(), password, displayName.trim() || undefined);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(describe(err, mode));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button type="button" className="icon-btn close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
        <h2 id="auth-title">{reason ?? "Your Lutarea account"}</h2>
        <p className="lead">
          One account for games.lutarea.com, the store and the launcher.
        </p>
        <div className="tabs">
          <button
            type="button"
            className={mode === "signin" ? "is-active" : ""}
            onClick={() => setMode("signin")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === "register" ? "is-active" : ""}
            onClick={() => setMode("register")}
          >
            Create account
          </button>
        </div>
        <form onSubmit={(e) => void submit(e)}>
          {mode === "register" && (
            <div className="field">
              <label htmlFor="auth-name">Display name (optional)</label>
              <input
                id="auth-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="nickname"
                maxLength={60}
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="fine">
          {mode === "register"
            ? "At least 8 characters. By continuing you accept the Lutarea Terms."
            : "No account yet? Switch to Create account."}
        </p>
      </div>
    </div>
  );
}

function describe(err: unknown, mode: Mode): string {
  if (err instanceof ApiError) {
    if (err.code === "EMAIL_TAKEN" || err.status === 409) return "This email is already registered. Sign in instead.";
    if (err.code === "INVALID_CREDENTIALS" || err.status === 401) return "Wrong email or password.";
    if (err.status === 400) return err.message;
    if (err.status >= 500) return "The service is unavailable right now. Try again in a minute.";
    return err.message;
  }
  if (err instanceof TypeError) return "Cannot reach the server. Check your connection.";
  return mode === "signin" ? "Could not sign in." : "Could not create the account.";
}
