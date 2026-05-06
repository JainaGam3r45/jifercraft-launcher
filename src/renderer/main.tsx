/*
 * Copyright 2026 JainaGam3r45 / JiferCraft Studios
 *
 * Licensed under the Apache License, Version 2.0.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import "./styles/main.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element was not found.");
}

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
