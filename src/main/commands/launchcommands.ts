import { BrowserWindow, ipcMain } from "electron";
import { ipcChannels } from "../../shared/constants/app";
import { LauncherError } from "../utils/errors";
import type { ServiceContainer } from "../services/container";

export function registerLaunchCommands(services: ServiceContainer, getWindow: () => BrowserWindow | null): void {
  ipcMain.handle(ipcChannels.launchStart, async () => {
    const window = getRequiredWindow(getWindow);
    await services.launch.start(window);
  });

  ipcMain.handle(ipcChannels.launchStop, async () => {
    const window = getRequiredWindow(getWindow);
    await services.launch.stop(window);
  });
}

function getRequiredWindow(getWindow: () => BrowserWindow | null): BrowserWindow {
  const window = getWindow();

  if (!window) {
    throw new LauncherError("The launcher window is not available.", "missing_window");
  }

  return window;
}
