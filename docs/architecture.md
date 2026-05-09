# Architecture

JiferCraft Launcher is split into three runtime layers: main, preload, and renderer.

## Main Process

The main process owns business logic and privileged operations:

- `commands`: typed IPC entrypoints by domain.
- `services`: auth, settings, version metadata, install preparation, MCLC launching, and logs.
- `events`: Electron window and lifecycle events.
- `utils`: small helpers for paths and errors.
- `config`: default settings.

Minecraft-specific behavior stays in services so the UI can evolve without coupling to MCLC.

## Preload

The preload script exposes a narrow `window.launcher` API through `contextBridge`. Renderer code can request actions and subscribe to events, but it cannot access Node.js, Electron internals, or MCLC directly.

## Renderer

The renderer is a React app with small, focused components:

- Login/session panel
- Version and launch panel
- Runtime settings panel
- Logs panel
- About panel

State coordination lives in `src/renderer/store/useappstate.ts`.

## Extension Points

`AuthService` owns both local offline sessions and premium Microsoft sessions. Microsoft sign-in uses the device code flow, stores the encrypted session with Electron `safeStorage`, and refreshes premium authorization before launch when a refresh token is available.

Profiles, mods, themes, and account management should be added as new services and renderer modules, not folded into existing launch or UI files.
