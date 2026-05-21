import * as p from "@clack/prompts";

import { execWithStdin, shortError } from "../core/exec.ts";
import type { Module } from "../core/types.ts";

const CI_CHECK_NAME = "Lint, format & build";

/**
 * The ruleset is created without `required_status_checks` because the check
 * doesn't exist until CI runs for the first time, and pre-listing a missing
 * check would block every PR (including the first one that produces the check).
 * The follow-up message tells the user to add it once CI has run.
 */
export const ghRuleset: Module = {
  id: "gh-ruleset",
  category: "github",
  label: "Branch ruleset for default branch",
  available: (state) => state.ghAuthed,
  hint: (state) => (state.ghAuthed ? `'protect-${state.defaultBranch}'` : "needs gh auth"),
  defaultSelected: (state) => state.ghAuthed,
  async run(state, options) {
    const name = `protect-${state.defaultBranch}`;
    if (options.dryRun) {
      p.log.info(`[dry-run] would create ruleset '${name}'`);
      return;
    }
    const spin = p.spinner();
    spin.start(`Creating ruleset '${name}'`);
    try {
      const body = JSON.stringify({
        name,
        target: "branch",
        enforcement: "active",
        conditions: {
          ref_name: { include: ["~DEFAULT_BRANCH"], exclude: [] },
        },
        rules: [
          { type: "deletion" },
          { type: "non_fast_forward" },
          { type: "required_linear_history" },
          {
            type: "pull_request",
            parameters: {
              required_approving_review_count: 0,
              dismiss_stale_reviews_on_push: true,
              require_code_owner_review: false,
              require_last_push_approval: false,
              required_review_thread_resolution: true,
              allowed_merge_methods: ["squash"],
            },
          },
        ],
      });
      await execWithStdin(
        "gh",
        ["api", "-X", "POST", `/repos/${state.repo}/rulesets`, "--input", "-"],
        body,
      );
      spin.stop(`Created ruleset '${name}'`);
    } catch (e) {
      spin.stop("Could not create ruleset");
      p.log.warn(`Skip: ${shortError(e)}`);
    }
  },
  followUp: (state) =>
    `After your first CI run, add '${CI_CHECK_NAME}' to required checks on 'protect-${state.defaultBranch}'.`,
};
