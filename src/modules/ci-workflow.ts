import { mkdir, writeFile } from "node:fs/promises";

import * as p from "@clack/prompts";

import { ACTIONS, NODE_VERSION, PATHS } from "../core/constants.ts";
import {
  bunSetupStep,
  installCmd,
  type PackageManager,
  runPrefix,
} from "../core/package-manager.ts";
import type { Module } from "../core/types.ts";

function render(pm: PackageManager, defaultBranch: string): string {
  const install = installCmd(pm);
  const run = runPrefix(pm);
  const bunStep = bunSetupStep(pm);

  return `name: CI

on:
  pull_request:
    branches: [${defaultBranch}]
  push:
    branches: [${defaultBranch}]

permissions: {}

concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    name: Lint, format & build
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@${ACTIONS.CHECKOUT} # v6.0.2

${bunStep}      - uses: actions/setup-node@${ACTIONS.SETUP_NODE} # v6.4.0
        with:
          node-version: "${NODE_VERSION}"

      - name: Install dependencies
        run: ${install}

      - name: Lint & format check
        run: |
          ${run} lint
          ${run} format:check

      - name: Build
        run: ${run} build
`;
}

export const ciWorkflow: Module = {
  id: "ci-workflow",
  category: "files",
  label: "PR/main CI workflow (.github/workflows/ci.yml)",
  defaultSelected: () => true,
  async run(state, options) {
    const path = PATHS.CI_WORKFLOW;
    if (state.existingCiYaml && !options.yes) {
      const overwrite = await p.confirm({
        message: `${path} already exists. Overwrite?`,
        initialValue: false,
      });
      if (p.isCancel(overwrite) || !overwrite) {
        p.log.warn(`Skipped ${path}`);
        return;
      }
    }
    if (options.dryRun) {
      p.log.info(`[dry-run] would write ${path}`);
      return;
    }
    await mkdir(".github/workflows", { recursive: true });
    await writeFile(path, render(state.packageManager, state.defaultBranch), "utf8");
    p.log.success(`Wrote ${path}`);
  },
};
