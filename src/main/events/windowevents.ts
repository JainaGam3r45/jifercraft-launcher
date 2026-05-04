import type { BrowserWindow } from "electron";
import type { ServiceContainer } from "../services/container";

export function registerWindowEvents(window: BrowserWindow, services: ServiceContainer): void {
  window.on("closed", () => {
    services.logger.info("Launcher window closed.");
  });
}
