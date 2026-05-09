# JiferCraft Launcher

JiferCraft Launcher es un launcher de Minecraft hecho para JiferCraft Studios. La idea es simple: abrir el juego desde una aplicación limpia, rápida y fácil de usar, sin obligar al jugador a pelearse con configuraciones raras antes de entrar a jugar.

El launcher está construido con Electron, React, TypeScript, Bun y `minecraft-launcher-core`. Actualmente permite jugar en modo no-premium mediante sesiones offline locales, iniciar sesión con Microsoft para cuentas premium, elegir versiones de Minecraft desde los metadatos oficiales de Mojang y ajustar opciones básicas como memoria, Java, carpeta del juego y tamaño de ventana.

Creado por **JainaGam3r45** y desarrollado por **JiferCraft Studios**.  
Sitio oficial: [https://www.jifercraft.com/](https://www.jifercraft.com/)

## Características

- Modo **no-premium** con nombre de usuario offline y cuentas recordadas localmente.
- Inicio de sesión **premium** con Microsoft mediante device code flow.
- Sesión Microsoft cifrada con Electron `safeStorage` y refresh automático con `refresh_token`.
- Listado de versiones de Minecraft obtenido desde Mojang.
- Inicio del juego usando `minecraft-launcher-core`.
- Ajustes locales para memoria, ruta de Java, carpeta de Minecraft, resolución y pantalla completa.
- Historial de versiones jugadas para volver rápido a las más usadas.
- Registros centralizados del launcher y del proceso de Minecraft.
- Interfaz de escritorio moderna, hecha con React y aislada del proceso principal mediante preload seguro.

## Estado del proyecto

El launcher ya tiene una base funcional para iniciar Minecraft, manejar cuentas no-premium y restaurar sesiones premium de Microsoft. Algunas partes, como un instalador más completo para assets/librerías, están preparadas a nivel de arquitectura pero pueden seguir evolucionando.

La prioridad del proyecto es mantener una experiencia clara, estable y fácil de ampliar, sin llenar el launcher de dependencias o sistemas innecesarios.

## Requisitos

- Bun 1.3 o superior.
- Java instalado en el sistema, o una ruta configurada desde los ajustes del launcher.
- Windows, Linux o macOS.

En Windows, si no configuras una ruta de Java dentro del launcher, se intentará usar `JAVA_HOME\bin\javaw.exe` y luego `javaw` desde el sistema.

## Instalación

```bash
bun install
```

## Variables de entorno

Copia `.env.example` como `.env` si necesitas configuración local:

```bash
MICROSOFT_CLIENT_ID=tu-client-id-publico
JAVA_HOME=C:\Program Files\Java\jdk-21
```

`MICROSOFT_CLIENT_ID` es necesario para usar el inicio de sesión premium con Microsoft. Para jugar en modo no-premium no hace falta configurar ninguna cuenta externa.

## Desarrollo

```bash
bun run dev
```

Para revisar tipos y generar una build:

```bash
bun run typecheck
bun run build
```

## Estructura

```text
src/
  main/       servicios, comandos IPC, eventos de Electron y utilidades del proceso principal
  preload/    puente seguro entre Electron y React
  renderer/   interfaz del launcher
  shared/     tipos, constantes y contratos compartidos
  assets/     imágenes y recursos visuales
docs/         notas técnicas del proyecto
```

El renderer no accede directamente a Node.js ni a Electron. Todo pasa por `window.launcher`, que se expone desde el preload con `contextBridge`. Esto mantiene la UI separada de la lógica sensible del launcher.

## Datos locales

JiferCraft Launcher guarda sus datos en una carpeta dedicada llamada `.jifercloud`:

- Windows: `%APPDATA%\.jifercloud`
- macOS: `~/Library/Application Support/.jifercloud`
- Linux: `~/.config/.jifercloud`

Dentro se guardan los ajustes del launcher, las cuentas offline recordadas, los datos de sesión premium cuando corresponda y los archivos de Minecraft administrados por el launcher.

## Sugerencias y reportes

Si encuentras un error, tienes una idea o quieres proponer una mejora, puedes abrir un issue en el repositorio o contactar con JiferCraft Studios desde el sitio oficial.

## Licencia

Copyright 2026 JainaGam3r45 / JiferCraft Studios

Este proyecto está licenciado bajo Apache License 2.0. Revisa [LICENSE](./LICENSE) y [NOTICE](./NOTICE) para más detalles.
