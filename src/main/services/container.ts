import { AuthService } from "./authservice";
import { InstallationService } from "./installationservice";
import { LaunchService } from "./launchservice";
import { LoggerService } from "./loggerservice";
import { SettingsService } from "./settingsservice";
import { VersionService } from "./versionservice";

export class ServiceContainer {
  readonly logger = new LoggerService();
  readonly settings = new SettingsService();
  readonly auth = new AuthService(this.logger, this.settings);
  readonly versions = new VersionService(this.logger);
  readonly installation = new InstallationService(this.versions, this.logger);
  readonly launch = new LaunchService(this.auth, this.settings, this.logger);
}
