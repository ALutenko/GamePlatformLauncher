# Lutarea Launcher

Desktop client for [games.lutarea.com](https://games.lutarea.com): browse the store, keep a library, install and play Lutarea games on **macOS, Windows and Linux**. Built with Tauri 2 + React.

**Download:** [latest release](https://github.com/ALutenko/GamePlatformLauncher/releases/latest)

| OS | File |
|---|---|
| macOS (Apple Silicon + Intel) | [`Lutarea-Launcher-macOS.dmg`](https://github.com/ALutenko/GamePlatformLauncher/releases/latest/download/Lutarea-Launcher-macOS.dmg) |
| Windows 10/11 | [`Lutarea-Launcher-Windows-Setup.exe`](https://github.com/ALutenko/GamePlatformLauncher/releases/latest/download/Lutarea-Launcher-Windows-Setup.exe) · [`.msi`](https://github.com/ALutenko/GamePlatformLauncher/releases/latest/download/Lutarea-Launcher-Windows.msi) |
| Linux | [`Lutarea-Launcher-Linux.AppImage`](https://github.com/ALutenko/GamePlatformLauncher/releases/latest/download/Lutarea-Launcher-Linux.AppImage) · [`.deb`](https://github.com/ALutenko/GamePlatformLauncher/releases/latest/download/Lutarea-Launcher-Linux.deb) |

Builds are currently **unsigned** — see the notes on each release for how to open them the first time.

## What it does

- **Store** — the full Lutarea catalog (The Kingdom of Beasts series, Worldspire, Hotfix, Compound, Vitals, Inkhouse, Hatchling, Orebelt, Ink & Steel, Wayfarers, Cartridge, …) with key art, genre and release status. Browsable as a guest: the catalog ships inside the app (`src/catalog/offline.ts`, a copy of the platform seed) and is replaced by live `/catalog` data when the platform is reachable; buying and downloading need a Lutarea account.
- **Account** — one Lutarea account for the site, the web store and the launcher. Sign in / create account from the sidebar; downloads and the library require an account.
- **Library** — games you own or claimed for free. Install downloads the build, verifies its SHA‑256, extracts it and remembers where it lives; **Play** launches it.
- Purchases happen in the web store (opened from the launcher); they appear in the library automatically.

## Development

Requirements: Node 22, pnpm 9, Rust stable, and the [Tauri 2 prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS. The launcher talks to the games platform server from `Platform/gamesplatform` (run it on `:3001`).

```bash
pnpm install
pnpm dev          # web preview on http://localhost:5174 (API proxied to :3001)
pnpm tauri dev    # native window
pnpm tauri build  # installers in src-tauri/target/release/bundle
```

Config lives in `.env` (see `.env.example`): `VITE_API_BASE`, `VITE_ASSET_BASE`, `VITE_STORE_URL`.

### Layout

```
src/
  api/types.ts, api/client.ts   vendored copy of the platform API types + client
  auth/session.ts               guest-first session: tokens, silent refresh, auth gate
  installs.ts                   installed builds (Play)
  native.ts                     Tauri bridge: install_release, launch_game, progress events
  components/                   Sidebar, HeroPanel, GameGrid, AuthModal
  theme.css                     neon arcade theme
src-tauri/                      Rust shell (download + sha256 + unzip + launch), icons, config
public/games/                   key art (1280×720) and icons (1024×1024) for every game
.github/workflows/              ci.yml (typecheck, cargo check) · release.yml (installers)
```

`src/api/*` mirrors `Platform/gamesplatform/packages/shared` and `packages/api-client`; update both when the API changes. Catalog art is the same set of files as on games.lutarea.com and the web store.

## Releasing

See [docs/RELEASE.md](docs/RELEASE.md). Short version: bump the version in `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml` and `src/App.tsx`, then push a tag `vX.Y.Z` — the Release workflow builds all installers and publishes them with stable file names.

## License

Proprietary — all rights reserved. See [LICENSE](LICENSE).
