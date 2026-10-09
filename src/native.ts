import { downloadUrl } from "./api/client";

export interface InstallProgress {
  gameId: string;
  bytes: number;
  total: number;
}

export interface InstallResult {
  path: string;
  archive: string;
  sha256: string;
  extracted: boolean;
}

export function isTauri(): boolean {
  return Boolean(
    (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__,
  );
}

export async function installRelease(input: {
  gameId: string;
  url: string;
  sha256: string;
  executable: string;
}): Promise<InstallResult> {
  if (!isTauri()) {
    window.open(downloadUrl(input.url), "_blank");
    return { path: "browser-download", archive: "", sha256: input.sha256, extracted: false };
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<InstallResult>("install_release", {
    ...input,
    url: downloadUrl(input.url),
  });
}

export async function launchGame(executablePath: string): Promise<void> {
  if (!isTauri()) return;
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("launch_game", { executablePath });
}

export async function onInstallProgress(
  handler: (progress: InstallProgress) => void,
): Promise<() => void> {
  if (!isTauri()) return () => undefined;
  const { listen } = await import("@tauri-apps/api/event");
  return listen<InstallProgress>("install-progress", (event) => handler(event.payload));
}

/** Open a URL in the system browser (store, support) — falls back to window.open. */
export async function openExternal(url: string): Promise<void> {
  if (!isTauri()) {
    window.open(url, "_blank", "noopener");
    return;
  }
  const { openUrl } = await import("@tauri-apps/plugin-opener");
  await openUrl(url);
}

export function detectPlatform(): "windows" | "macos" | "linux" {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("linux") && !ua.includes("android")) return "linux";
  return "macos";
}
