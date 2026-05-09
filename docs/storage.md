# Local Storage

JiferCraft Launcher stores local data in a dedicated `.jifercloud` directory.

- Windows: `%APPDATA%\.jifercloud`
- macOS: `~/Library/Application Support/.jifercloud`
- Linux: `~/.config/.jifercloud`

The current structure is:

```text
.jifercloud/
  settings.json
  session.json
  minecraft/
    versions/
    assets/
    libraries/
```

`settings.json` contains launcher preferences such as selected version, version filters, last offline username, memory, Java path, game directory, and window options.

`session.json` contains the encrypted Microsoft launcher session when Electron secure storage is available.

Minecraft libraries, assets, and version metadata live under `minecraft/`.
