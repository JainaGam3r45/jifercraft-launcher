import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { safeStorage } from "electron";
import type { LauncherSession, LoginOfflineInput, MinecraftAuthorization, MicrosoftDeviceCode } from "../../shared/types/auth";
import { LauncherError } from "../utils/errors";
import { getLauncherDataPath } from "../utils/paths";
import type { LoggerService } from "./loggerservice";
import type { SettingsService } from "./settingsservice";

const microsoftAuthorizeUrl = "https://login.microsoftonline.com/consumers/oauth2/v2.0/devicecode";
const microsoftTokenUrl = "https://login.microsoftonline.com/consumers/oauth2/v2.0/token";
const xboxLiveAuthUrl = "https://user.auth.xboxlive.com/user/authenticate";
const xstsAuthUrl = "https://xsts.auth.xboxlive.com/xsts/authorize";
const minecraftLoginUrl = "https://api.minecraftservices.com/authentication/login_with_xbox";
const minecraftProfileUrl = "https://api.minecraftservices.com/minecraft/profile";
const minecraftEntitlementsUrl = "https://api.minecraftservices.com/entitlements/mcstore";
const microsoftScope = "XboxLive.signin offline_access";

interface StoredMicrosoftSession {
  session: LauncherSession;
  authorization: MinecraftAuthorization;
  refreshToken?: string;
}

interface SessionFile {
  mode: "microsoft";
  payload: string;
}

interface MicrosoftTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

interface XboxAuthResponse {
  Token: string;
  DisplayClaims: {
    xui: Array<{
      uhs: string;
    }>;
  };
}

interface MinecraftLoginResponse {
  access_token: string;
  expires_in: number;
}

interface MinecraftProfileResponse {
  id: string;
  name: string;
}

export class AuthService {
  private session: LauncherSession | null = null;
  private authorization: MinecraftAuthorization | null = null;
  private microsoftSession: StoredMicrosoftSession | null = null;
  private loaded = false;

  constructor(
    private readonly logger: LoggerService,
    private readonly settings: SettingsService
  ) {}

  async getSession(): Promise<LauncherSession | null> {
    await this.loadStoredSession();
    return this.session;
  }

  async loginOffline(input: LoginOfflineInput): Promise<LauncherSession> {
    const username = input.username.trim();

    if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
      throw new LauncherError("Use a valid Minecraft username with 3 to 16 letters, numbers, or underscores.", "invalid_username");
    }

    this.session = {
      id: this.createOfflineUuid(username),
      username,
      mode: "offline",
      createdAt: new Date().toISOString()
    };
    this.authorization = this.createOfflineAuthorization(this.session);
    const settings = await this.settings.get();
    const offlineAccounts = [username, ...settings.user.offlineAccounts.filter((account) => account !== username)].slice(0, 6);
    await this.settings.update({
      user: {
        lastOfflineUsername: username,
        rememberOfflineSession: true,
        offlineAccounts
      }
    });

    return this.session;
  }

  async forgetOffline(username: string): Promise<LauncherSession | null> {
    const settings = await this.settings.get();
    const offlineAccounts = settings.user.offlineAccounts.filter((account) => account !== username);
    const removingCurrentSession = this.session?.mode === "offline" && this.session.username === username;
    const lastOfflineUsername = settings.user.lastOfflineUsername === username ? (offlineAccounts[0] ?? "") : settings.user.lastOfflineUsername;

    await this.settings.update({
      user: {
        offlineAccounts,
        lastOfflineUsername,
        rememberOfflineSession: Boolean(lastOfflineUsername)
      }
    });

    if (removingCurrentSession) {
      this.session = null;
      this.authorization = null;

      if (lastOfflineUsername) {
        return this.loginOffline({ username: lastOfflineUsername });
      }
    }

    return this.session;
  }

  async startMicrosoftLogin(): Promise<MicrosoftDeviceCode> {
    const clientId = this.getMicrosoftClientId();
    const body = new URLSearchParams({
      client_id: clientId,
      scope: microsoftScope
    });

    const payload = await this.postForm<{
      device_code: string;
      user_code: string;
      verification_uri: string;
      expires_in: number;
      interval: number;
      message: string;
    }>(microsoftAuthorizeUrl, body);

    return {
      deviceCode: payload.device_code,
      userCode: payload.user_code,
      verificationUri: payload.verification_uri,
      expiresIn: payload.expires_in,
      interval: payload.interval,
      message: payload.message
    };
  }

  async completeMicrosoftLogin(deviceCode: string): Promise<LauncherSession> {
    const token = await this.pollMicrosoftToken(deviceCode);
    const minecraftSession = await this.createMinecraftSession(token);

    this.session = minecraftSession.session;
    this.authorization = minecraftSession.authorization;
    this.microsoftSession = minecraftSession;
    await this.saveMicrosoftSession(minecraftSession);

    return this.session;
  }

  async logout(): Promise<void> {
    this.session = null;
    this.authorization = null;
    this.microsoftSession = null;
    await rm(this.getSessionPath(), { force: true });
  }

  async getMinecraftAuthorization(): Promise<MinecraftAuthorization> {
    await this.loadStoredSession();
    await this.refreshMicrosoftSession();

    if (!this.authorization) {
      throw new LauncherError("Sign in before launching Minecraft.", "missing_session");
    }

    return this.authorization;
  }

  private async loadStoredSession(): Promise<void> {
    if (this.loaded) {
      return;
    }

    this.loaded = true;

    try {
      const content = await readFile(this.getSessionPath(), "utf8");
      const file = JSON.parse(content) as SessionFile;
      const decoded = this.decryptPayload(file.payload);
      const stored = JSON.parse(decoded) as StoredMicrosoftSession;

      this.session = stored.session;
      this.authorization = stored.authorization;
      this.microsoftSession = stored;
      await this.refreshMicrosoftSession();

      if (this.session?.mode === "microsoft") {
        this.logger.info(`Restored Microsoft session for ${this.session.username}.`);
      }
    } catch {
      this.microsoftSession = null;
      await this.loadOfflineSession();
    }
  }

  private async loadOfflineSession(): Promise<void> {
    const settings = await this.settings.get();

    const username = settings.user.lastOfflineUsername || settings.user.offlineAccounts[0];

    if (!settings.user.rememberOfflineSession || !username) {
      this.session = null;
      this.authorization = null;
      this.microsoftSession = null;
      return;
    }

    const session: LauncherSession = {
      id: this.createOfflineUuid(username),
      username,
      mode: "offline",
      createdAt: new Date().toISOString()
    };

    this.session = session;
    this.authorization = this.createOfflineAuthorization(session);
    this.microsoftSession = null;
    this.logger.info(`Restored offline session for ${session.username}.`);
  }

  private async refreshMicrosoftSession(): Promise<void> {
    if (this.session?.mode !== "microsoft" || !this.microsoftSession?.refreshToken) {
      return;
    }

    try {
      const token = await this.refreshMicrosoftToken(this.microsoftSession.refreshToken);
      const refreshedSession = await this.createMinecraftSession({
        ...token,
        refresh_token: token.refresh_token ?? this.microsoftSession.refreshToken
      });

      this.session = refreshedSession.session;
      this.authorization = refreshedSession.authorization;
      this.microsoftSession = refreshedSession;
      await this.saveMicrosoftSession(refreshedSession);
      this.logger.info(`Refreshed Microsoft session for ${refreshedSession.session.username}.`);
    } catch (error) {
      this.logger.warn(`Microsoft session refresh failed: ${error instanceof Error ? error.message : String(error)}`);
      this.session = null;
      this.authorization = null;
      this.microsoftSession = null;
      await rm(this.getSessionPath(), { force: true });
      await this.loadOfflineSession();
    }
  }

  private async pollMicrosoftToken(deviceCode: string): Promise<MicrosoftTokenResponse> {
    const clientId = this.getMicrosoftClientId();
    const startedAt = Date.now();
    const maxWaitMs = 15 * 60 * 1000;

    while (Date.now() - startedAt < maxWaitMs) {
      const body = new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        client_id: clientId,
        device_code: deviceCode
      });

      const response = await fetch(microsoftTokenUrl, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body
      });

      const payload = (await response.json()) as MicrosoftTokenResponse & { error?: string; error_description?: string };

      if (response.ok) {
        return payload;
      }

      if (payload.error !== "authorization_pending") {
        throw new LauncherError(payload.error_description ?? "Microsoft authentication failed.", "microsoft_auth_failed");
      }

      await this.delay(5000);
    }

    throw new LauncherError("Microsoft sign-in expired. Start the sign-in flow again.", "microsoft_auth_expired");
  }

  private async refreshMicrosoftToken(refreshToken: string): Promise<MicrosoftTokenResponse> {
    const clientId = this.getMicrosoftClientId();
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      refresh_token: refreshToken,
      scope: microsoftScope
    });

    return this.postForm<MicrosoftTokenResponse>(microsoftTokenUrl, body);
  }

  private async createMinecraftSession(token: MicrosoftTokenResponse): Promise<StoredMicrosoftSession> {
    const xbox = await this.authenticateXboxLive(token.access_token);
    const xsts = await this.authorizeXsts(xbox.Token);
    const userHash = xsts.DisplayClaims.xui[0]?.uhs;

    if (!userHash) {
      throw new LauncherError("Xbox Live did not return a user hash.", "xbox_missing_user_hash");
    }

    const minecraft = await this.loginMinecraft(userHash, xsts.Token);
    await this.verifyMinecraftOwnership(minecraft.access_token);
    const profile = await this.getMinecraftProfile(minecraft.access_token);

    const session: LauncherSession = {
      id: profile.id,
      username: profile.name,
      mode: "microsoft",
      createdAt: new Date().toISOString()
    };

    return {
      session,
      authorization: {
        access_token: minecraft.access_token,
        client_token: session.id,
        uuid: profile.id,
        name: profile.name,
        user_properties: "{}",
        meta: {
          type: "msa"
        }
      },
      refreshToken: token.refresh_token
    };
  }

  private async authenticateXboxLive(accessToken: string): Promise<XboxAuthResponse> {
    return this.postJson<XboxAuthResponse>(xboxLiveAuthUrl, {
      Properties: {
        AuthMethod: "RPS",
        SiteName: "user.auth.xboxlive.com",
        RpsTicket: `d=${accessToken}`
      },
      RelyingParty: "http://auth.xboxlive.com",
      TokenType: "JWT"
    });
  }

  private async authorizeXsts(userToken: string): Promise<XboxAuthResponse> {
    return this.postJson<XboxAuthResponse>(xstsAuthUrl, {
      Properties: {
        SandboxId: "RETAIL",
        UserTokens: [userToken]
      },
      RelyingParty: "rp://api.minecraftservices.com/",
      TokenType: "JWT"
    });
  }

  private async loginMinecraft(userHash: string, xstsToken: string): Promise<MinecraftLoginResponse> {
    return this.postJson<MinecraftLoginResponse>(minecraftLoginUrl, {
      identityToken: `XBL3.0 x=${userHash};${xstsToken}`
    });
  }

  private async verifyMinecraftOwnership(accessToken: string): Promise<void> {
    const response = await fetch(minecraftEntitlementsUrl, {
      headers: { authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new LauncherError("Could not verify Minecraft ownership for this Microsoft account.", "minecraft_ownership_failed");
    }
  }

  private async getMinecraftProfile(accessToken: string): Promise<MinecraftProfileResponse> {
    const response = await fetch(minecraftProfileUrl, {
      headers: { authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new LauncherError("This Microsoft account does not have a Minecraft Java profile.", "minecraft_profile_missing");
    }

    return (await response.json()) as MinecraftProfileResponse;
  }

  private async saveMicrosoftSession(session: StoredMicrosoftSession): Promise<void> {
    const sessionPath = this.getSessionPath();
    await mkdir(dirname(sessionPath), { recursive: true });

    if (!safeStorage.isEncryptionAvailable()) {
      this.logger.warn("Secure storage is not available. Microsoft session will only stay active until the app closes.");
      return;
    }

    const payload = this.encryptPayload(JSON.stringify(session));
    const file: SessionFile = { mode: "microsoft", payload };
    await writeFile(sessionPath, `${JSON.stringify(file, null, 2)}\n`, "utf8");
  }

  private getMicrosoftClientId(): string {
    const clientId = process.env.MICROSOFT_CLIENT_ID?.trim();

    if (!clientId) {
      throw new LauncherError("Set MICROSOFT_CLIENT_ID before using Microsoft sign-in.", "missing_microsoft_client_id");
    }

    return clientId;
  }

  private getSessionPath(): string {
    return join(getLauncherDataPath(), "session.json");
  }

  private encryptPayload(payload: string): string {
    return safeStorage.encryptString(payload).toString("base64");
  }

  private decryptPayload(payload: string): string {
    return safeStorage.decryptString(Buffer.from(payload, "base64"));
  }

  private async postForm<T>(url: string, body: URLSearchParams): Promise<T> {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body
    });

    if (!response.ok) {
      throw new LauncherError(`Request failed with status ${response.status}.`, "http_request_failed");
    }

    return (await response.json()) as T;
  }

  private async postJson<T>(url: string, body: unknown): Promise<T> {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new LauncherError(`Authentication request failed with status ${response.status}.`, "auth_request_failed");
    }

    return (await response.json()) as T;
  }

  private createOfflineAuthorization(session: LauncherSession): MinecraftAuthorization {
    return {
      access_token: session.id,
      client_token: session.id,
      uuid: session.id,
      name: session.username,
      user_properties: "{}"
    };
  }

  private createOfflineUuid(username: string): string {
    const hash = createHash("md5").update(`OfflinePlayer:${username}`).digest("hex");
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
