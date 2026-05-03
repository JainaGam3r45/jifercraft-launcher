import type { LauncherLogEntry, LaunchStateEvent, ProgressEvent } from "./events";
import type { LauncherSession, LoginOfflineInput, MicrosoftDeviceCode } from "./auth";
import type { LauncherSettings, LauncherSettingsUpdate } from "./settings";
import type { MinecraftVersion } from "./version";

export interface LauncherApi {
  auth: {
    getSession: () => Promise<LauncherSession | null>;
    loginOffline: (input: LoginOfflineInput) => Promise<LauncherSession>;
    startMicrosoft: () => Promise<MicrosoftDeviceCode>;
    completeMicrosoft: (deviceCode: string) => Promise<LauncherSession>;
    forgetOffline: (username: string) => Promise<LauncherSession | null>;
    logout: () => Promise<void>;
  };
  versions: {
    list: () => Promise<MinecraftVersion[]>;
    getSelected: () => Promise<string>;
    setSelected: (versionId: string) => Promise<void>;
  };
  install: {
    version: (versionId: string) => Promise<void>;
    onProgress: (handler: (event: ProgressEvent) => void) => () => void;
  };
  launch: {
    start: () => Promise<void>;
    stop: () => Promise<void>;
    onProgress: (handler: (event: ProgressEvent) => void) => () => void;
    onLog: (handler: (entry: LauncherLogEntry) => void) => () => void;
    onState: (handler: (event: LaunchStateEvent) => void) => () => void;
  };
  settings: {
    get: () => Promise<LauncherSettings>;
    update: (settings: LauncherSettingsUpdate) => Promise<LauncherSettings>;
  };
  logs: {
    getRecent: () => Promise<LauncherLogEntry[]>;
  };
  app: {
    openExternal: (url: string) => Promise<void>;
    onError: (handler: (message: string) => void) => () => void;
  };
}
