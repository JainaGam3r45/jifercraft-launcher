export interface LauncherSettings {
  selectedVersion: string;
  minecraftRoot: string;
  javaPath: string;
  memory: {
    min: string;
    max: string;
  };
  window: {
    width: number;
    height: number;
    fullscreen: boolean;
  };
  user: {
    lastOfflineUsername: string;
    rememberOfflineSession: boolean;
    offlineAccounts: string[];
  };
  ui: {
    language: "es" | "en";
    versionFilter: "release" | "snapshot" | "all";
    versionSearch: string;
  };
  history: {
    playedVersions: string[];
  };
}

export type LauncherSettingsUpdate = Partial<{
  selectedVersion: string;
  minecraftRoot: string;
  javaPath: string;
  memory: Partial<LauncherSettings["memory"]>;
  window: Partial<LauncherSettings["window"]>;
  user: Partial<LauncherSettings["user"]>;
  ui: Partial<LauncherSettings["ui"]>;
  history: Partial<LauncherSettings["history"]>;
}>;
