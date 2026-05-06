import { useCallback, useEffect, useMemo, useState } from "react";
import type { LauncherLogEntry, LaunchStateEvent, ProgressEvent } from "../../shared/types/events";
import type { LauncherSession, MicrosoftDeviceCode } from "../../shared/types/auth";
import type { LauncherSettings, LauncherSettingsUpdate } from "../../shared/types/settings";
import type { MinecraftVersion } from "../../shared/types/version";

export function useAppState() {
  const [session, setSession] = useState<LauncherSession | null>(null);
  const [settings, setSettings] = useState<LauncherSettings | null>(null);
  const [versions, setVersions] = useState<MinecraftVersion[]>([]);
  const [logs, setLogs] = useState<LauncherLogEntry[]>([]);
  const [status, setStatus] = useState<LaunchStateEvent>({ state: "idle", message: "Ready." });
  const [progress, setProgress] = useState<ProgressEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [microsoftCode, setMicrosoftCode] = useState<MicrosoftDeviceCode | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const selectedVersion = useMemo(() => {
    return versions.find((version) => version.id === settings?.selectedVersion) ?? null;
  }, [settings?.selectedVersion, versions]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [nextSession, nextSettings, nextVersions, recentLogs] = await Promise.all([
        window.launcher.auth.getSession(),
        window.launcher.settings.get(),
        window.launcher.versions.list(),
        window.launcher.logs.getRecent()
      ]);
      const selectedVersion = nextSettings.selectedVersion || (await window.launcher.versions.getSelected());
      const settingsWithVersion = nextSettings.selectedVersion
        ? nextSettings
        : await window.launcher.settings.update({ selectedVersion });

      setSession(nextSession);
      setSettings(settingsWithVersion);
      setVersions(nextVersions);
      setLogs(recentLogs);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const removeInstallProgress = window.launcher.install.onProgress(setProgress);
    const removeLaunchProgress = window.launcher.launch.onProgress(setProgress);
    const removeLaunchState = window.launcher.launch.onState((event) => {
      setStatus(event);

      if (event.state === "idle" || event.state === "running") {
        setProgress(null);
      }
    });
    const removeLaunchLog = window.launcher.launch.onLog((entry) => {
      setLogs((current) => [...current.slice(-149), entry]);
    });
    const removeAppError = window.launcher.app.onError(setError);

    return () => {
      removeInstallProgress();
      removeLaunchProgress();
      removeLaunchState();
      removeLaunchLog();
      removeAppError();
    };
  }, [refresh]);

  const login = useCallback(async (username: string) => {
    setError(null);
    setAuthLoading(true);

    try {
      const nextSession = await window.launcher.auth.loginOffline({ username });
      const nextSettings = await window.launcher.settings.get();
      setSession(nextSession);
      setSettings(nextSettings);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const startMicrosoftLogin = useCallback(async () => {
    setError(null);
    setAuthLoading(true);

    try {
      if (typeof window.launcher.auth.startMicrosoft !== "function") {
        throw new Error("Microsoft sign-in is not available in this running window. Restart the launcher so the preload bridge can update.");
      }

      const code = await window.launcher.auth.startMicrosoft();
      setMicrosoftCode(code);
      await window.launcher.app.openExternal(code.verificationUri);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const completeMicrosoftLogin = useCallback(async () => {
    if (!microsoftCode) {
      return;
    }

    setError(null);
    setAuthLoading(true);

    try {
      if (typeof window.launcher.auth.completeMicrosoft !== "function") {
        throw new Error("Microsoft sign-in is not available in this running window. Restart the launcher so the preload bridge can update.");
      }

      const nextSession = await window.launcher.auth.completeMicrosoft(microsoftCode.deviceCode);
      setMicrosoftCode(null);
      setSession(nextSession);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setAuthLoading(false);
    }
  }, [microsoftCode]);

  const logout = useCallback(async () => {
    await window.launcher.auth.logout();
    setSession(null);
  }, []);

  const switchOfflineAccount = useCallback(async (username: string) => {
    setError(null);
    const nextSession = await window.launcher.auth.loginOffline({ username });
    const nextSettings = await window.launcher.settings.get();
    setSession(nextSession);
    setSettings(nextSettings);
  }, []);

  const forgetOfflineAccount = useCallback(async (username: string) => {
    setError(null);
    const nextSession = await window.launcher.auth.forgetOffline(username);
    const nextSettings = await window.launcher.settings.get();
    setSession(nextSession);
    setSettings(nextSettings);
  }, []);

  const updateSettings = useCallback(async (update: LauncherSettingsUpdate) => {
    const nextSettings = await window.launcher.settings.update(update);
    setSettings(nextSettings);
  }, []);

  const selectVersion = useCallback(async (versionId: string) => {
    await window.launcher.versions.setSelected(versionId);
    setSettings((current) => (current ? { ...current, selectedVersion: versionId } : current));
  }, []);

  const installVersion = useCallback(async () => {
    if (!settings) {
      return;
    }

    setError(null);
    setStatus({ state: "installing", message: `Preparing Minecraft ${settings.selectedVersion}.` });
    try {
      await window.launcher.install.version(settings.selectedVersion);
      setStatus({ state: "idle", message: "Ready." });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
      setStatus({ state: "error", message: "Install failed." });
    }
  }, [settings]);

  const launch = useCallback(async () => {
    setError(null);
    await window.launcher.launch.start();
  }, []);

  const stop = useCallback(async () => {
    await window.launcher.launch.stop();
    setStatus({ state: "idle", message: "Ready." });
  }, []);

  const openExternal = useCallback(async (url: string) => {
    await window.launcher.app.openExternal(url);
  }, []);

  return {
    session,
    settings,
    versions,
    logs,
    status,
    progress,
    error,
    loading,
    microsoftCode,
    authLoading,
    selectedVersion,
    login,
    startMicrosoftLogin,
    completeMicrosoftLogin,
    logout,
    switchOfflineAccount,
    forgetOfflineAccount,
    updateSettings,
    selectVersion,
    installVersion,
    launch,
    stop,
    openExternal
  };
}
