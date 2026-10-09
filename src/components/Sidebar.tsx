import type { Session } from "../auth/session";
import { LibraryIcon, LockIcon, LogoutIcon, StoreIcon, UserIcon } from "./icons";

export type Tab = "store" | "library";

interface Props {
  tab: Tab;
  onTab: (tab: Tab) => void;
  session: Session | null;
  storeCount: number;
  libraryCount: number;
  online: boolean | null;
  desktop: boolean;
  version: string;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function Sidebar({
  tab,
  onTab,
  session,
  storeCount,
  libraryCount,
  online,
  desktop,
  version,
  onSignIn,
  onSignOut,
}: Props) {
  const initial = (session?.user.displayName || session?.user.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">L</div>
        <div className="brand-text">
          <strong>Lutarea</strong>
          <span>Launcher</span>
        </div>
      </div>

      <nav className="nav">
        <div className="nav-label">Browse</div>
        <button
          type="button"
          className={`nav-item ${tab === "store" ? "is-active" : ""}`}
          onClick={() => onTab("store")}
        >
          <StoreIcon />
          Store
          <span className="count">{storeCount}</span>
        </button>
        <button
          type="button"
          className={`nav-item ${tab === "library" ? "is-active" : ""} ${session ? "" : "is-locked"}`}
          onClick={() => onTab("library")}
        >
          <LibraryIcon />
          Library
          <span className="count">
            {session ? libraryCount : <LockIcon style={{ width: 13, height: 13 }} />}
          </span>
        </button>
      </nav>

      <div className="sidebar-spacer" />

      {session ? (
        <div className="user-chip">
          <div className="avatar">{initial}</div>
          <div className="meta">
            <strong>{session.user.displayName || session.user.email}</strong>
            <span>{session.user.displayName ? session.user.email : "Signed in"}</span>
          </div>
          <button type="button" className="icon-btn" title="Sign out" onClick={onSignOut}>
            <LogoutIcon />
          </button>
        </div>
      ) : (
        <div className="user-chip">
          <div className="avatar" style={{ background: "rgba(255,255,255,0.08)" }}>
            <UserIcon style={{ width: 16, height: 16 }} />
          </div>
          <div className="meta">
            <strong>Guest</strong>
            <span>Browse freely, sign in to download</span>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={onSignIn}>
            Sign in
          </button>
        </div>
      )}

      <div className="sidebar-foot">
        <span>
          <i className={`dot ${online === null ? "" : online ? "is-ok" : "is-bad"}`} />
          {online === null ? "Connecting…" : online ? "Online" : "Offline"}
        </span>
        <span>
          v{version} · {desktop ? "desktop" : "web"}
        </span>
      </div>
    </aside>
  );
}
