import { access, readFile } from "node:fs/promises";

import * as p from "@clack/prompts";

import { PATHS } from "./constants.ts";
import { exec } from "./exec.ts";
import { detectPackageManager, type PackageManager } from "./package-manager.ts";

export interface RepoState {
  packageName: string;
  packageVersion: string;
  repo: string;
  defaultBranch: string;
  packageManager: PackageManager;
  ghAuthed: boolean;
  npmAuthed: boolean;
  npmUsername: string | null;
  npmVersion: string | null;
  hasJsr: boolean;
  hasChangesets: boolean;
  existingReleaseYaml: boolean;
  existingCiYaml: boolean;
}

export interface DetectInput {
  packageName?: string;
  repo?: string;
}

export async function detect(input: DetectInput): Promise<RepoState> {
  const pkgRaw = await readFile("package.json", "utf8").catch(() => {
    p.log.error("No package.json in current directory. Run safeship from your package root.");
    process.exit(1);
  });
  const pkg = JSON.parse(pkgRaw) as {
    name?: string;
    version?: string;
    repository?: string | { url?: string };
  };

  if (!pkg.name) {
    p.log.error("package.json is missing a `name` field.");
    process.exit(1);
  }

  const repo = await resolveRepo(input.repo, pkg);
  const packageManager = (await detectPackageManager()) ?? "npm";
  const ghAuthed = await checkGhAuth();
  const npmVersion = await getNpmVersion();
  const npmUsername = await getNpmUsername();

  const defaultBranch = ghAuthed
    ? await exec("gh", ["api", `/repos/${repo}`, "--jq", ".default_branch"])
        .then((r) => r.stdout.trim() || "main")
        .catch(() => "main")
    : "main";

  return {
    packageName: input.packageName ?? pkg.name,
    packageVersion: pkg.version ?? "0.0.0",
    repo,
    defaultBranch,
    packageManager,
    ghAuthed,
    npmAuthed: npmUsername !== null,
    npmUsername,
    npmVersion,
    hasJsr: await fileExists("jsr.json"),
    hasChangesets: await fileExists(".changeset/config.json"),
    existingReleaseYaml: await fileExists(PATHS.RELEASE_WORKFLOW),
    existingCiYaml: await fileExists(PATHS.CI_WORKFLOW),
  };
}

async function resolveRepo(
  override: string | undefined,
  pkg: { repository?: string | { url?: string } },
): Promise<string> {
  if (override) return override;

  const fromPkg = parseRepo(
    typeof pkg.repository === "string" ? pkg.repository : (pkg.repository?.url ?? ""),
  );
  if (fromPkg) return fromPkg;

  const { stdout } = await exec("git", ["remote", "get-url", "origin"]).catch(() => ({
    stdout: "",
    stderr: "",
  }));
  const fromGit = parseRepo(stdout.trim());
  if (fromGit) return fromGit;

  p.log.error("Could not detect GitHub repo. Pass --repo owner/name.");
  process.exit(1);
}

function parseRepo(url: string): string {
  if (!url) return "";
  const match = url.match(/github\.com[:/]([^/]+)\/([^/.]+?)(?:\.git)?$/);
  return match ? `${match[1]}/${match[2]}` : "";
}

async function fileExists(path: string): Promise<boolean> {
  return access(path)
    .then(() => true)
    .catch(() => false);
}

async function checkGhAuth(): Promise<boolean> {
  return exec("gh", ["auth", "status"])
    .then(() => true)
    .catch(() => false);
}

async function getNpmUsername(): Promise<string | null> {
  return exec("npm", ["whoami"])
    .then((r) => r.stdout.trim() || null)
    .catch(() => null);
}

async function getNpmVersion(): Promise<string | null> {
  return exec("npm", ["--version"])
    .then((r) => r.stdout.trim() || null)
    .catch(() => null);
}
