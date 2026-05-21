import { access } from "node:fs/promises";

import { ACTIONS } from "./constants.ts";

export type PackageManager = "bun" | "npm" | "pnpm" | "yarn";

export async function detectPackageManager(): Promise<PackageManager | null> {
  if ((await fileExists("bun.lock")) || (await fileExists("bun.lockb"))) return "bun";
  if (await fileExists("pnpm-lock.yaml")) return "pnpm";
  if (await fileExists("yarn.lock")) return "yarn";
  if (await fileExists("package-lock.json")) return "npm";
  return null;
}

export function installCmd(pm: PackageManager): string {
  switch (pm) {
    case "bun":
      return "bun install --frozen-lockfile --ignore-scripts";
    case "pnpm":
      return "pnpm install --frozen-lockfile --ignore-scripts";
    case "yarn":
      return "yarn install --immutable --mode=skip-build";
    default:
      return "npm ci --ignore-scripts";
  }
}

export function runPrefix(pm: PackageManager): string {
  return pm === "npm" ? "npm run" : `${pm} run`;
}

export function bunSetupStep(pm: PackageManager): string {
  if (pm !== "bun") return "";
  return `      - uses: oven-sh/setup-bun@${ACTIONS.SETUP_BUN} # v2.2.0\n\n`;
}

async function fileExists(path: string): Promise<boolean> {
  return access(path)
    .then(() => true)
    .catch(() => false);
}
