import { app } from "electron";
import { join } from "node:path";

export function getLauncherDataPath(): string {
  return join(app.getPath("appData"), ".jifercloud");
}

export function getDefaultMinecraftRoot(): string {
  return join(getLauncherDataPath(), "minecraft");
}

export function getSettingsPath(): string {
  return join(getLauncherDataPath(), "settings.json");
}

export function getVersionCachePath(versionId: string): string {
  return join(getDefaultMinecraftRoot(), "versions", versionId, `${versionId}.json`);
}
