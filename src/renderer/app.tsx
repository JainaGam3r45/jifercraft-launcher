import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { appInfo } from "../shared/constants/app";
import coverOne from "../assets/coverone.png";
import coverThree from "../assets/coverthree.png";
import coverTwo from "../assets/covertwo.png";
import logo from "../assets/logo.png";
import { LoginPanel } from "./components/loginpanel";
import { LogPanel } from "./components/logpanel";
import { SettingsPanel } from "./components/settingspanel";
import { StatusBar } from "./components/statusbar";
import { launcherCopy, type LauncherCopy } from "./i18n";
import { AboutPage } from "./pages/aboutpage";
import { useAppState } from "./store/useappstate";

export function App() {
  const launcher = useAppState();
  const [activeModal, setActiveModal] = useState<"settings" | "about" | "logs" | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [versionType, setVersionType] = useState<"release" | "snapshot" | "all">("release");
  const [versionSearch, setVersionSearch] = useState("");
  const shellStyle = {
    "--cover-one": `url(${coverOne})`,
    "--cover-two": `url(${coverTwo})`,
    "--cover-three": `url(${coverThree})`
  } as CSSProperties;

  useEffect(() => {
    if (!launcher.settings) {
      return;
    }

    setVersionType(launcher.settings.ui.versionFilter);
    setVersionSearch(launcher.settings.ui.versionSearch);
  }, [launcher.settings?.ui.versionFilter, launcher.settings?.ui.versionSearch]);

  const filteredVersions = useMemo(() => {
    const query = versionSearch.trim().toLowerCase();

    return launcher.versions
      .filter((version) => versionType === "all" || version.type === versionType)
      .filter((version) => !query || version.id.toLowerCase().includes(query))
      .slice(0, 180);
  }, [launcher.versions, versionSearch, versionType]);
  const displayedVersions = useMemo(() => {
    if (filteredVersions.some((version) => version.id === launcher.settings?.selectedVersion)) {
      return filteredVersions;
    }

    const selected = launcher.versions.find((version) => version.id === launcher.settings?.selectedVersion);
    return selected ? [selected, ...filteredVersions] : filteredVersions;
  }, [filteredVersions, launcher.settings?.selectedVersion, launcher.versions]);
  const recentVersions = useMemo(() => {
    return launcher.settings?.history.playedVersions.filter((versionId) => launcher.versions.some((version) => version.id === versionId)) ?? [];
  }, [launcher.settings?.history.playedVersions, launcher.versions]);

  if (launcher.loading || !launcher.settings) {
    return (
      <main className="launcher-shell loading-screen" style={shellStyle}>
        <div className="loader-card">
          <img className="brand-mark large" src={logo} alt="" />
          <p className="eyebrow">JiferCraft Studios</p>
          <h1>{appInfo.name}</h1>
          <div className="loader-line" />
        </div>
      </main>
    );
  }

  const busy = launcher.status.state === "installing" || launcher.status.state === "launching" || launcher.status.state === "running";
  const canLaunch = Boolean(launcher.session) && !busy;
  const canStop = launcher.status.state === "installing" || launcher.status.state === "launching" || launcher.status.state === "running";
  const avatarUrl = `https://mc-heads.net/avatar/${encodeURIComponent(launcher.session?.username ?? "Steve")}/48`;
  const language = launcher.settings.ui.language;
  const selectedVersionId = launcher.settings.selectedVersion;
  const copy = launcherCopy[language];

  function updateVersionFilter(nextFilter: "release" | "snapshot" | "all") {
    setVersionType(nextFilter);
    void launcher.updateSettings({ ui: { versionFilter: nextFilter } });
  }

  function updateVersionSearch(nextSearch: string) {
    setVersionSearch(nextSearch);
    void launcher.updateSettings({ ui: { versionSearch: nextSearch } });
  }

  function selectLanguage(nextLanguage: "es" | "en") {
    setLanguageMenuOpen(false);
    void launcher.updateSettings({ ui: { language: nextLanguage } });
  }

  if (!launcher.session) {
    return (
      <main className="launcher-shell auth-shell" style={shellStyle}>
        <section className="auth-brand">
          <div className="brand-lockup auth-lockup">
            <img className="dashboard-logo" src={logo} alt="" />
            <div>
              <p className="eyebrow">JiferCraft Studios</p>
              <h1>{appInfo.name}</h1>
            </div>
          </div>
          <div className="auth-message">
            <p className="eyebrow">{copy.ready}</p>
            <h2>{copy.login.offlineTitle}</h2>
            <p>{copy.login.offlineHelp}</p>
          </div>
        </section>
        <section className="auth-panel-wrap">
          {launcher.error ? (
            <aside className="toast-error">
              <strong>{copy.signInFailed}</strong>
              <span>{launcher.error}</span>
            </aside>
          ) : null}
          <LoginPanel
            session={launcher.session}
            microsoftCode={launcher.microsoftCode}
            authLoading={launcher.authLoading}
            microsoftEnabled={true}
            lastOfflineUsername={launcher.settings.user.lastOfflineUsername}
            copy={copy.login}
            onMicrosoftLogin={launcher.startMicrosoftLogin}
            onCompleteMicrosoftLogin={launcher.completeMicrosoftLogin}
            onLogin={launcher.login}
            onLogout={launcher.logout}
          />
          <p className="release-label">{copy.releaseLabel}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="launcher-shell dashboard-shell" style={shellStyle}>
      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="brand-lockup">
            <img className="dashboard-logo" src={logo} alt="" />
            <div>
              <p className="eyebrow">JiferCraft Studios</p>
              <h1>{appInfo.name}</h1>
            </div>
          </div>
          <div className="topbar-progress">
            <StatusBar status={launcher.status} progress={launcher.progress} copy={copy} />
          </div>
          <div className="topbar-right">
            <div className="hero-actions top-actions" aria-label={copy.launcherLinks}>
              <div className="language-menu">
                <button type="button" onClick={() => setLanguageMenuOpen((current) => !current)} aria-label={copy.language} title={copy.language} aria-expanded={languageMenuOpen}>
                  <LanguageIcon />
                </button>
                {languageMenuOpen ? (
                  <div className="language-dropdown">
                    <button type="button" className={language === "es" ? "active" : ""} onClick={() => selectLanguage("es")}>
                      ES
                    </button>
                    <button type="button" className={language === "en" ? "active" : ""} onClick={() => selectLanguage("en")}>
                      EN
                    </button>
                  </div>
                ) : null}
              </div>
              <button type="button" onClick={() => void launcher.openExternal("https://discord.jifercraft.com")} aria-label={copy.discord} title={copy.discord}>
                <CommunityIcon />
              </button>
              <button type="button" onClick={() => void launcher.openExternal("https://paypal.me/jifercloud")} aria-label={copy.donate} title={copy.donate}>
                <DonateIcon />
              </button>
            </div>
            <AccountMenu
              username={launcher.session.username}
              mode={launcher.session.mode}
              avatarUrl={avatarUrl}
              accounts={launcher.settings.user.offlineAccounts}
              open={accountMenuOpen}
              copy={copy}
              onToggle={() => setAccountMenuOpen((current) => !current)}
              onSwitch={(username) => {
                setAccountMenuOpen(false);
                void launcher.switchOfflineAccount(username);
              }}
              onForget={(username) => void launcher.forgetOfflineAccount(username)}
              onOpenLogs={() => {
                setAccountMenuOpen(false);
                setActiveModal("logs");
              }}
              onOpenAbout={() => {
                setAccountMenuOpen(false);
                setActiveModal("about");
              }}
              onLogout={() => {
                setAccountMenuOpen(false);
                void launcher.logout();
              }}
            />
          </div>
        </header>

        {launcher.error ? <aside className="toast-error inline">{launcher.error}</aside> : null}

        <section className="hero-stage">
          <div className="hero-copy">
            <p className="eyebrow">{copy.ready}</p>
            <h2>{selectedVersionId || copy.version}</h2>
            <p>{copy.tagline}</p>
            <div className="hero-recent">
              <p>{copy.recentTitle}</p>
              {recentVersions.length > 0 ? (
                <div>
                  {recentVersions.map((versionId) => (
                    <button key={versionId} type="button" onClick={() => void launcher.selectVersion(versionId)} className={versionId === selectedVersionId ? "active" : ""}>
                      {versionId}
                    </button>
                  ))}
                </div>
              ) : (
                <span>{copy.recentEmpty}</span>
              )}
            </div>
          </div>
          <aside className="hero-launch">
            <div className="launch-card-heading">
              <p className="eyebrow">{copy.play}</p>
              <span>{launcher.session.mode === "microsoft" ? copy.accountStatusPremium : copy.accountStatusOffline}</span>
            </div>
            <div className="launch-version-row">
              <select value={selectedVersionId} onChange={(event) => void launcher.selectVersion(event.target.value)} aria-label={copy.version}>
                {displayedVersions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.id} · {version.type}
                  </option>
                ))}
              </select>
              <button
                className="play-button"
                type="button"
                onClick={() => void (canStop ? launcher.stop() : launcher.launch())}
                disabled={!canLaunch && !canStop}
              >
                {canStop ? copy.stop : copy.play}
              </button>
              <button className="settings-split-button" type="button" onClick={() => setActiveModal("settings")} aria-label={copy.openSettings}>
                <SettingsIcon />
              </button>
            </div>
            <details className="advanced-version">
              <summary>{copy.searchVersion}</summary>
              <div className="version-controls">
                <select value={versionType} onChange={(event) => updateVersionFilter(event.target.value as "release" | "snapshot" | "all")} aria-label={copy.version}>
                  <option value="release">{copy.releases}</option>
                  <option value="snapshot">{copy.snapshots}</option>
                  <option value="all">{copy.allVersions}</option>
                </select>
                <input value={versionSearch} onChange={(event) => updateVersionSearch(event.target.value)} placeholder={copy.searchVersion} aria-label={copy.searchVersion} />
              </div>
            </details>
          </aside>
        </section>

        <section className="content-grid">
          <article className="spotlight-card large">
            <img src={coverTwo} alt="" />
            <div>
              <p className="eyebrow">{copy.hosting}</p>
              <h2>{copy.worldsTitle}</h2>
              <p>{copy.worldsText}</p>
            </div>
          </article>
          <article className="spotlight-card">
            <img src={coverThree} alt="" />
            <div>
              <p className="eyebrow">{copy.discord}</p>
              <h2>{copy.discordTitle}</h2>
              <p>{copy.discordText}</p>
            </div>
          </article>
        </section>

        <footer className="dashboard-footer">
          <span>v{appInfo.version}</span>
          <span>With ♥️ for JainaGam3r45</span>
        </footer>

      </section>

      <Modal title={copy.settings} closeLabel={copy.closeModal} open={activeModal === "settings"} onClose={() => setActiveModal(null)}>
        <div className="modal-panel">
          <SettingsPanel settings={launcher.settings} onUpdate={launcher.updateSettings} copy={copy.settingsPanel} />
        </div>
      </Modal>
      <Modal title={copy.aboutTitle} closeLabel={copy.closeModal} open={activeModal === "about"} onClose={() => setActiveModal(null)}>
        <div className="modal-panel">
          <AboutPage copy={copy.aboutPanel} />
        </div>
      </Modal>
      <Modal title={copy.logsTitle} closeLabel={copy.closeModal} open={activeModal === "logs"} onClose={() => setActiveModal(null)}>
        <div className="modal-panel large">
          <LogPanel logs={launcher.logs} copy={copy.logsPanel} />
        </div>
      </Modal>
    </main>
  );
}

function LanguageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.4 2.5 3.6 5.5 3.6 9S14.4 18.5 12 21" />
      <path d="M12 3c-2.4 2.5-3.6 5.5-3.6 9s1.2 6.5 3.6 9" />
    </svg>
  );
}

function CommunityIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.5 9.5h9" />
      <path d="M8 14h5" />
      <path d="M5 5.5h14a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H11l-5 3v-3H5a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function DonateIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s-7.5-4.4-9.4-9.3C1.2 8.2 3.3 5 6.8 5c2 0 3.7 1.1 5.2 3 1.5-1.9 3.2-3 5.2-3 3.5 0 5.6 3.2 4.2 6.7C19.5 16.6 12 21 12 21Z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1a2.1 2.1 0 0 1-3 3l-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1 1.6V21a2.1 2.1 0 0 1-4.2 0v-.1a1.8 1.8 0 0 0-1.1-1.6 1.8 1.8 0 0 0-2 .4l-.1.1a2.1 2.1 0 0 1-3-3l.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.6-1H2.2a2.1 2.1 0 0 1 0-4.2h.1a1.8 1.8 0 0 0 1.6-1.1 1.8 1.8 0 0 0-.4-2l-.1-.1a2.1 2.1 0 0 1 3-3l.1.1a1.8 1.8 0 0 0 2 .4 1.8 1.8 0 0 0 1.1-1.6V2a2.1 2.1 0 0 1 4.2 0v.1a1.8 1.8 0 0 0 1 1.6 1.8 1.8 0 0 0 2-.4l.1-.1a2.1 2.1 0 0 1 3 3l-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.6 1.1h.1a2.1 2.1 0 0 1 0 4.2H21a1.8 1.8 0 0 0-1.6 1.4Z" />
    </svg>
  );
}

interface AccountMenuProps {
  username: string;
  mode: "offline" | "microsoft";
  avatarUrl: string;
  accounts: string[];
  open: boolean;
  onToggle: () => void;
  onSwitch: (username: string) => void;
  onForget: (username: string) => void;
  onOpenLogs: () => void;
  onOpenAbout: () => void;
  onLogout: () => void;
  copy: LauncherCopy;
}

function AccountMenu({ username, mode, avatarUrl, accounts, open, onToggle, onSwitch, onForget, onOpenLogs, onOpenAbout, onLogout, copy }: AccountMenuProps) {
  return (
    <div className="account-menu">
      <button type="button" className="account-box" onClick={onToggle} aria-expanded={open}>
        <img src={avatarUrl} alt="" />
        <div>
          <strong>{username}</strong>
          <span>{mode === "microsoft" ? copy.accountStatusPremium : copy.accountStatusOffline}</span>
        </div>
        <span className="chevron">v</span>
      </button>
      {open ? (
        <section className="account-dropdown">
          <p className="dropdown-label">{copy.accounts}</p>
          {accounts.length === 0 ? <p className="empty-dropdown">{copy.noSavedAccounts}</p> : null}
          {accounts.map((account) => (
            <article key={account} className="account-row">
              <button type="button" onClick={() => onSwitch(account)}>
                <img src={`https://mc-heads.net/avatar/${encodeURIComponent(account)}/32`} alt="" />
                <span>{account}</span>
              </button>
              <button type="button" className="danger-button" onClick={() => onForget(account)} aria-label={copy.forgetAccount(account)}>
                x
              </button>
            </article>
          ))}
          <div className="dropdown-tools">
            <button type="button" onClick={onOpenLogs}>
              {copy.logs}
            </button>
            <button type="button" onClick={onOpenAbout} aria-label={copy.openAbout}>
              {copy.about}
            </button>
          </div>
          <button type="button" className="dropdown-action" onClick={onLogout}>
            {copy.signOut}
          </button>
        </section>
      ) : null}
    </div>
  );
}

interface ModalProps {
  title: string;
  closeLabel: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

function Modal({ title, closeLabel, open, onClose, children }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label={closeLabel}>
            x
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
