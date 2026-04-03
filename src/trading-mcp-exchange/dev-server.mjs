#!/usr/bin/env node

/**
 * Dev wrapper for MCP server — auto-restarts on file changes.
 * Proxies stdio between Claude Code and the child process.
 *
 * Used as MCP command during development so we don't need to
 * restart Claude Code after every code change.
 */

import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = resolve(__dirname, "src");
const ENTRY = resolve(__dirname, "src", "index.ts");
const TSX = resolve(__dirname, "node_modules", ".bin", "tsx");

let child = null;
let restarting = false;
let debounceTimer = null;

function startServer() {
  child = spawn(TSX, [ENTRY], {
    stdio: ["pipe", "pipe", "pipe"],
    cwd: __dirname,
  });

  // Proxy stdin from parent (Claude Code) to child
  process.stdin.pipe(child.stdin);
  // Proxy stdout from child to parent (Claude Code)
  child.stdout.pipe(process.stdout);
  // Stderr goes to parent stderr for debugging
  child.stderr.pipe(process.stderr);

  child.on("exit", (code) => {
    if (!restarting) {
      process.exit(code ?? 0);
    }
  });
}

function restartServer() {
  if (restarting) return;
  restarting = true;

  process.stderr.write("[dev-server] File changed, restarting...\n");

  // Unpipe before killing
  process.stdin.unpipe(child?.stdin);
  child?.stdout?.unpipe(process.stdout);
  child?.stderr?.unpipe(process.stderr);

  child?.kill("SIGTERM");

  setTimeout(() => {
    restarting = false;
    startServer();
  }, 500);
}

// Watch src/ for changes with debounce
watch(SRC_DIR, { recursive: true }, (_event, filename) => {
  if (!filename?.endsWith(".ts")) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(restartServer, 300);
});

startServer();
