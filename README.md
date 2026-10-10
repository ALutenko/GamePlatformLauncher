# Lutarea Launcher — downloads

Installers for the **Lutarea Launcher**, the desktop client for [games.lutarea.com](https://games.lutarea.com): browse the store, keep a library, install and play Lutarea games on macOS, Windows and Linux. Sign in with your Lutarea account to buy, add and download games.

This repository only hosts releases. Source code lives in a private repository; releases are published here automatically on every launcher tag.

## Download

**[Latest release](https://github.com/ALutenko/GamePlatformLauncher/releases/latest)** · [lutarea.com/games/launcher](https://www.lutarea.com/games/launcher)

| OS | File |
|---|---|
| macOS (Apple Silicon + Intel) | [`Lutarea-Launcher-macOS.dmg`](https://github.com/ALutenko/GamePlatformLauncher/releases/latest/download/Lutarea-Launcher-macOS.dmg) |
| Windows 10/11 | [`Lutarea-Launcher-Windows-Setup.exe`](https://github.com/ALutenko/GamePlatformLauncher/releases/latest/download/Lutarea-Launcher-Windows-Setup.exe) · [`.msi`](https://github.com/ALutenko/GamePlatformLauncher/releases/latest/download/Lutarea-Launcher-Windows.msi) |
| Linux | [`Lutarea-Launcher-Linux.AppImage`](https://github.com/ALutenko/GamePlatformLauncher/releases/latest/download/Lutarea-Launcher-Linux.AppImage) · [`.deb`](https://github.com/ALutenko/GamePlatformLauncher/releases/latest/download/Lutarea-Launcher-Linux.deb) |

Every release also ships `manifest.json` (version, URLs, sizes, SHA-256) and `SHA256SUMS.txt`.

## Unsigned builds

There is no code-signing certificate yet, so the first launch needs one extra step:

- **macOS** — open the `.dmg`, drag the app to Applications, then right-click the app → *Open* (or System Settings → Privacy & Security → *Open Anyway*).
- **Windows** — if SmartScreen shows "Windows protected your PC": *More info → Run anyway*.
- **Linux** — `chmod +x Lutarea-Launcher-Linux.AppImage && ./Lutarea-Launcher-Linux.AppImage`, or `sudo dpkg -i Lutarea-Launcher-Linux.deb`.

## Support

[support@lutarea.com](mailto:support@lutarea.com) · [lutarea.com](https://www.lutarea.com)

© Lutarea. All rights reserved.
