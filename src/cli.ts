#!/usr/bin/env node
import { parseArgs } from "node:util";

import * as p from "@clack/prompts";

import { runSetup } from "./commands/setup.ts";

const VERSION = "0.0.0";

interface Command {
  description: string;
  run(values: Record<string, unknown>): Promise<void>;
}

const commands: Record<string, Command> = {
  setup: {
    description: "Configure secure publishing for an existing package",
    run: (v) =>
      runSetup({
        dryRun: Boolean(v["dry-run"]),
        yes: Boolean(v.yes),
        packageName: v.package as string | undefined,
        repo: v.repo as string | undefined,
      }),
  },
};

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    help: { type: "boolean", short: "h" },
    version: { type: "boolean", short: "v" },
    "dry-run": { type: "boolean" },
    yes: { type: "boolean", short: "y" },
    package: { type: "string" },
    repo: { type: "string" },
  },
});

if (values.version) {
  process.stdout.write(`${VERSION}\n`);
  process.exit(0);
}

const cmd = positionals[0];
if (!cmd || values.help) {
  process.stdout.write(`${usage()}\n`);
  process.exit(values.help ? 0 : 1);
}

if (!(cmd in commands)) {
  p.log.error(`Unknown command: ${cmd}`);
  process.stdout.write(`${usage()}\n`);
  process.exit(1);
}

try {
  await commands[cmd]!.run(values);
} catch (e) {
  p.log.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
}

function usage(): string {
  const cmdList = Object.entries(commands)
    .map(([name, c]) => `  ${name.padEnd(16)} ${c.description}`)
    .join("\n");
  return [
    "safeship - secure publishing setup for npm packages",
    "",
    "Usage:",
    "  safeship <command> [options]",
    "",
    "Commands:",
    cmdList,
    "",
    "Options:",
    "  --dry-run             Show what would happen without making changes",
    "  -y, --yes             Skip prompts; pick reasonable defaults",
    "  --package <name>      Override detected package name",
    "  --repo <owner/name>   Override detected GitHub repo",
    "  -h, --help            Show this help",
    "  -v, --version         Show version",
  ].join("\n");
}
