import type { LauncherState } from "../shared/types/events";
import type { LauncherSettings } from "../shared/types/settings";

export type LauncherLanguage = LauncherSettings["ui"]["language"];

export interface LauncherCopy {
  ready: string;
  tagline: string;
  worldsTitle: string;
  worldsText: string;
  hosting: string;
  discordTitle: string;
  discordText: string;
  version: string;
  releases: string;
  snapshots: string;
  allVersions: string;
  searchVersion: string;
  play: string;
  stop: string;
  language: string;
  discord: string;
  donate: string;
  logs: string;
  about: string;
  settings: string;
  aboutTitle: string;
  logsTitle: string;
  signInFailed: string;
  releaseLabel: string;
  launcherLinks: string;
  launcherTools: string;
  openSettings: string;
  openLogs: string;
  openAbout: string;
  closeModal: string;
  recentTitle: string;
  recentEmpty: string;
  accountStatusPremium: string;
  accountStatusOffline: string;
  accounts: string;
  noSavedAccounts: string;
  forgetAccount: (username: string) => string;
  signOut: string;
  login: {
    session: string;
    premiumSession: string;
    offlineSession: string;
    microsoftSignIn: string;
    microsoftDisabledTitle: string;
    microsoftDisabledText: string;
    deviceCodePrompt: string;
    finishedSignIn: string;
    microsoftHelp: string;
    offlineTitle: string;
    offlineHelp: string;
    offlineUsername: string;
    playerNamePlaceholder: string;
    continueOffline: string;
    signOut: string;
  };
  settingsPanel: {
    eyebrow: string;
    title: string;
    minMemory: string;
    maxMemory: string;
    minecraftDirectory: string;
    javaPath: string;
    javaPathPlaceholder: string;
    width: string;
    height: string;
    fullscreen: string;
  };
  logsPanel: {
    eyebrow: string;
    title: string;
    empty: string;
  };
  aboutPanel: {
    eyebrow: string;
    author: string;
    organization: string;
    website: string;
    license: string;
  };
  status: {
    label: Record<LauncherState, string>;
    progressLabel: string;
    messages: Record<string, string>;
    preparingMinecraft: (versionId: string) => string;
  };
}

export const launcherCopy: Record<LauncherLanguage, LauncherCopy> = {
  es: {
    ready: "Listo para jugar",
    tagline: "Selecciona una versión, elige tu perfil y abre Minecraft desde un launcher limpio.",
    worldsTitle: "JiferCloud, hosting de JiferCraft",
    worldsText: "Crea tu servidor con el hosting oficial de JiferCraft Studios.",
    hosting: "Hosting",
    discordTitle: "Únete al Discord de JiferCraft",
    discordText: "Recibe noticias, soporte y novedades de la comunidad.",
    version: "Versión",
    releases: "Estables",
    snapshots: "Snapshots",
    allVersions: "Todas",
    searchVersion: "Buscar versión",
    play: "Jugar",
    stop: "Detener",
    language: "EN",
    discord: "Discord",
    donate: "Donar",
    logs: "Registros",
    about: "?",
    settings: "Ajustes",
    aboutTitle: "Información",
    logsTitle: "Registros de depuración",
    signInFailed: "Error al iniciar sesión",
    releaseLabel: "versión/0.1.0",
    launcherLinks: "Enlaces del launcher",
    launcherTools: "Herramientas del launcher",
    openSettings: "Abrir ajustes",
    openLogs: "Abrir registros de depuración",
    openAbout: "Abrir información",
    closeModal: "Cerrar ventana",
    recentTitle: "Tus últimas conexiones",
    recentEmpty: "Aún no hay versiones recientes.",
    accountStatusPremium: "Premium",
    accountStatusOffline: "Sin conexión",
    accounts: "Cuentas",
    noSavedAccounts: "No hay cuentas sin conexión guardadas.",
    forgetAccount: (username) => `Olvidar ${username}`,
    signOut: "Cerrar sesión",
    login: {
      session: "Sesión",
      premiumSession: "Sesión premium de Microsoft activa.",
      offlineSession: "Sesión sin conexión activa.",
      microsoftSignIn: "Iniciar sesión con Microsoft",
      microsoftDisabledTitle: "Inicio de sesión con Microsoft desactivado",
      microsoftDisabledText: "La autenticación premium se habilitará más adelante.",
      deviceCodePrompt: "Introduce este código en la página de Microsoft:",
      finishedSignIn: "Ya terminé de iniciar sesión",
      microsoftHelp: "Usa tu cuenta de Microsoft para jugar Minecraft Java Edition con un perfil premium.",
      offlineTitle: "Modo no-premium",
      offlineHelp: "Elige un nombre de jugador y el launcher iniciará Minecraft con una sesión offline local.",
      offlineUsername: "Nombre de usuario sin conexión",
      playerNamePlaceholder: "NombreJugador",
      continueOffline: "Continuar sin conexión",
      signOut: "Cerrar sesión"
    },
    settingsPanel: {
      eyebrow: "Ajustes",
      title: "Ejecución",
      minMemory: "Memoria mínima",
      maxMemory: "Memoria máxima",
      minecraftDirectory: "Directorio de Minecraft",
      javaPath: "Ruta de Java",
      javaPathPlaceholder: "Déjalo vacío para usar java",
      width: "Ancho",
      height: "Alto",
      fullscreen: "Pantalla completa"
    },
    logsPanel: {
      eyebrow: "Depuración",
      title: "Registros",
      empty: "Aún no hay registros."
    },
    aboutPanel: {
      eyebrow: "Información",
      author: "Autor",
      organization: "Organización",
      website: "Sitio web",
      license: "Licencia"
    },
    status: {
      label: {
        idle: "En espera",
        installing: "Instalando",
        launching: "Iniciando",
        running: "En ejecución",
        stopping: "Deteniendo",
        error: "Error"
      },
      progressLabel: "Progreso actual del launcher",
      messages: {
        "Ready.": "Listo.",
        "Install failed.": "La instalación falló."
      },
      preparingMinecraft: (versionId) => `Preparando Minecraft ${versionId}.`
    }
  },
  en: {
    ready: "Ready to play",
    tagline: "Select a version, choose your profile, and launch Minecraft from one clean place.",
    worldsTitle: "JiferCloud, hosting by JiferCraft",
    worldsText: "Create your server with the official hosting from JiferCraft Studios.",
    hosting: "Hosting",
    discordTitle: "Join the JiferCraft Discord",
    discordText: "Get community updates, support, and server news.",
    version: "Version",
    releases: "Releases",
    snapshots: "Snapshots",
    allVersions: "All",
    searchVersion: "Search version",
    play: "Play",
    stop: "Stop",
    language: "ES",
    discord: "Discord",
    donate: "Donate",
    logs: "Logs",
    about: "?",
    settings: "Settings",
    aboutTitle: "About",
    logsTitle: "Debug logs",
    signInFailed: "Sign-in failed",
    releaseLabel: "release/0.1.0",
    launcherLinks: "Launcher links",
    launcherTools: "Launcher tools",
    openSettings: "Open settings",
    openLogs: "Open debug logs",
    openAbout: "Open about",
    closeModal: "Close modal",
    recentTitle: "Your latest sessions",
    recentEmpty: "No recent versions yet.",
    accountStatusPremium: "Premium",
    accountStatusOffline: "Offline",
    accounts: "Accounts",
    noSavedAccounts: "No saved offline accounts.",
    forgetAccount: (username) => `Forget ${username}`,
    signOut: "Sign out",
    login: {
      session: "Session",
      premiumSession: "Premium Microsoft session active.",
      offlineSession: "Offline session active.",
      microsoftSignIn: "Sign in with Microsoft",
      microsoftDisabledTitle: "Microsoft sign-in disabled",
      microsoftDisabledText: "Premium authentication will be enabled later.",
      deviceCodePrompt: "Enter this code on the Microsoft page:",
      finishedSignIn: "I finished signing in",
      microsoftHelp: "Use your Microsoft account to play Minecraft Java Edition with a premium profile.",
      offlineTitle: "Non-premium mode",
      offlineHelp: "Choose a player name and the launcher will start Minecraft with a local offline session.",
      offlineUsername: "Offline username",
      playerNamePlaceholder: "PlayerName",
      continueOffline: "Continue offline",
      signOut: "Sign out"
    },
    settingsPanel: {
      eyebrow: "Settings",
      title: "Runtime",
      minMemory: "Minimum memory",
      maxMemory: "Maximum memory",
      minecraftDirectory: "Minecraft directory",
      javaPath: "Java path",
      javaPathPlaceholder: "Leave empty to use java",
      width: "Width",
      height: "Height",
      fullscreen: "Fullscreen"
    },
    logsPanel: {
      eyebrow: "Debug",
      title: "Logs",
      empty: "No logs yet."
    },
    aboutPanel: {
      eyebrow: "About",
      author: "Author",
      organization: "Organization",
      website: "Website",
      license: "License"
    },
    status: {
      label: {
        idle: "Idle",
        installing: "Installing",
        launching: "Launching",
        running: "Running",
        stopping: "Stopping",
        error: "Error"
      },
      progressLabel: "Current launcher progress",
      messages: {
        "Ready.": "Ready.",
        "Install failed.": "Install failed."
      },
      preparingMinecraft: (versionId) => `Preparing Minecraft ${versionId}.`
    }
  }
};

export function translateStatusMessage(message: string, copy: LauncherCopy): string {
  const preparingMatch = /^Preparing Minecraft (.+)\.$/.exec(message);

  if (preparingMatch) {
    return copy.status.preparingMinecraft(preparingMatch[1]);
  }

  return copy.status.messages[message] ?? message;
}
