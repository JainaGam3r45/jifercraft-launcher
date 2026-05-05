import { ipcMain } from "electron";
import { ipcChannels } from "../../shared/constants/app";
import type { ServiceContainer } from "../services/container";

export function registerInstallCommands(services: ServiceContainer): void {
  ipcMain.handle(ipcChannels.installVersion, async (event, versionId: string) => {
    await services.installation.prepareVersion(versionId, (progress) => {
      event.sender.send(ipcChannels.installProgress, progress);
    });
  });
}
