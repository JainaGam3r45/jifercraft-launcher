import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createDefaultSettings } from "../config/defaults";
import { getDefaultMinecraftRoot, getSettingsPath } from "../utils/paths";
import type { LauncherSettings, LauncherSettingsUpdate } from "../../shared/types/settings";

export class SettingsService {
  private settings: LauncherSettings | null = null;

  async get(): Promise<LauncherSettings> {
    if (this.settings) {
      return this.settings;
    }

    const settingsPath = getSettingsPath();

    try {
      const content = await readFile(settingsPath, "utf8");
      const defaults = createDefaultSettings(getDefaultMinecraftRoot());
      const stored = JSON.parse(content) as Partial<LauncherSettings>;
      this.settings = {
        ...defaults,
        ...stored,
        memory: {
          ...defaults.memory,
          ...stored.memory
        },
        window: {
          ...defaults.window,
          ...stored.window
        },
        user: {
          ...defaults.user,
          ...stored.user
        },
        ui: {
          ...defaults.ui,
          ...stored.ui
        },
        history: {
          ...defaults.history,
          ...stored.history
        }
      };
    } catch {
      this.settings = createDefaultSettings(getDefaultMinecraftRoot());
      await this.save(this.settings);
    }

    const loadedSettings = this.settings;

    if (!loadedSettings) {
      throw new Error("Launcher settings could not be loaded.");
    }

    return loadedSettings;
  }

  async update(update: LauncherSettingsUpdate): Promise<LauncherSettings> {
    const current = await this.get();
    const next: LauncherSettings = {
      ...current,
      ...update,
      memory: {
        ...current.memory,
        ...update.memory
      },
      window: {
        ...current.window,
        ...update.window
      },
      user: {
        ...current.user,
        ...update.user
      },
      ui: {
        ...current.ui,
        ...update.ui
      },
      history: {
        ...current.history,
        ...update.history
      }
    };

    await this.save(next);
    this.settings = next;

    return next;
  }

  private async save(settings: LauncherSettings): Promise<void> {
    const settingsPath = getSettingsPath();
    await mkdir(dirname(settingsPath), { recursive: true });
    await writeFile(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
  }
}
