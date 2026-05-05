import type { BrowserWindow } from "electron";
import type { ServiceContainer } from "../services/container";
import { registerAppCommands } from "./appcommands";
import { registerAuthCommands } from "./authcommands";
import { registerInstallCommands } from "./installcommands";
import { registerLaunchCommands } from "./launchcommands";
import { registerLogCommands } from "./logcommands";
import { registerSettingsCommands } from "./settingscommands";
import { registerVersionCommands } from "./versioncommands";

export function registerCommands(services: ServiceContainer, getWindow: () => BrowserWindow | null): void {
  registerAppCommands();
  registerAuthCommands(services);
  registerVersionCommands(services);
  registerInstallCommands(services);
  registerLaunchCommands(services, getWindow);
  registerSettingsCommands(services);
  registerLogCommands(services);
}
