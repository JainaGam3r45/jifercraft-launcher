import { ipcMain, shell } from "electron";
import { ipcChannels } from "../../shared/constants/app";

export function registerAppCommands(): void {
  ipcMain.handle(ipcChannels.appOpenExternal, async (_event, url: string) => {
    await shell.openExternal(url);
  });
}
