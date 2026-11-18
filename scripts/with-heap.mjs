import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/with-heap.mjs <command> [...args]");
  process.exit(1);
}

const existing = process.env.NODE_OPTIONS || "";
const hasHeapFlag = /--max-old-space-size(?:=|\s)\d+/i.test(existing);
const nodeOptions = hasHeapFlag
  ? existing
  : [existing, "--max-old-space-size=4096"].filter(Boolean).join(" ");

const [command, ...cmdArgs] = args;

const BIN_ENTRYPOINTS = {
  next: path.resolve(process.cwd(), "node_modules", "next", "dist", "bin", "next"),
  "opennextjs-cloudflare": path.resolve(
    process.cwd(),
    "node_modules",
    "@opennextjs",
    "cloudflare",
    "dist",
    "cli",
    "index.js",
  ),
};

const env = {
  ...process.env,
  NODE_OPTIONS: nodeOptions,
};

let execCommand = command;
let execArgs = cmdArgs;

if (command === "node") {
  execCommand = process.execPath;
} else if (BIN_ENTRYPOINTS[command] && fs.existsSync(BIN_ENTRYPOINTS[command])) {
  execCommand = process.execPath;
  execArgs = [BIN_ENTRYPOINTS[command], ...cmdArgs];
}

const child = spawn(execCommand, execArgs, {
  stdio: "inherit",
  shell: false,
  env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
