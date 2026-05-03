export type AuthMode = "offline" | "microsoft";

export interface LauncherSession {
  id: string;
  username: string;
  mode: AuthMode;
  createdAt: string;
}

export interface LoginOfflineInput {
  username: string;
}

export interface MicrosoftDeviceCode {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  expiresIn: number;
  interval: number;
  message: string;
}

export interface MinecraftAuthorization {
  access_token: string;
  client_token: string;
  uuid: string;
  name: string;
  user_properties: string | Record<string, unknown>;
  meta?: {
    type: "msa" | "mojang";
    demo?: boolean;
  };
}
