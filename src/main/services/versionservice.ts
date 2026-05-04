import type { MinecraftVersion, MinecraftVersionManifest } from "../../shared/types/version";
import { LauncherError } from "../utils/errors";
import type { LoggerService } from "./loggerservice";

const manifestUrl = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";

export class VersionService {
  private manifest: MinecraftVersionManifest | null = null;

  constructor(private readonly logger: LoggerService) {}

  async listVersions(): Promise<MinecraftVersion[]> {
    const manifest = await this.getManifest();
    return manifest.versions;
  }

  async findVersion(versionId: string): Promise<MinecraftVersion> {
    const manifest = await this.getManifest();
    const version = manifest.versions.find((item) => item.id === versionId);

    if (!version) {
      throw new LauncherError(`Minecraft version "${versionId}" was not found.`, "version_not_found");
    }

    return version;
  }

  async getLatestReleaseId(): Promise<string> {
    const manifest = await this.getManifest();
    return manifest.latest.release;
  }

  private async getManifest(): Promise<MinecraftVersionManifest> {
    if (this.manifest) {
      return this.manifest;
    }

    this.logger.info("Fetching Minecraft version manifest.");
    const response = await fetch(manifestUrl);

    if (!response.ok) {
      throw new LauncherError(`Could not fetch Minecraft versions (${response.status}).`, "version_manifest_failed");
    }

    this.manifest = (await response.json()) as MinecraftVersionManifest;
    return this.manifest;
  }
}
