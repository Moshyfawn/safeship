import * as p from "@clack/prompts";

import { PUBLISH_ENV } from "../core/constants.ts";
import { exec, shortError } from "../core/exec.ts";
import type { Module } from "../core/types.ts";

export const ghEnvironment: Module = {
  id: "gh-environment",
  category: "github",
  label: `Create '${PUBLISH_ENV}' environment`,
  available: (state) => state.ghAuthed,
  hint: (state) => (state.ghAuthed ? undefined : "needs gh auth"),
  defaultSelected: (state) => state.ghAuthed,
  async run(state, options) {
    if (options.dryRun) {
      p.log.info(`[dry-run] would create '${PUBLISH_ENV}' environment`);
      return;
    }
    const spin = p.spinner();
    spin.start(`Creating '${PUBLISH_ENV}' environment`);
    try {
      await exec("gh", ["api", "-X", "PUT", `/repos/${state.repo}/environments/${PUBLISH_ENV}`]);
      spin.stop(`Created '${PUBLISH_ENV}' environment`);
    } catch (e) {
      spin.stop("Could not create environment");
      p.log.warn(`Skip: ${shortError(e)}`);
    }
  },
};
