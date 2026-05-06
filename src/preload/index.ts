/*
 * Copyright 2026 JainaGam3r45 / JiferCraft Studios
 *
 * Licensed under the Apache License, Version 2.0.
 */
import { contextBridge, ipcRenderer } from "electron";
import { ipcChannels } from "../shared/constants/app";
import type { LauncherApi } from "../shared/types/api";
import type { LauncherLogEntry, LaunchStateEvent, ProgressEvent } from "../shared/types/events";

function subscribe<T>(channel: string, handler: (event: T) => void): () => void {
  const listener = (_event: Electron.IpcRendererEvent, payload: T): void => handler(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

const api: LauncherApi = {
  auth: {
    getSession: () => ipcRenderer.invoke(ipcChannels.authGetSession),
    loginOffline: (input) => ipcRenderer.invoke(ipcChannels.authLoginOffline, input),
    startMicrosoft: () => ipcRenderer.invoke(ipcChannels.authStartMicrosoft),
    completeMicrosoft: (deviceCode) => ipcRenderer.invoke(ipcChannels.authCompleteMicrosoft, deviceCode),
    forgetOffline: (username) => ipcRenderer.invoke(ipcChannels.authForgetOffline, username),
    logout: () => ipcRenderer.invoke(ipcChannels.authLogout)
  },
  versions: {
    list: () => ipcRenderer.invoke(ipcChannels.versionsList),
    getSelected: () => ipcRenderer.invoke(ipcChannels.versionsGetSelected),
    setSelected: (versionId) => ipcRenderer.invoke(ipcChannels.versionsSetSelected, versionId)
  },
  install: {
    version: (versionId) => ipcRenderer.invoke(ipcChannels.installVersion, versionId),
    onProgress: (handler) => subscribe<ProgressEvent>(ipcChannels.installProgress, handler)
  },
  launch: {
    start: () => ipcRenderer.invoke(ipcChannels.launchStart),
    stop: () => ipcRenderer.invoke(ipcChannels.launchStop),
    onProgress: (handler) => subscribe<ProgressEvent>(ipcChannels.launchProgress, handler),
    onLog: (handler) => subscribe<LauncherLogEntry>(ipcChannels.launchLog, handler),
    onState: (handler) => subscribe<LaunchStateEvent>(ipcChannels.launchState, handler)
  },
  settings: {
    get: () => ipcRenderer.invoke(ipcChannels.settingsGet),
    update: (settings) => ipcRenderer.invoke(ipcChannels.settingsUpdate, settings)
  },
  logs: {
    getRecent: () => ipcRenderer.invoke(ipcChannels.logsGetRecent)
  },
  app: {
    openExternal: (url) => ipcRenderer.invoke(ipcChannels.appOpenExternal, url),
    onError: (handler) => subscribe<string>(ipcChannels.appError, handler)
  }
};

contextBridge.exposeInMainWorld("launcher", api);
ipcRenderer.send("renderer-ready");
