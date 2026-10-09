# Releasing Lutarea Launcher

Installers are built by GitHub Actions (`.github/workflows/release.yml`) and published to GitHub Releases with **stable asset names**, so every download link on lutarea.com points at `…/releases/latest/download/<asset>` and never changes.

## Assets

| Asset | Platform | Built on |
|---|---|---|
| `Lutarea-Launcher-macOS.dmg` | macOS 11+, universal (arm64 + x86_64) | `macos-latest`, `--target universal-apple-darwin` |
| `Lutarea-Launcher-Windows-Setup.exe` | Windows 10/11, NSIS, per-user install | `windows-latest` |
| `Lutarea-Launcher-Windows.msi` | Windows 10/11, WiX MSI | `windows-latest` |
| `Lutarea-Launcher-Linux.AppImage` | any glibc distro, webkit2gtk 4.1 | `ubuntu-22.04` |
| `Lutarea-Launcher-Linux.deb` | Debian / Ubuntu | `ubuntu-22.04` |
| `manifest.json` | version, URLs, sizes, sha256 of every asset | publish job |
| `SHA256SUMS.txt` | checksums | publish job |

Download base URL: `https://github.com/ALutenko/GamePlatformLauncher/releases/latest/download/`.

## Cutting a release

1. Bump the version in **four** places (keep them identical):
   - `package.json` → `"version"`
   - `src-tauri/tauri.conf.json` → `"version"`
   - `src-tauri/Cargo.toml` → `version`
   - `src/App.tsx` → `const VERSION`
2. Commit, then tag and push:
   ```bash
   git tag v0.2.0
   git push origin main --tags
   ```
3. The **Release** workflow runs three build jobs in parallel and one publish job. Expect ~15–25 min (Rust compile on three OSes; `rust-cache` speeds up later runs).
4. Check the release page: 5 installers + `manifest.json` + `SHA256SUMS.txt`, release notes generated from commits.
5. Smoke-test one installer per OS if you can.

Re-running a release for an existing tag: *Actions → Release → Run workflow* and enter the tag.

## Repository settings

- **Actions → General → Workflow permissions:** "Read and write permissions" (the workflow also declares `permissions: contents: write`). No personal access token is needed; `GITHUB_TOKEN` is enough for a public repo.
- Optional **Variables** (Settings → Secrets and variables → Actions → Variables) baked into the frontend at build time:
  - `VITE_API_BASE` — games platform API host (default `https://platform.lutarea.com`)
  - `VITE_ASSET_BASE` — remote art base (default empty = bundled art)
  - `VITE_STORE_URL` — web store (default `https://store.lutarea.com`)

## Unsigned builds (current state)

There is no Apple Developer ID / notarization and no Windows code‑signing certificate yet. Users see:

- **macOS:** "Lutarea Launcher can't be opened because Apple cannot check it for malicious software" → right‑click → *Open*, or System Settings → Privacy & Security → *Open Anyway*.
- **Windows:** SmartScreen "Windows protected your PC" → *More info → Run anyway*.
- **Linux:** nothing special; AppImage needs `chmod +x`.

The release notes template and the download pages on lutarea.com repeat these hints. When certificates are available:

- macOS: set `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID` secrets — Tauri signs and notarizes automatically.
- Windows: `bundle.windows.certificateThumbprint` in `tauri.conf.json` or an Azure Trusted Signing step before "Collect artifacts".

## Auto-update

`tauri-plugin-updater` is compiled in but **inactive** (`plugins.updater.active: false`). Enabling it requires a Tauri signing keypair (`pnpm tauri signer generate`), `TAURI_SIGNING_PRIVATE_KEY` in CI, the public key in `tauri.conf.json`, and producing `latest.json` in the publish job. Until then users download a new installer from the site.

## Local build

```bash
pnpm install
pnpm tauri build            # current OS only
pnpm tauri build --target universal-apple-darwin   # macOS universal
```

Rust is required (`rustup`); Linux needs `libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`. `src-tauri/Cargo.lock` is committed so CI builds are reproducible — commit it again whenever Cargo dependencies change.
