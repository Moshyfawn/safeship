# safeship

One-shot setup for **secure npm package publishing**: OIDC trusted publishing, staged publishing, hardened GitHub Actions workflows, and branch protection.

## Usage

```bash
cd your-package
bunx @moshyfawn/safeship setup    # or: npx @moshyfawn/safeship setup
```

safeship inspects your repo, asks what to set up, and applies it. The one item it can't automate is printed as a clear follow-up.

### Flags

```
--dry-run             Show what would happen without making changes
-y, --yes             Skip prompts; pick reasonable defaults
--package <name>      Override detected package name
--repo <owner/name>   Override detected GitHub repo
```

## What it sets up

| Layer                                         | What                                                                                                                    | Automated                     |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Release workflow                              | OIDC + `npm stage publish` of a prebuilt tarball; SHA-pinned actions; default-deny perms; `--ignore-scripts` everywhere | ✓                             |
| CI workflow                                   | PR + push-to-main lint, format-check, build                                                                             | ✓                             |
| GitHub Actions repo settings                  | SHA-pinning required, default read perms, allow Actions to approve PRs                                                  | ✓                             |
| GitHub environment                            | `npm-publish` deployment environment                                                                                    | ✓                             |
| Branch ruleset                                | Block deletion + force-push, require linear history, squash-only PRs, required status checks                            | ✓                             |
| npm trusted publisher                         | GitHub Actions binding via `npm trust github --allow-stage-publish`                                                     | ✓ (interactive 2FA)           |
| "Require 2FA, disallow tokens" on the package | npm UI toggle                                                                                                           | Manual - instructions printed |

## Requirements

- Node ≥ 22.14.0 (also runs under Bun ≥ 1.3 via `bunx`)
- npm ≥ 11.15.0 (for `npm trust` and `npm stage` features)
- `gh` CLI authenticated - required for the GitHub-side modules
- npm authenticated - required for the trusted-publisher module

If `gh` or `npm` is missing or unauthenticated, safeship skips those modules with a warning and still writes the workflow files.

## Why staged publishing?

`npm stage publish` uploads a tarball to a holding area; a maintainer with 2FA must approve before it goes live. Even if your CI is compromised, malicious code can't reach the public registry without the human in the loop. Combined with OIDC trusted publishing, SHA-pinned actions, `--ignore-scripts`, and branch protection, this is the layered defense recommended after the 2025 Shai-Hulud supply-chain attacks.

## Contributing

```bash
bun install
bun run build
```

When opening a PR with user-facing changes, add a [changeset](./.changeset/README.md):

```bash
bun run changeset
```

## License

MIT
