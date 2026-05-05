import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { ProgressEvent } from "../../shared/types/events";
import { getVersionCachePath } from "../utils/paths";
import type { LoggerService } from "./loggerservice";
import type { VersionService } from "./versionservice";

export type ProgressHandler = (event: ProgressEvent) => void;

export class InstallationService {
  constructor(
    private readonly versions: VersionService,
    private readonly logger: LoggerService
  ) {}

  async prepareVersion(versionId: string, emit: ProgressHandler): Promise<void> {
    emit({ task: "metadata", percent: 10, message: `Preparing Minecraft ${versionId}.` });
    const version = await this.versions.findVersion(versionId);

    emit({ task: "metadata", percent: 35, message: "Downloading version metadata." });
    const response = await fetch(version.url);

    if (!response.ok) {
      throw new Error(`Could not download metadata for Minecraft ${versionId}.`);
    }

    const metadata = await response.text();
    const target = getVersionCachePath(versionId);

    emit({ task: "cache", percent: 70, message: "Writing version metadata to local cache." });
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, metadata, "utf8");

    this.logger.info(`Prepared Minecraft ${versionId}. MCLC will complete missing game assets during launch.`);
    emit({ task: "done", percent: 100, message: `Minecraft ${versionId} is ready to launch.` });
  }
}
