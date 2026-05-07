import type { LaunchStateEvent, ProgressEvent } from "../../shared/types/events";
import { translateStatusMessage, type LauncherCopy } from "../i18n";

interface StatusBarProps {
  status: LaunchStateEvent;
  progress: ProgressEvent | null;
  copy: LauncherCopy;
}

export function StatusBar({ status, progress, copy }: StatusBarProps) {
  const percent = resolvePercent(progress);
  const isIdle = status.state === "idle" && !progress;
  const message = translateStatusMessage(progress?.message ?? status.message, copy);
  const showProgress = status.state === "installing" || status.state === "launching" || status.state === "stopping";

  if (isIdle) {
    return null;
  }

  return (
    <section className={`statusbar ${showProgress ? "" : "statusbar-compact"}`} aria-live="polite">
      <div>
        <span className={`state state-${status.state}`}>{copy.status.label[status.state]}</span>
        <p>{message}</p>
      </div>
      {showProgress ? (
        <div className="progress" aria-label={copy.status.progressLabel}>
          <span className={percent === null ? "indeterminate" : ""} style={percent === null ? undefined : { width: `${percent}%` }} />
        </div>
      ) : null}
    </section>
  );
}

function resolvePercent(progress: ProgressEvent | null): number | null {
  if (!progress) {
    return null;
  }

  if (typeof progress.percent === "number" && Number.isFinite(progress.percent)) {
    return Math.max(0, Math.min(progress.percent, 100));
  }

  if (typeof progress.current === "number" && typeof progress.total === "number" && progress.total > 0) {
    return Math.max(0, Math.min((progress.current / progress.total) * 100, 100));
  }

  return null;
}
