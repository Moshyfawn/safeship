import * as p from "@clack/prompts";

import { detect, type RepoState } from "../core/detect.ts";
import type { Module, SetupOptions } from "../core/types.ts";
import { modules } from "../modules/index.ts";

export async function runSetup(options: SetupOptions): Promise<void> {
  p.intro("safeship setup");

  const detectSpin = p.spinner();
  detectSpin.start("Inspecting repository");
  const state = await detect({ packageName: options.packageName, repo: options.repo });
  detectSpin.stop(`Detected ${state.packageName} on ${state.repo}`);

  p.note(summary(state), "Detected state");

  const selected = await selectModules(state, options);
  if (selected === null) {
    p.cancel("Aborted.");
    process.exit(0);
  }
  if (selected.size === 0) {
    p.outro("Nothing selected. Done.");
    return;
  }

  const ran: Module[] = [];
  for (const m of modules) {
    if (!selected.has(m.id)) continue;
    if (m.available && !m.available(state)) continue;
    await m.run(state, options);
    ran.push(m);
  }

  const followUps = ran.map((m) => m.followUp?.(state)).filter((s): s is string => Boolean(s));
  if (followUps.length > 0) {
    p.note(followUps.join("\n\n"), "Manual follow-ups");
  }

  p.outro("Done.");
}

function summary(state: RepoState): string {
  return [
    `Package: ${state.packageName}@${state.packageVersion}`,
    `Repo:    ${state.repo}`,
    `Branch:  ${state.defaultBranch}`,
    `Manager: ${state.packageManager}`,
    `gh CLI:  ${state.ghAuthed ? "authenticated" : "not authenticated"}`,
    `npm CLI: ${state.npmAuthed ? "authenticated" : "not authenticated"}`,
  ].join("\n");
}

async function selectModules(state: RepoState, options: SetupOptions): Promise<Set<string> | null> {
  if (options.yes) {
    const ids = modules
      .filter((m) => (!m.available || m.available(state)) && (m.defaultSelected?.(state) ?? false))
      .map((m) => m.id);
    return new Set(ids);
  }

  const choice = await p.multiselect<string>({
    message: "Which pieces to set up?",
    options: modules.map((m) => ({
      value: m.id,
      label: m.label,
      hint: m.hint?.(state),
    })),
    initialValues: modules.filter((m) => m.defaultSelected?.(state) ?? false).map((m) => m.id),
    required: false,
  });

  if (p.isCancel(choice)) return null;
  return new Set(choice);
}
