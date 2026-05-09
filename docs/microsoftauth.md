# Microsoft Authentication

JiferCraft Launcher supports premium Microsoft sign-in through the device code flow.

## Setup

Create a public Microsoft Entra application and put its client id in `.env`:

```text
MICROSOFT_CLIENT_ID=your-public-client-id
```

The app must allow public/native client authentication. No client secret should be shipped in the launcher.

## Flow

1. The launcher requests a Microsoft device code.
2. The user opens the Microsoft verification page and enters the code.
3. The launcher exchanges the token with Xbox Live.
4. The launcher exchanges the XSTS token with Minecraft Services.
5. The launcher fetches the Minecraft Java profile and stores the session with Electron `safeStorage`.
6. On the next app start, or before launch, the launcher refreshes the Microsoft session when a refresh token is available.

Offline login remains available for development and testing.
