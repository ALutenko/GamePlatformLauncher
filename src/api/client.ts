/**
 * Vendored from Platform/gamesplatform/packages/api-client (same endpoints).
 * Public endpoints: /health, /catalog, /catalog/:slug, /catalog/:slug/latest.
 * Everything else requires a Bearer access token.
 */
import type {
  AuthTokens,
  CheckoutResponse,
  DownloadTicket,
  Game,
  LibraryItem,
  Platform,
  Release,
  ReleaseChannel,
  SessionUser,
} from "./types";

export class ApiError extends Error {
  readonly code: string | null;

  constructor(
    public readonly status: number,
    public readonly path: string,
    public readonly body: string,
  ) {
    super(ApiError.describe(status, body));
    this.name = "ApiError";
    this.code = ApiError.extractCode(body);
  }

  private static extractCode(body: string): string | null {
    try {
      const parsed = JSON.parse(body) as {
        error?: { code?: string } | string;
        code?: string;
      };
      if (typeof parsed.error === "object" && parsed.error?.code) return parsed.error.code;
      if (typeof parsed.code === "string") return parsed.code;
    } catch {
      /* plain text */
    }
    return null;
  }

  private static describe(status: number, body: string): string {
    try {
      const parsed = JSON.parse(body) as {
        message?: string | string[];
        error?: { message?: string } | string;
      };
      if (typeof parsed.error === "object" && parsed.error?.message) return parsed.error.message;
      if (Array.isArray(parsed.message)) return parsed.message.join(", ");
      if (typeof parsed.message === "string") return parsed.message;
    } catch {
      /* plain text */
    }
    return body || `Request failed (${status})`;
  }
}

export function createApiClient(baseUrl: string) {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new ApiError(res.status, path, text);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  function auth(accessToken: string) {
    return { authorization: `Bearer ${accessToken}` };
  }

  return {
    baseUrl,
    health: () =>
      request<{ ok: boolean; service: string; postgres: string }>("/health"),
    register: (email: string, password: string, displayName?: string) =>
      request<AuthTokens>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, displayName }),
      }),
    login: (email: string, password: string) =>
      request<AuthTokens>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    refresh: (refreshToken: string) =>
      request<AuthTokens>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      }),
    logout: (refreshToken: string) =>
      request<void>("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      }),
    me: (accessToken: string) =>
      request<SessionUser>("/auth/me", { headers: auth(accessToken) }),
    catalog: () => request<{ games: Game[] }>("/catalog"),
    game: (slug: string) =>
      request<{ game: Game; releases: Release[] }>(`/catalog/${slug}`),
    library: (accessToken: string) =>
      request<{ items: LibraryItem[] }>("/library", {
        headers: auth(accessToken),
      }),
    claimFree: (accessToken: string, slug: string) =>
      request<{ item: LibraryItem }>("/library/claim", {
        method: "POST",
        headers: auth(accessToken),
        body: JSON.stringify({ slug }),
      }),
    checkout: (accessToken: string, slug: string) =>
      request<CheckoutResponse>("/checkout", {
        method: "POST",
        headers: auth(accessToken),
        body: JSON.stringify({ slug }),
      }),
    download: (accessToken: string, releaseId: string) =>
      request<DownloadTicket>(`/downloads/${releaseId}`, {
        method: "POST",
        headers: auth(accessToken),
        body: "{}",
      }),
    latestRelease: (
      slug: string,
      platform: Platform,
      channel: ReleaseChannel = "stable",
    ) =>
      request<{ release: Release | null }>(
        `/catalog/${slug}/latest?platform=${platform}&channel=${channel}`,
      ),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

export const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";
export const ASSET_BASE = import.meta.env.VITE_ASSET_BASE ?? "";
export const STORE_URL = import.meta.env.VITE_STORE_URL ?? "https://store.lutarea.com";

export const api = createApiClient(API_BASE);

/** Resolve `/games/x-art.jpg` against VITE_ASSET_BASE (bundled copies by default). */
export function assetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${ASSET_BASE}${path}`;
}

/** Download ticket URLs are relative to the API host unless absolute. */
export function downloadUrl(url: string): string {
  if (/^https?:\/\//.test(url)) return url;
  return `${API_BASE}${url}`;
}
