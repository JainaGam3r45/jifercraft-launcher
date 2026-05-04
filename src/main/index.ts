/*
 * Copyright 2026 JainaGam3r45 / JiferCraft Studios
 *
 * Licensed under the Apache License, Version 2.0.
 */
import { app, BrowserWindow, ipcMain, Menu, shell } from "electron";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { appInfo, ipcChannels } from "../shared/constants/app";
import { registerCommands } from "./commands";
import { loadEnvFile } from "./config/env";
import { ServiceContainer } from "./services/container";
import { registerWindowEvents } from "./events/windowevents";
import { getErrorMessage } from "./utils/errors";

const currentDir = fileURLToPath(new URL(".", import.meta.url));
loadEnvFile();
const services = new ServiceContainer();

let mainWindow: BrowserWindow | null = null;

app.setName(appInfo.name);

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 980,
    minHeight: 640,
    title: "JiferCraft Launcher",
    icon: join(app.getAppPath(), "src/assets/logo.png"),
    backgroundColor: "#101318",
    webPreferences: {
      preload: join(currentDir, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  registerWindowEvents(mainWindow, services);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    await mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    await mainWindow.loadFile(join(currentDir, "../renderer/index.html"));
  }
}

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
  registerCommands(services, () => mainWindow);

  ipcMain.on("renderer-ready", () => {
    services.logger.info("Renderer is ready.");
  });

  await createWindow();
});

app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

process.on("uncaughtException", (error) => {
  const message = getErrorMessage(error);
  services.logger.error(message);
  mainWindow?.webContents.send(ipcChannels.appError, message);
});

process.on("unhandledRejection", (error) => {
  const message = getErrorMessage(error);
  services.logger.error(message);
  mainWindow?.webContents.send(ipcChannels.appError, message);
});
