/*
 * Copyright 2026 JainaGam3r45 / JiferCraft Studios
 *
 * Licensed under the Apache License, Version 2.0.
 */
import { resolve } from "node:path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/main/index.ts")
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/preload/index.ts")
        },
        output: {
          format: "cjs",
          entryFileNames: "[name].js"
        }
      }
    }
  },
  renderer: {
    root: "src/renderer",
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/renderer/index.html")
        }
      }
    }
  }
});
