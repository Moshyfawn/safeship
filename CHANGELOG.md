# @moshyfawn/safeship

## 0.0.2

### Patch Changes

- [#2](https://github.com/Moshyfawn/safeship/pull/2) [`f690048`](https://github.com/Moshyfawn/safeship/commit/f69004831c7af91c928c03551320de4e670f01ae) Thanks [@Moshyfawn](https://github.com/Moshyfawn)! - Omit `required_status_checks` from the initial `protect-main` ruleset POST. Pre-listing the `Lint, format & build` check blocks every PR (including the bootstrap "Version Packages" PR that would produce the check), because the check doesn't exist until CI has run for the first time. The `followUp()` message already instructs users to add the required check via the ruleset UI after the first CI run.

  Add a `followUp()` to the GitHub Actions permissions module that warns when workflow files were already present at setup time. The first run can race ahead of `can_approve_pull_request_reviews` being set, so it may need `gh run rerun --failed` to recover.

## 0.0.1

### Patch Changes

- [`5158c14`](https://github.com/Moshyfawn/safeship/commit/5158c14ee06f6abbd3c1978d55fa9bd1beb6b177) Thanks [@Moshyfawn](https://github.com/Moshyfawn)! - Initial release. One-shot `safeship setup` for secure npm package publishing: hardened release/CI workflows, GitHub Actions repo settings, `npm-publish` environment, branch ruleset, and npm trusted-publisher binding via `npm trust github --allow-stage-publish`.
