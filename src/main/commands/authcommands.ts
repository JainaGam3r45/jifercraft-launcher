import { ipcMain } from "electron";
import { ipcChannels } from "../../shared/constants/app";
import type { LoginOfflineInput } from "../../shared/types/auth";
import type { ServiceContainer } from "../services/container";

export function registerAuthCommands(services: ServiceContainer): void {
  ipcMain.handle(ipcChannels.authGetSession, () => services.auth.getSession());

  ipcMain.handle(ipcChannels.authLoginOffline, async (_event, input: LoginOfflineInput) => {
    const session = await services.auth.loginOffline(input);
    services.logger.info(`Offline session started for ${session.username}.`);
    return session;
  });

  ipcMain.handle(ipcChannels.authStartMicrosoft, () => services.auth.startMicrosoftLogin());

  ipcMain.handle(ipcChannels.authCompleteMicrosoft, async (_event, deviceCode: string) => {
    const session = await services.auth.completeMicrosoftLogin(deviceCode);
    services.logger.info(`Microsoft session started for ${session.username}.`);
    return session;
  });

  ipcMain.handle(ipcChannels.authForgetOffline, async (_event, username: string) => {
    const session = await services.auth.forgetOffline(username);
    services.logger.info(`Forgot offline account ${username}.`);
    return session;
  });

  ipcMain.handle(ipcChannels.authLogout, async () => {
    await services.auth.logout();
    services.logger.info("Session closed.");
  });
}
