import * as p from "@clack/prompts";

import { NPM_MIN_VERSION, PUBLISH_ENV } from "../core/constants.ts";
import { execInherit } from "../core/exec.ts";
import type { Module } from "../core/types.ts";

function meetsMinVersion(version: string | null, min: string): boolean {
  if (!version) return false;
  const parse = (v: string) => v.split(".").map((n) => Number.parseInt(n, 10) || 0);
  const [a, b, c] = parse(version);
  const [x, y, z] = parse(min);
  if (a !== x) return a > x;
  if (b !== y) return b > y;
  return c >= z;
}

export const npmTrust: Module = {
  id: "npm-trust",
  category: "npm",
  label: "npm trusted publisher (staged publish)",
  available: (state) => state.npmAuthed && meetsMinVersion(state.npmVersion, NPM_MIN_VERSION),
  hint: (state) => {
    if (!state.npmAuthed) return "needs npm auth";
    if (!meetsMinVersion(state.npmVersion, NPM_MIN_VERSION)) {
      return `needs npm >= ${NPM_MIN_VERSION} (have ${state.npmVersion ?? "unknown"})`;
    }
    return "interactive 2FA";
  },
  defaultSelected: (state) => state.npmAuthed && meetsMinVersion(state.npmVersion, NPM_MIN_VERSION),
  async run(state, options) {
    const args = [
      "trust",
      "github",
      "--file",
      "release.yml",
      "--repo",
      state.repo,
      "--env",
      PUBLISH_ENV,
      "--allow-stage-publish",
    ];
    if (options.dryRun) {
      p.log.info(`[dry-run] would run: npm ${args.join(" ")}`);
      return;
    }
    p.log.message("npm trust will prompt for 2FA. Follow the prompts:");
    try {
      await execInherit("npm", args);
      p.log.success("Configured npm trusted publisher");
    } catch (e) {
      p.log.warn(`npm trust failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
  followUp: (state) => {
    const stagingUrl = state.npmUsername
      ? `https://www.npmjs.com/settings/${state.npmUsername}/staging`
      : `https://www.npmjs.com/settings/<your-username>/staging`;
    return [
      `Lock down publishing access (no API for this):`,
      `  npmjs.com → Packages → ${state.packageName} → Settings → Publishing access → "Require 2FA and disallow tokens"`,
      ``,
      `Approve staged publishes on npmjs.com after each release:`,
      `  ${stagingUrl}`,
    ].join("\n");
  },
};
