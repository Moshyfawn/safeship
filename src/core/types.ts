import type { RepoState } from "./detect.ts";

export interface SetupOptions {
  dryRun: boolean;
  yes: boolean;
  packageName?: string;
  repo?: string;
}

export type ModuleCategory = "files" | "github" | "npm";

/**
 * A unit of setup work. One file per module, conforming to this contract.
 * Reading a module file shows: what it is, when it can run, how it applies,
 * and any manual follow-up the user must do afterward.
 */
export interface Module {
  /** Stable identifier - used in selection sets and (future) config files. */
  id: string;
  /** Grouping for the selection prompt. */
  category: ModuleCategory;
  /** One-line label in the selection prompt. */
  label: string;
  /** Optional disambiguator shown beside the label. */
  hint?(state: RepoState): string | undefined;
  /** If false, module is shown disabled in the prompt. */
  available?(state: RepoState): boolean;
  /** Default value in `--yes` mode. */
  defaultSelected?(state: RepoState): boolean;
  /** Apply the module. Honors `options.dryRun`. */
  run(state: RepoState, options: SetupOptions): Promise<void>;
  /** Manual follow-up shown after all modules finish. */
  followUp?(state: RepoState): string | undefined;
}
