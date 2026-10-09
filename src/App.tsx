import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, STORE_URL, api } from "./api/client";
import type { Game, LibraryItem } from "./api/types";
import { isObtainable } from "./api/types";
import { NotSignedIn, session, useSession } from "./auth/session";
import { OFFLINE_GAMES } from "./catalog/offline";
import { AuthModal } from "./components/AuthModal";
import { GameGrid } from "./components/GameGrid";
import { HeroPanel } from "./components/HeroPanel";
import { SearchIcon } from "./components/icons";
import { Sidebar, type Tab } from "./components/Sidebar";
import { installs, useInstalls } from "./installs";
import {
  detectPlatform,
  installRelease,
  isTauri,
  launchGame,
  onInstallProgress,
  openExternal,
  type InstallProgress,
} from "./native";

const VERSION = "0.2.1";
const SITE_URL = "https://games.lutarea.com";
const SIGN_IN_TO_DOWNLOAD = "Sign in to download games";

type Filter = "all" | "available" | "free";

interface Toast {
  text: string;
  ok?: boolean;
}

export function App() {
  const current = useSession();
  const installed = useInstalls();
  const desktop = useMemo(() => isTauri(), []);

  const [tab, setTab] = useState<Tab>("store");
  // Bundled catalog first, so the store is never empty; /catalog replaces it when reachable.
  const [games, setGames] = useState<Game[]>(OFFLINE_GAMES);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(() => pickFeatured(OFFLINE_GAMES)?.id ?? null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [online, setOnline] = useState<boolean | null>(null);
  const [auth, setAuth] = useState<{ open: boolean; reason: string | null; after?: () => void }>({
    open: false,
    reason: null,
  });
  const [progress, setProgress] = useState<InstallProgress | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((text: string, ok = false) => {
    setToast({ text, ok });
    window.setTimeout(() => setToast((t) => (t?.text === text ? null : t)), 5000);
  }, []);

  // Catalog is public — guests see the whole store. Offline: keep the bundled preview.
  useEffect(() => {
    let cancelled = false;
    api
      .catalog()
      .then(({ games }) => {
        if (cancelled) return;
        if (games.length > 0) setGames(games);
        setOnline(true);
        setSelectedId((id) => (id && games.some((g) => g.id === id) ? id : (pickFeatured(games)?.id ?? id)));
      })
      .catch(() => !cancelled && setOnline(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Session: validate on boot, load library whenever signed in.
  useEffect(() => {
    void session.restore();
  }, []);

  const loadLibrary = useCallback(async () => {
    if (!session.get()) {
      setLibrary([]);
      return;
    }
    try {
      const { items } = await session.withAccess((token) => api.library(token));
      setLibrary(items);
    } catch (err) {
      if (!(err instanceof NotSignedIn)) notify(describe(err));
    }
  }, [notify]);

  useEffect(() => {
    void loadLibrary();
    if (!current && tab === "library") setTab("store");
  }, [current, loadLibrary, tab]);

  useEffect(() => {
    let dispose = () => undefined as void;
    void onInstallProgress(setProgress).then((fn) => {
      dispose = fn;
    });
    return () => dispose();
  }, []);

  const requireAuth = useCallback(
    (reason: string, after?: () => void) => {
      if (session.get()) {
        after?.();
        return;
      }
      setAuth({ open: true, reason, after });
    },
    [],
  );

  const ownedIds = useMemo(() => new Set(library.map((i) => i.game.id)), [library]);
  const installedIds = useMemo(() => new Set(Object.keys(installed)), [installed]);
  const libraryById = useMemo(
    () => new Map(library.map((i) => [i.game.id, i] as const)),
    [library],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source = tab === "library" ? library.map((i) => i.game) : games;
    return source.filter((g) => {
      if (filter === "available" && !isObtainable(g)) return false;
      if (filter === "free" && g.kind !== "free") return false;
      if (!q) return true;
      return (
        g.title.toLowerCase().includes(q) ||
        g.seriesTitle.toLowerCase().includes(q) ||
        g.tagline.toLowerCase().includes(q)
      );
    });
  }, [games, library, tab, query, filter]);

  const pool = tab === "library" ? library.map((i) => i.game) : games;
  const selected = pool.find((g) => g.id === selectedId) ?? visible[0] ?? pool[0] ?? null;

  function switchTab(next: Tab) {
    if (next === "library" && !session.get()) {
      requireAuth("Sign in to see your library", () => setTab("library"));
      return;
    }
    setTab(next);
    setQuery("");
  }

  async function install(game: Game) {
    const item = libraryById.get(game.id);
    if (!item?.latestRelease) return;
    const release = item.latestRelease;
    setBusy(true);
    try {
      const ticket = await session.withAccess((token) => api.download(token, release.id));
      setProgress({ gameId: game.id, bytes: 0, total: release.size });
      const result = await installRelease({
        gameId: game.id,
        url: ticket.url,
        sha256: release.sha256,
        executable: release.executable,
      });
      if (desktop) {
        installs.set({
          gameId: game.id,
          releaseId: release.id,
          version: release.version,
          executablePath: result.path,
          installedAt: new Date().toISOString(),
        });
        notify(`${game.title} installed`, true);
      } else {
        notify("Download started in your browser", true);
      }
    } catch (err) {
      if (err instanceof NotSignedIn) requireAuth(SIGN_IN_TO_DOWNLOAD);
      else notify(describe(err));
    } finally {
      setProgress(null);
      setBusy(false);
    }
  }

  async function play(game: Game) {
    const build = installed[game.id];
    if (!build) return;
    try {
      await launchGame(build.executablePath);
    } catch (err) {
      notify(describe(err));
    }
  }

  async function claim(game: Game) {
    setBusy(true);
    try {
      await session.withAccess((token) => api.claimFree(token, game.slug));
      await loadLibrary();
      notify(`${game.title} added to your library`, true);
    } catch (err) {
      if (err instanceof NotSignedIn) requireAuth(SIGN_IN_TO_DOWNLOAD);
      else notify(describe(err));
    } finally {
      setBusy(false);
    }
  }

  const platform = detectPlatform();

  return (
    <div className="shell">
      <Sidebar
        tab={tab}
        onTab={switchTab}
        session={current}
        storeCount={games.length}
        libraryCount={library.length}
        online={online}
        desktop={desktop}
        version={VERSION}
        onSignIn={() => setAuth({ open: true, reason: null })}
        onSignOut={() => void session.signOut().then(() => setTab("store"))}
      />

      <main className="main">
        <header className="topbar">
          <h1>
            {tab === "store" ? (
              <>
                Game <span>Store</span>
              </>
            ) : (
              <>
                Your <span>Library</span>
              </>
            )}
          </h1>
          <label className="search">
            <SearchIcon />
            <input
              placeholder={tab === "store" ? `Search ${games.length} games…` : "Search your library…"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </header>

        {selected && (
          <HeroPanel
            game={selected}
            signedIn={Boolean(current)}
            desktop={desktop}
            libraryItem={libraryById.get(selected.id) ?? null}
            installed={installed[selected.id] ?? null}
            progress={progress}
            busy={busy}
            onInstall={() => requireAuth(SIGN_IN_TO_DOWNLOAD, () => void install(selected))}
            onPlay={() => void play(selected)}
            onClaim={() => requireAuth(SIGN_IN_TO_DOWNLOAD, () => void claim(selected))}
            onBuy={() => requireAuth("Sign in to buy games", () => void openExternal(`${STORE_URL}/games/${selected.slug}`))}
            onSignIn={() => setAuth({ open: true, reason: SIGN_IN_TO_DOWNLOAD })}
            onOpenSite={() => void openExternal(`${SITE_URL}/${selected.series}`)}
          />
        )}

        {tab === "store" && (
          <div className="chips">
            {(
              [
                ["all", "All games"],
                ["available", "Available now"],
                ["free", "Free"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`chip ${filter === key ? "is-active" : ""}`}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="section-head">
          <h2>
            {tab === "store" ? (
              <>
                <b>{visible.length}</b> titles
              </>
            ) : (
              <>
                <b>{visible.length}</b> in library
              </>
            )}
          </h2>
          <span>
            {online === false
              ? "Store preview — the games platform is offline, prices and downloads update when it is back"
              : desktop
                ? `Installing for ${platform}`
                : "Browser preview — installs open as downloads"}
          </span>
        </div>

        {tab === "library" && library.length === 0 ? (
          <div className="empty">
            <h3>Nothing here yet</h3>
            <p>Free games can be added from the Store tab; purchases from the web store appear here automatically.</p>
            <button type="button" className="btn btn-primary" onClick={() => setTab("store")}>
              Open Store
            </button>
          </div>
        ) : (
          <GameGrid
            games={visible}
            selectedId={selected?.id ?? null}
            onSelect={(g) => setSelectedId(g.id)}
            owned={ownedIds}
            installed={installedIds}
          />
        )}
      </main>

      {toast && (
        <div className={`toast ${toast.ok ? "is-ok" : ""}`} role="status">
          <span>{toast.text}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setToast(null)}>
            Dismiss
          </button>
        </div>
      )}

      <AuthModal
        open={auth.open}
        reason={auth.reason}
        onClose={() => setAuth({ open: false, reason: null })}
        onSuccess={() => {
          const after = auth.after;
          void loadLibrary().then(() => after?.());
        }}
      />
    </div>
  );
}

function pickFeatured(games: Game[]): Game | undefined {
  return games.find((g) => isObtainable(g)) ?? games[0];
}

function describe(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return String(err);
}
