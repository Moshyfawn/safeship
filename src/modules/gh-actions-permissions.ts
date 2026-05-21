import * as p from "@clack/prompts";

import { exec, shortError } from "../core/exec.ts";
import type { Module } from "../core/types.ts";

export const ghActionsPermissions: Module = {
  id: "gh-actions-permissions",
  category: "github",
  label: "GitHub Actions repo settings (SHA-pinning, default perms)",
  available: (state) => state.ghAuthed,
  hint: (state) => (state.ghAuthed ? undefined : "needs gh auth"),
  defaultSelected: (state) => state.ghAuthed,
  async run(state, options) {
    if (options.dryRun) {
      p.log.info("[dry-run] would configure Actions repo settings (SHA-pinning, default perms)");
      return;
    }
    const spin = p.spinner();
    spin.start("Configuring GitHub Actions repo settings");
    try {
      await exec("gh", [
        "api",
        "-X",
        "PUT",
        `/repos/${state.repo}/actions/permissions`,
        "-F",
        "enabled=true",
        "-f",
        "allowed_actions=all",
        "-F",
        "sha_pinning_required=true",
      ]);
      await exec("gh", [
        "api",
        "-X",
        "PUT",
        `/repos/${state.repo}/actions/permissions/workflow`,
        "-f",
        "default_workflow_permissions=read",
        "-F",
        "can_approve_pull_request_reviews=true",
      ]);
      spin.stop("Configured Actions repo settings");
    } catch (e) {
      spin.stop("Could not configure Actions repo settings");
      p.log.warn(`Skip: ${shortError(e)}`);
    }
  },
  followUp: (state) => {
    if (!state.existingReleaseYaml && !state.existingCiYaml) return undefined;
    return [
      `Workflows already existed when these settings were applied. Their first run may have failed before perms were set.`,
      `Re-run failed workflows:`,
      `  gh run list --repo ${state.repo} --status failure`,
      `  gh run rerun <run-id> --repo ${state.repo}`,
    ].join("\n");
  },
};
