import { mkdir, writeFile } from "node:fs/promises";

import * as p from "@clack/prompts";

import { ACTIONS, NODE_VERSION, NPM_VERSION_RANGE, PATHS, PUBLISH_ENV } from "../core/constants.ts";
import {
  bunSetupStep,
  installCmd,
  type PackageManager,
  runPrefix,
} from "../core/package-manager.ts";
import type { Module } from "../core/types.ts";

function render(pm: PackageManager): string {
  const install = installCmd(pm);
  const run = runPrefix(pm);
  const bunStep = bunSetupStep(pm);

  return `name: Release

on:
  release:
    types: [published]

permissions: {}

concurrency:
  group: release-\${{ github.ref }}
  cancel-in-progress: false

jobs:
  build:
    name: Build & pack
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@${ACTIONS.CHECKOUT} # v6.0.2

${bunStep}      - uses: actions/setup-node@${ACTIONS.SETUP_NODE} # v6.4.0
        with:
          node-version: "${NODE_VERSION}"
          registry-url: "https://registry.npmjs.org"

      - name: Install dependencies
        run: ${install}

      - name: Build
        run: ${run} build

      - name: Pack tarball
        run: npm pack

      - name: Upload tarball
        uses: actions/upload-artifact@${ACTIONS.UPLOAD} # v7.0.1
        with:
          name: package-tarball
          path: "*.tgz"
          if-no-files-found: error
          retention-days: 7

  stage-publish-npm:
    name: Stage publish to npm
    needs: build
    runs-on: ubuntu-latest
    environment: ${PUBLISH_ENV}
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/setup-node@${ACTIONS.SETUP_NODE} # v6.4.0
        with:
          node-version: "${NODE_VERSION}"
          registry-url: "https://registry.npmjs.org"

      - name: Install npm
        run: npm install -g npm@${NPM_VERSION_RANGE}

      - name: Download tarball
        uses: actions/download-artifact@${ACTIONS.DOWNLOAD} # v8.0.1
        with:
          name: package-tarball

      - name: Stage publish to npm
        run: npm stage publish *.tgz --access public --provenance
`;
}

export const releaseWorkflow: Module = {
  id: "release-workflow",
  category: "files",
  label: "Hardened release workflow (.github/workflows/release.yml)",
  defaultSelected: () => true,
  async run(state, options) {
    const path = PATHS.RELEASE_WORKFLOW;
    if (state.existingReleaseYaml && !options.yes) {
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
    await writeFile(path, render(state.packageManager), "utf8");
    p.log.success(`Wrote ${path}`);
  },
};
