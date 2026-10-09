import type { CSSProperties } from "react";
import { assetUrl } from "../api/client";
import type { Game, LibraryItem } from "../api/types";
import { isObtainable } from "../api/types";
import type { InstalledBuild } from "../installs";
import type { InstallProgress } from "../native";
import { DownloadIcon, ExternalIcon, LockIcon, PlayIcon } from "./icons";
import {
  GENRE_LABEL,
  STATUS_LABEL,
  formatBytes,
  hexToRgb,
  priceLabel,
  statusTone,
} from "./labels";

interface Props {
  game: Game;
  signedIn: boolean;
  desktop: boolean;
  libraryItem: LibraryItem | null;
  installed: InstalledBuild | null;
  progress: InstallProgress | null;
  busy: boolean;
  onInstall: () => void;
  onPlay: () => void;
  onClaim: () => void;
  onBuy: () => void;
  onOpenSite: () => void;
}

export function HeroPanel({
  game,
  signedIn,
  desktop,
  libraryItem,
  installed,
  progress,
  busy,
  onInstall,
  onPlay,
  onClaim,
  onBuy,
  onOpenSite,
}: Props) {
  const style = {
    "--accent": game.accent,
    "--accent-rgb": hexToRgb(game.accent),
  } as CSSProperties;
  const art = assetUrl(game.keyArtUrl ?? game.coverUrl);
  const icon = assetUrl(game.iconUrl);
  const tone = statusTone(game.releaseStatus);
  const obtainable = isObtainable(game);
  const release = libraryItem?.latestRelease ?? null;
  const owned = Boolean(libraryItem);
  const installing = Boolean(progress && progress.gameId === game.id);

  return (
    <section className="hero" style={style}>
      <div className="hero-art" style={art ? { backgroundImage: `url(${art})` } : undefined}>
        {icon && <img className="hero-icon" src={icon} alt="" draggable={false} />}
      </div>
      <div className="hero-body">
        <div className="hero-eyebrow">
          <span className="series">{game.seriesTitle}</span>
          <span>·</span>
          <span>{GENRE_LABEL[game.genre]}</span>
        </div>
        <h2 className="hero-title">{game.title}</h2>
        <p className="hero-tagline">{game.tagline}</p>
        <p className="hero-desc">{game.description}</p>
        <div className="pills">
          <span className={`pill ${tone ? `is-${tone}` : ""}`}>{STATUS_LABEL[game.releaseStatus]}</span>
          {owned && <span className="pill is-accent">In your library</span>}
          {installed && <span className="pill is-lime">Installed · v{installed.version}</span>}
          {release && !installed && (
            <span className="pill">
              {release.platform} · v{release.version} · {formatBytes(release.size)}
            </span>
          )}
        </div>

        <div className="hero-actions">
          {installing && progress ? (
            <div className="progress-row">
              <div className="progress">
                <span
                  style={{
                    width: `${progress.total > 0 ? Math.min(100, (progress.bytes / progress.total) * 100) : 5}%`,
                  }}
                />
              </div>
              <small>
                <span>Installing…</span>
                <span>
                  {formatBytes(progress.bytes)}
                  {progress.total > 0 ? ` / ${formatBytes(progress.total)}` : ""}
                </span>
              </small>
            </div>
          ) : !obtainable ? (
            <>
              <button type="button" className="btn btn-ghost" disabled>
                Coming soon
              </button>
              <button type="button" className="btn btn-ghost" onClick={onOpenSite}>
                <ExternalIcon /> games.lutarea.com
              </button>
              <span className="hero-note">Appears in your library after release.</span>
            </>
          ) : installed ? (
            <>
              <button type="button" className="btn btn-accent" onClick={onPlay} disabled={busy}>
                <PlayIcon /> Play
              </button>
              <button type="button" className="btn btn-ghost" onClick={onInstall} disabled={busy || !release}>
                <DownloadIcon /> Reinstall
              </button>
            </>
          ) : owned ? (
            <>
              <button type="button" className="btn btn-accent" onClick={onInstall} disabled={busy || !release}>
                <DownloadIcon /> {desktop ? "Install" : "Download"}
              </button>
              {!release && <span className="hero-note">No build published for your platform yet.</span>}
            </>
          ) : game.kind === "free" ? (
            <>
              <button type="button" className="btn btn-accent" onClick={onClaim} disabled={busy}>
                {signedIn ? <DownloadIcon /> : <LockIcon />} Add to library · Free
              </button>
              {!signedIn && <span className="hero-note">Sign in to download games.</span>}
            </>
          ) : (
            <>
              <span className="hero-price">{priceLabel(game)}</span>
              <button type="button" className="btn btn-accent" onClick={onBuy} disabled={busy}>
                <ExternalIcon /> Buy on store
              </button>
              {!signedIn && <span className="hero-note">Sign in to download after purchase.</span>}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
