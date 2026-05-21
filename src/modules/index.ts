import type { Module } from "../core/types.ts";
import { ciWorkflow } from "./ci-workflow.ts";
import { ghActionsPermissions } from "./gh-actions-permissions.ts";
import { ghEnvironment } from "./gh-environment.ts";
import { ghRuleset } from "./gh-ruleset.ts";
import { npmTrust } from "./npm-trust.ts";
import { releaseWorkflow } from "./release-workflow.ts";

export const modules: Module[] = [
  releaseWorkflow,
  ciWorkflow,
  ghActionsPermissions,
  ghEnvironment,
  ghRuleset,
  npmTrust,
];
