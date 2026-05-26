# Purpose

Define the repeatable process for release preparation, package generation, release-readiness validation, and controlled package publication.

# Preconditions

- release version is known
- commit intended for release is reachable from `main`
- release workflow intent docs have been reviewed

# Required Reading

- [`../ENGINEERING.md`](../ENGINEERING.md)
- [`../PUBLIC-DOCS.md`](../PUBLIC-DOCS.md)
- [`../WORKFLOWS.md`](../WORKFLOWS.md)
- [`../workflows/release-check.md`](../workflows/release-check.md)
- [`../workflows/release.md`](../workflows/release.md)
- [`public-documentation-update.md`](public-documentation-update.md)
- [`workflow-changes.md`](workflow-changes.md)

# Execution Steps

1. Confirm release intent and constraints in workflow docs before changing release automation.
2. Prepare release metadata and verify commit ancestry from `main`.
3. Run release readiness through `./eng/release-check.sh <version>`.
4. Publish only after release-check success, via `./eng/publish.sh` with explicit credentials.
5. Update `public-docs/release-notes.md` for consumer-visible changes.

# Validation

- release workflow uses canonical `eng/` command contract
- `./eng/release-check.sh <version>` completes before publish
- package/publish remain explicit and outside default `eng/check.sh`
- public docs and public API checks are included in release readiness

# Common Failures

- publishing without release-check validation
- duplicating raw build/pack/publish logic in workflow YAML instead of `eng/` scripts
- drifting workflow docs from workflow implementation
- shipping consumer-visible changes without public docs/release notes updates

# Synchronization Requirements

- keep `.github/workflows/nuget-publish.yml` synchronized with `docs/workflows/release-check.md` and `docs/workflows/release.md`
- keep package/release guidance synchronized across `docs/WORKFLOWS.md`, `docs/ENGINEERING.md`, and `docs/PUBLIC-DOCS.md`

# Related Documents

- [`workflow-changes.md`](workflow-changes.md)
- [`documentation-changes.md`](documentation-changes.md)
- [`public-documentation-update.md`](public-documentation-update.md)

# Authority

This TBP is authoritative for release execution process expectations in this repository.

# Document Contract

Update this document when release process expectations change. Keep it synchronized with release workflow docs and release-related issue templates.
