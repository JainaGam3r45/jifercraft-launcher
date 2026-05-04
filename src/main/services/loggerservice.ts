import type { LauncherLogEntry } from "../../shared/types/events";

const colors = {
  info: "\x1b[36m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
  debug: "\x1b[90m",
  reset: "\x1b[0m"
} as const;

export class LoggerService {
  private readonly entries: LauncherLogEntry[] = [];

  info(message: string): LauncherLogEntry {
    return this.write("info", message);
  }

  warn(message: string): LauncherLogEntry {
    return this.write("warn", message);
  }

  error(message: string): LauncherLogEntry {
    return this.write("error", message);
  }

  debug(message: string): LauncherLogEntry {
    return this.write("debug", message);
  }

  getRecent(limit = 150): LauncherLogEntry[] {
    return this.entries.slice(-limit);
  }

  private write(level: LauncherLogEntry["level"], message: string): LauncherLogEntry {
    const entry: LauncherLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      message
    };

    this.entries.push(entry);

    if (this.entries.length > 300) {
      this.entries.splice(0, this.entries.length - 300);
    }

    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const color = colors[level];
    process.stdout.write(`${color}[${timestamp}] ${level.toUpperCase().padEnd(5)}${colors.reset} ${message}\n`);

    return entry;
  }
}
