import { createRequire } from "node:module";
import type { ChildProcess } from "node:child_process";
import type { BrowserWindow } from "electron";
import type { ILauncherOptions } from "minecraft-launcher-core";
import { ipcChannels } from "../../shared/constants/app";
import type { LaunchStateEvent, ProgressEvent } from "../../shared/types/events";
import { LauncherError } from "../utils/errors";
import { resolveJavaPath } from "../utils/java";
import type { AuthService } from "./authservice";
import type { LoggerService } from "./loggerservice";
import type { SettingsService } from "./settingsservice";

const require = createRequire(import.meta.url);
const { Client } = require("minecraft-launcher-core") as typeof import("minecraft-launcher-core");

export class LaunchService {
  private process: ChildProcess | null = null;
  private state: LaunchStateEvent["state"] = "idle";

  constructor(
    private readonly auth: AuthService,
    private readonly settings: SettingsService,
    private readonly logger: LoggerService
  ) {}

  async start(window: BrowserWindow): Promise<void> {
    if (this.state === "launching" || this.state === "running") {
      throw new LauncherError("Minecraft is already launching or running.", "already_running");
    }

    const config = await this.settings.get();
    const versionId = config.selectedVersion.trim();

    if (!versionId) {
      throw new LauncherError("Select a Minecraft version before launching.", "missing_version");
    }

    const authorization = await this.auth.getMinecraftAuthorization();
    const launcher = new Client();

    const options: ILauncherOptions = {
      authorization: authorization as unknown as ILauncherOptions["authorization"],
      root: config.minecraftRoot,
      version: {
        number: versionId,
        type: "release"
      },
      memory: config.memory,
      window: config.window
    };

    const javaPath = resolveJavaPath(config.javaPath);

    if (javaPath) {
      options.javaPath = javaPath;
    }

    await this.savePlayedVersion(versionId);
    this.setState(window, "launching", `Launching Minecraft ${versionId}.`);
    this.bindLauncherEvents(window, launcher);

    const launched = await launcher.launch(options);
    this.process = launched as ChildProcess;
    this.setState(window, "running", "Minecraft is running.");
  }

  async stop(window: BrowserWindow): Promise<void> {
    if (!this.process) {
      this.setState(window, "idle", "Minecraft is not running.");
      return;
    }

    this.setState(window, "stopping", "Stopping Minecraft.");
    this.process.kill();
    this.process = null;
    this.setState(window, "idle", "Minecraft stopped.");
  }

  private bindLauncherEvents(window: BrowserWindow, launcher: InstanceType<typeof Client>): void {
    launcher.on("debug", (message: string) => {
      const entry = this.logger.debug(message);
      window.webContents.send(ipcChannels.launchLog, entry);
    });

    launcher.on("data", (message: string) => {
      const entry = this.logger.info(message);
      window.webContents.send(ipcChannels.launchLog, entry);
    });

    launcher.on("download-status", (payload: Record<string, unknown>) => {
      const current = readProgressNumber(payload, ["current", "downloaded", "progress"]);
      const total = readProgressNumber(payload, ["total", "size", "estimated"]);
      const event: ProgressEvent = {
        task: "download",
        message: "Downloading Minecraft files.",
        current,
        total,
        percent: readProgressPercent(payload, current, total)
      };
      window.webContents.send(ipcChannels.launchProgress, event);
    });

    launcher.on("progress", (payload: Record<string, unknown>) => {
      const current = readProgressNumber(payload, ["current", "downloaded", "progress"]);
      const total = readProgressNumber(payload, ["total", "size", "estimated"]);
      const event: ProgressEvent = {
        task: String(payload.type ?? "progress"),
        message: String(payload.type ?? payload.task ?? "Preparing launch files."),
        current,
        total,
        percent: readProgressPercent(payload, current, total)
      };
      window.webContents.send(ipcChannels.launchProgress, event);
    });

    launcher.on("close", (code: number) => {
      this.process = null;
      this.setState(window, "idle", `Minecraft closed with code ${code}.`);
    });
  }

  private setState(window: BrowserWindow, state: LaunchStateEvent["state"], message: string): void {
    this.state = state;
    const event: LaunchStateEvent = { state, message };
    this.logger.info(message);
    window.webContents.send(ipcChannels.launchState, event);
  }

  private async savePlayedVersion(versionId: string): Promise<void> {
    const settings = await this.settings.get();
    const playedVersions = [versionId, ...settings.history.playedVersions.filter((item) => item !== versionId)].slice(0, 5);
    await this.settings.update({ history: { playedVersions } });
  }
}

function readProgressNumber(payload: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = Number(payload[key]);

    if (Number.isFinite(value) && value >= 0) {
      return value;
    }
  }

  return 0;
}

function readProgressPercent(payload: Record<string, unknown>, current: number, total: number): number | undefined {
  const percent = Number(payload.percent);

  if (Number.isFinite(percent) && percent >= 0) {
    return percent <= 1 ? percent * 100 : Math.min(percent, 100);
  }

  return total > 0 ? (current / total) * 100 : undefined;
}
