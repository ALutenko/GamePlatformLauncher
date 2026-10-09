import type { Game, GameGenre, GameReleaseStatus } from "../api/types";

export const GENRE_LABEL: Record<GameGenre, string> = {
  strategy: "Strategy",
  tycoon: "Tycoon",
  sim: "Simulator",
  lifeSim: "Life sim",
  arpg: "Action RPG",
  collectionRpg: "Collection RPG",
  mmorpg: "MMORPG",
  clicker: "Clicker",
  platformer: "Platformer",
  novel: "Visual novel",
  adventure: "Adventure",
};

export const STATUS_LABEL: Record<GameReleaseStatus, string> = {
  released: "Released",
  comingSoon: "Coming soon",
  testing: "Testing",
  development: "In development",
  planned: "Planned",
};

export function statusTone(status: GameReleaseStatus): "lime" | "cyan" | "amber" | "" {
  switch (status) {
    case "released":
      return "lime";
    case "testing":
    case "development":
      return "cyan";
    case "comingSoon":
      return "amber";
    default:
      return "";
  }
}

export function priceLabel(game: Game): string {
  if (game.kind === "free") return "Free";
  if (game.priceCents <= 0) return "Price TBA";
  const amount = game.priceCents / 100;
  const whole = Number.isInteger(amount);
  const formatted = whole
    ? String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    : amount.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const symbol = game.currency === "USD" ? "$" : game.currency === "EUR" ? "€" : `${game.currency} `;
  return `${symbol}${formatted}`;
}

export function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return "244, 114, 182";
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value >= 100 ? 0 : 1).replace(".", ",")} ${units[i]}`;
}
