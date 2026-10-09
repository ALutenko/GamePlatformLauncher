import { useSyncExternalStore } from "react";

/** Locally installed builds, keyed by game id. Persisted so Play survives restarts. */
export interface InstalledBuild {
  gameId: string;
  releaseId: string;
  version: string;
  executablePath: string;
  installedAt: string;
}

const STORAGE_KEY = "lutarea.launcher.installed";
const listeners = new Set<() => void>();
let current: Record<string, InstalledBuild> = read();

function read(): Record<string, InstalledBuild> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, InstalledBuild>) : {};
  } catch {
    return {};
  }
}

function write(next: Record<string, InstalledBuild>) {
  current = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  for (const listener of listeners) listener();
}

export const installs = {
  get: () => current,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  set(build: InstalledBuild) {
    write({ ...current, [build.gameId]: build });
  },
  remove(gameId: string) {
    const next = { ...current };
    delete next[gameId];
    write(next);
  },
};

export function useInstalls(): Record<string, InstalledBuild> {
  return useSyncExternalStore(installs.subscribe, installs.get, installs.get);
}
