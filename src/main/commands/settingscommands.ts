import { ipcMain } from "electron";
import { ipcChannels } from "../../shared/constants/app";
import type { LauncherSettingsUpdate } from "../../shared/types/settings";
import type { ServiceContainer } from "../services/container";

export function registerSettingsCommands(services: ServiceContainer): void {
  ipcMain.handle(ipcChannels.settingsGet, () => services.settings.get());

  ipcMain.handle(ipcChannels.settingsUpdate, (_event, update: LauncherSettingsUpdate) => {
    return services.settings.update(update);
  });
}
