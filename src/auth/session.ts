import { useSyncExternalStore } from "react";
import { ApiError, api } from "../api/client";
import type { AuthTokens, SessionUser } from "../api/types";

/**
 * Guest-first session. The launcher opens without an account; tokens appear
 * only after sign in and live in localStorage. Every authenticated call goes
 * through `withAccess()`, which refreshes once on 401 and signs out if the
 * refresh token is dead too.
 */

const STORAGE_KEY = "lutarea.launcher.session";

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

let current: Session | null = read();
const listeners = new Set<() => void>();
let refreshing: Promise<Session | null> | null = null;

function read(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.user) return null;
    return parsed as Session;
  } catch {
    return null;
  }
}

function write(next: Session | null) {
  current = next;
  if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  else localStorage.removeItem(STORAGE_KEY);
  for (const listener of listeners) listener();
}

function fromTokens(tokens: AuthTokens): Session {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: tokens.user ?? { id: tokens.userId, email: "", displayName: null },
  };
}

/** Store fresh tokens; older servers omit `user`, so fill it from /auth/me. */
async function adopt(tokens: AuthTokens): Promise<Session> {
  let next = fromTokens(tokens);
  if (!next.user.email) {
    const user = await api.me(next.accessToken).catch(() => null);
    if (user) next = { ...next, user };
  }
  write(next);
  return next;
}

export const session = {
  get(): Session | null {
    return current;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  async signIn(email: string, password: string): Promise<Session> {
    return adopt(await api.login(email, password));
  },
  async register(email: string, password: string, displayName?: string): Promise<Session> {
    return adopt(await api.register(email, password, displayName));
  },
  async signOut() {
    const token = current?.refreshToken;
    write(null);
    if (token) await api.logout(token).catch(() => undefined);
  },
  /** Refresh once; concurrent callers share the same request. */
  async refresh(): Promise<Session | null> {
    if (!current) return null;
    if (!refreshing) {
      const token = current.refreshToken;
      refreshing = api
        .refresh(token)
        .then((tokens) => {
          const next = fromTokens(tokens);
          write(next);
          return next;
        })
        .catch((err: unknown) => {
          if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
            write(null);
            return null;
          }
          throw err;
        })
        .finally(() => {
          refreshing = null;
        });
    }
    return refreshing;
  },
  /** Run an authenticated call; retry once after a silent refresh on 401. */
  async withAccess<T>(fn: (accessToken: string) => Promise<T>): Promise<T> {
    if (!current) throw new NotSignedIn();
    try {
      return await fn(current.accessToken);
    } catch (err) {
      if (!(err instanceof ApiError) || err.status !== 401) throw err;
      const refreshed = await session.refresh();
      if (!refreshed) throw new NotSignedIn();
      return fn(refreshed.accessToken);
    }
  },
  /** Validate the stored session on boot; refresh user profile. */
  async restore(): Promise<Session | null> {
    if (!current) return null;
    try {
      const user = await session.withAccess((token) => api.me(token));
      if (current) write({ ...current, user });
      return current;
    } catch (err) {
      if (err instanceof NotSignedIn) return null;
      // Offline / server down — keep the cached session, UI shows what it has.
      return current;
    }
  },
};

export class NotSignedIn extends Error {
  constructor() {
    super("Sign in to continue");
    this.name = "NotSignedIn";
  }
}

export function useSession(): Session | null {
  return useSyncExternalStore(session.subscribe, session.get, session.get);
}
