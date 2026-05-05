import { ipcMain } from "electron";
import { ipcChannels } from "../../shared/constants/app";
import type { ServiceContainer } from "../services/container";

export function registerLogCommands(services: ServiceContainer): void {
  ipcMain.handle(ipcChannels.logsGetRecent, () => services.logger.getRecent());
}
