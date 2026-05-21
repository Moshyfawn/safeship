---
"@moshyfawn/safeship": patch
---

Omit `required_status_checks` from the initial `protect-main` ruleset POST. Pre-listing the `Lint, format & build` check blocks every PR (including the bootstrap "Version Packages" PR that would produce the check), because the check doesn't exist until CI has run for the first time. The `followUp()` message already instructs users to add the required check via the ruleset UI after the first CI run.

Add a `followUp()` to the GitHub Actions permissions module that warns when workflow files were already present at setup time. The first run can race ahead of `can_approve_pull_request_reviews` being set, so it may need `gh run rerun --failed` to recover.
