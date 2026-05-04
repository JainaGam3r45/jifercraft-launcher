import { existsSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

export function resolveJavaPath(javaPath: string): string | undefined {
  const customPath = javaPath.trim();

  if (customPath) {
    return resolveWindowsJavaw(customPath);
  }

  if (process.platform !== "win32") {
    return undefined;
  }

  const javaHome = process.env.JAVA_HOME?.trim();

  if (javaHome) {
    const javawPath = join(javaHome, "bin", "javaw.exe");

    if (existsSync(javawPath)) {
      return javawPath;
    }
  }

  return "javaw";
}

function resolveWindowsJavaw(javaPath: string): string {
  if (process.platform !== "win32") {
    return javaPath;
  }

  const normalizedPath = normalize(javaPath);

  if (!normalizedPath.toLowerCase().endsWith("java.exe")) {
    return javaPath;
  }

  const javawPath = join(dirname(normalizedPath), "javaw.exe");

  if (existsSync(javawPath)) {
    return javawPath;
  }

  return javaPath;
}
