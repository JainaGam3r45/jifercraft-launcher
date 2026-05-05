import { ipcMain } from "electron";
import { ipcChannels } from "../../shared/constants/app";
import type { ServiceContainer } from "../services/container";

export function registerVersionCommands(services: ServiceContainer): void {
  ipcMain.handle(ipcChannels.versionsList, () => services.versions.listVersions());

  ipcMain.handle(ipcChannels.versionsGetSelected, async () => {
    const settings = await services.settings.get();
    return settings.selectedVersion || services.versions.getLatestReleaseId();
  });

  ipcMain.handle(ipcChannels.versionsSetSelected, async (_event, versionId: string) => {
    await services.versions.findVersion(versionId);
    await services.settings.update({ selectedVersion: versionId });
    services.logger.info(`Selected Minecraft ${versionId}.`);
  });
}
