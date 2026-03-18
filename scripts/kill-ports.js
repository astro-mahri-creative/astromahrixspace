#!/usr/bin/env node
/**
 * kill-ports.js — Kill processes occupying dev server ports before startup.
 * Usage: node scripts/kill-ports.js [port1] [port2] ...
 * Default ports: 3002 8890
 */
import { execSync } from "child_process";

const defaultPorts = [3002, 8890, 5000];
const ports =
  process.argv.length > 2
    ? process.argv.slice(2).map(Number)
    : defaultPorts;

const isWin = process.platform === "win32";

for (const port of ports) {
  try {
    if (isWin) {
      const out = execSync(
        `netstat -ano | findstr ":${port} " | findstr "LISTENING"`,
        { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
      );
      const pids = new Set(
        out
          .split("\n")
          .map((line) => line.trim().split(/\s+/).pop())
          .filter((pid) => pid && pid !== "0")
      );
      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F`, {
            stdio: ["pipe", "pipe", "pipe"],
          });
          console.log(`Killed PID ${pid} on port ${port}`);
        } catch {
          // already dead
        }
      }
    } else {
      const out = execSync(`lsof -ti :${port}`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      const pids = out.trim().split("\n").filter(Boolean);
      for (const pid of pids) {
        try {
          execSync(`kill -9 ${pid}`, { stdio: ["pipe", "pipe", "pipe"] });
          console.log(`Killed PID ${pid} on port ${port}`);
        } catch {
          // already dead
        }
      }
    }
  } catch {
    // No process on this port — all clear
  }
}

console.log(`Ports checked: ${ports.join(", ")} — all clear`);
