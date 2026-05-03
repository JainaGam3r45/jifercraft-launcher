import type { LauncherApi } from "./api";

declare global {
  interface Window {
    launcher: LauncherApi;
  }
}

export {};
