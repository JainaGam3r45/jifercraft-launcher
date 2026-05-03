export type LauncherState = "idle" | "installing" | "launching" | "running" | "stopping" | "error";

export interface ProgressEvent {
  task: string;
  current?: number;
  total?: number;
  percent?: number;
  message: string;
}

export interface LauncherLogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
}

export interface LaunchStateEvent {
  state: LauncherState;
  message: string;
}
