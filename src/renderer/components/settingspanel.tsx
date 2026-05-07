import type { LauncherSettings, LauncherSettingsUpdate } from "../../shared/types/settings";
import type { LauncherCopy } from "../i18n";

type SettingsCopy = LauncherCopy["settingsPanel"];

interface SettingsPanelProps {
  settings: LauncherSettings;
  onUpdate: (update: LauncherSettingsUpdate) => Promise<void>;
  copy: SettingsCopy;
}

export function SettingsPanel({ settings, onUpdate, copy }: SettingsPanelProps) {
  return (
    <section className="panel settings-panel">
      <div className="panel-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
      </div>
      <div className="grid two">
        <label>
          {copy.minMemory}
          <input value={settings.memory.min} onChange={(event) => void onUpdate({ memory: { min: event.target.value } })} />
        </label>
        <label>
          {copy.maxMemory}
          <input value={settings.memory.max} onChange={(event) => void onUpdate({ memory: { max: event.target.value } })} />
        </label>
      </div>
      <label>
        {copy.minecraftDirectory}
        <input value={settings.minecraftRoot} onChange={(event) => void onUpdate({ minecraftRoot: event.target.value })} />
      </label>
      <label>
        {copy.javaPath}
        <input value={settings.javaPath} onChange={(event) => void onUpdate({ javaPath: event.target.value })} placeholder={copy.javaPathPlaceholder} />
      </label>
      <div className="grid three">
        <label>
          {copy.width}
          <input
            type="number"
            value={settings.window.width}
            onChange={(event) => void onUpdate({ window: { width: Number(event.target.value) } })}
          />
        </label>
        <label>
          {copy.height}
          <input
            type="number"
            value={settings.window.height}
            onChange={(event) => void onUpdate({ window: { height: Number(event.target.value) } })}
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={settings.window.fullscreen}
            onChange={(event) => void onUpdate({ window: { fullscreen: event.target.checked } })}
          />
          {copy.fullscreen}
        </label>
      </div>
    </section>
  );
}
