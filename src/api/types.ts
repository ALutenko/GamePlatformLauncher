/**
 * Vendored from Platform/gamesplatform/packages/shared/src/index.ts.
 * Keep in sync by hand — the launcher is a standalone repo on purpose.
 */

export type Platform = "windows" | "macos" | "linux";
export type ReleaseChannel = "stable" | "beta";
export type PriceKind = "free" | "paid";
export type EntitlementSource = "purchase" | "free" | "admin";
export type CheckoutMode = "lutpay" | "paddle" | "mock" | "free";

export type GameReleaseStatus =
  | "released"
  | "comingSoon"
  | "testing"
  | "development"
  | "planned";

export type GameGenre =
  | "strategy"
  | "tycoon"
  | "sim"
  | "lifeSim"
  | "arpg"
  | "collectionRpg"
  | "mmorpg"
  | "clicker"
  | "platformer"
  | "novel"
  | "adventure";

export interface Game {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  kind: PriceKind;
  priceCents: number;
  currency: string;
  paddlePriceId?: string | null;
  coverUrl?: string | null;
  iconUrl?: string | null;
  keyArtUrl?: string | null;
  screenshots: string[];
  listed: boolean;
  series: string;
  seriesTitle: string;
  genre: GameGenre;
  releaseStatus: GameReleaseStatus;
  accent: string;
}

export interface ReleaseFile {
  path: string;
  size: number;
  sha256: string;
}

export interface Release {
  id: string;
  gameId: string;
  version: string;
  channel: ReleaseChannel;
  platform: Platform;
  executable: string;
  files: ReleaseFile[];
  objectKey: string;
  size: number;
  sha256: string;
  publishedAt: string;
}

export interface Entitlement {
  id: string;
  userId: string;
  gameId: string;
  source: EntitlementSource;
  providerRef?: string | null;
  createdAt: string;
  revokedAt?: string | null;
}

export interface SessionUser {
  id: string;
  email: string;
  displayName: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  userId: string;
  expiresInSeconds: number;
  user: SessionUser;
}

export interface LibraryItem {
  game: Game;
  entitlement: Entitlement;
  latestRelease: Release | null;
}

export interface DownloadTicket {
  url: string;
  expiresAt: string;
  filename: string;
  release: Release;
}

export interface CheckoutResponse {
  mode: CheckoutMode;
  gameId: string;
  url?: string;
  paddlePriceId?: string;
  paddleClientToken?: string;
  paddleEnv?: "sandbox" | "production";
  message?: string;
}

/** Games a user can obtain (buy or claim). `planned` titles are previews only. */
export function isObtainable(game: Pick<Game, "releaseStatus">): boolean {
  return game.releaseStatus !== "planned";
}
