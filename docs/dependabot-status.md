# Dependabot status

_Last updated: 2026-10-10. Starter template extracted from `enterprise-app`; update when the state changes._

## Configuration

- Ecosystems covered: maven (`/backend`), npm (`/frontend`), docker (`/backend`, `/frontend`), docker-compose (`/`), github-actions (`/`).
- Grouping: none (one PR per update).
- Schedule: weekly.
- Ignore rules: `@angular/*`, `angular-eslint`, `typescript`, `eslint`, `jasmine-core` and `@types/jasmine` majors and `zone.js` majors and minors in `/frontend` (Angular is upgraded together with `ng update`); `eclipse-temurin` majors and `maven` in `/backend`; `node` image majors in `/frontend`; docker-compose image majors.

## State at last update

- Open Dependabot PRs: 0 (each merged or closed only after reading its checks).
- Default-branch CI: green at last check.
- Repository settings (read live 2026-10-10): public, `is_template` true, description set, default branch `main` (the only branch kept), secret scanning, push protection and Dependabot security updates enabled, dependency graph on (SBOM endpoint 200). Non-provider secret patterns and validity checks stay off: GitHub does not offer them on this user-owned public repo.
- Set by the repo owner through the API on 2026-10-10 (the session's proxy blocks repository-settings writes) and read back by the session the same day: private vulnerability reporting enabled (PUT 204), `delete_branch_on_merge` on (PATCH 200), repository topics set (PUT 200). Fork-PR workflow approval is `all_external_contributors` (read with the owner's token). Stale branches left over from squash-merged PRs were deleted after a fresh diff against `main` showed their content already on `main`.
- Alerts read 2026-10-10 with the repo owner's token: Code scanning #1 `java/spring-disabled-csrf-protection` (`SecurityConfig.java:89`, the API filter chain) is a false positive, as enterprise-app's #2 is: the chain is stateless and only trusts the `Authorization` header (`JwtAuthenticationFilter`; no cookie is read anywhere in the backend), which a browser never attaches to a cross-site request. The OIDC chain keeps Spring's CSRF protection on. Dismissed as `false positive` with a comment by the repo owner on 2026-10-10 (PATCH 200). No Dependabot or secret-scanning alerts. The read-back after the dismissals showed 0 open Dependabot and 0 open code-scanning alerts.

## Time-limited exemptions

- `osv-scanner.toml`, every entry expiring 2026-11-09 (earlier than the source repos' 2026-11-15): `braces` GHSA-vfj7-8cjw-p6xm (dev tooling, never shipped). After that date the scan fails until each entry is renewed or removed. The scan is not a required check, so merges still work, but re-check each advisory for a fix before then.

## Notes

- Merge policy (deliberate choice by the repo owner, the same blanket policy as the application repos): every PR, major-version dependency bumps included, is squash-merged as soon as all of its required checks are green, confirmed per PR. This repo is a code showcase with no business or sensitive dependency, so green checks are the only gate. Red, pending or conflicted PRs are fixed or closed instead.
- `main` protection (2026-10-10, read back): pull request required (0 approvals), enforced for admins, force pushes and deletions blocked, "require branches to be up to date" off (`strict` false) on purpose. Nobody pushes to `main` directly; status-log updates go through a PR too.
- Required contexts: `Backend (build, test, lint)`, `Frontend (lint, test, build)`, `Docker image builds`, `Secret scanning (gitleaks)`. Nothing else is required on purpose: osv-scanner, npm audit, dependency review and CodeQL depend on a moving advisory database or run only on some events.
- `Dependency review (PR diff)` failed on #1 because the dependency graph was still off at the time. Since the graph was turned on it passed on #2 (2026-10-10), so the job works. It is not required, so it never blocked a merge.
- Rescan 2026-10-10: the README called `LICENSE` a placeholder and `osv-scanner.toml` empty; both were out of date (the licence names arb-rajab, and the file carries the dated `braces` exception). Reworded.

## Deferred (not re-raised each pass)

- Alert reads (Dependabot, code scanning, secret scanning) and Actions settings (fork-PR approval) are blocked for Claude sessions by the proxy; they are read and written with the repo owner's token on their own machine.
- The owner keeps the token's Administration, Contents and Secret scanning permissions and does not rotate it (deliberate, 2026-10-09, reconfirmed 2026-10-10 for the template repos).
- Re-check the exemptions above before 2026-11-09 and drop each once its upstream fix ships.
