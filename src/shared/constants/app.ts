export const appInfo = {
  name: "JiferCraft Launcher",
  version: "0.1.0",
  author: "JainaGam3r45",
  organization: "JiferCraft Studios",
  website: "https://www.jifercraft.com/",
  license: "Apache-2.0",
  copyright: "Copyright 2026 JainaGam3r45 / JiferCraft Studios"
} as const;

export const ipcChannels = {
  authGetSession: "auth:getSession",
  authLoginOffline: "auth:loginOffline",
  authStartMicrosoft: "auth:startMicrosoft",
  authCompleteMicrosoft: "auth:completeMicrosoft",
  authForgetOffline: "auth:forgetOffline",
  authLogout: "auth:logout",
  versionsList: "versions:list",
  versionsGetSelected: "versions:getSelected",
  versionsSetSelected: "versions:setSelected",
  installVersion: "install:version",
  launchStart: "launch:start",
  launchStop: "launch:stop",
  settingsGet: "settings:get",
  settingsUpdate: "settings:update",
  logsGetRecent: "logs:getRecent",
  appOpenExternal: "app:openExternal",
  installProgress: "install:progress",
  launchProgress: "launch:progress",
  launchLog: "launch:log",
  launchState: "launch:state",
  appError: "app:error"
} as const;
