import type { LauncherLogEntry } from "../../shared/types/events";
import type { LauncherCopy } from "../i18n";

type LogsCopy = LauncherCopy["logsPanel"];

interface LogPanelProps {
  logs: LauncherLogEntry[];
  copy: LogsCopy;
}

export function LogPanel({ logs, copy }: LogPanelProps) {
  return (
    <section className="panel logs-panel">
      <div className="panel-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
      </div>
      <div className="logs">
        {logs.length === 0 ? (
          <p className="muted">{copy.empty}</p>
        ) : (
          logs.map((entry) => (
            <article key={entry.id} className={`log log-${entry.level}`}>
              <time>{new Date(entry.timestamp).toLocaleTimeString()}</time>
              <strong>{entry.level}</strong>
              <span>{entry.message}</span>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
