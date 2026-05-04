import type { LauncherSettings } from "../../shared/types/settings";

export function createDefaultSettings(minecraftRoot: string): LauncherSettings {
  return {
    selectedVersion: "",
    minecraftRoot,
    javaPath: "",
    memory: {
      min: "2G",
      max: "8G"
    },
    window: {
      width: 1280,
      height: 720,
      fullscreen: false
    },
    user: {
      lastOfflineUsername: "",
      rememberOfflineSession: true,
      offlineAccounts: []
    },
    ui: {
      language: "es",
      versionFilter: "release",
      versionSearch: ""
    },
    history: {
      playedVersions: []
    }
  };
}
