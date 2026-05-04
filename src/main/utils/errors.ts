export class LauncherError extends Error {
  constructor(
    message: string,
    public readonly code = "launcher_error"
  ) {
    super(message);
    this.name = "LauncherError";
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
