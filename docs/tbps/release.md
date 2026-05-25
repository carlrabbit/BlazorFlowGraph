# Purpose

Define the repeatable process for release preparation, package generation, and controlled package publication.

# Preconditions

- release version is known in `vX.X.X.X` format
- commit intended for release is reachable from `main`
- release workflow intent docs have been reviewed

# Required Reading

- [`../ENGINEERING.md`](../ENGINEERING.md)
- [`../WORKFLOWS.md`](../WORKFLOWS.md)
- [`../workflows/package.md`](../workflows/package.md)
- [`../workflows/release.md`](../workflows/release.md)
- [`workflow-changes.md`](workflow-changes.md)

# Execution Steps

1. Confirm release intent and constraints in workflow docs before changing release automation.
2. Prepare release metadata and verify commit ancestry from `main`.
3. Run repository release steps through canonical commands: `./eng/restore.sh`, `./eng/build.sh`, `./eng/package.sh`, `./eng/publish.sh`.
4. Ensure publish is explicitly credential-gated and never merged into default validation flows.
5. Capture release artifacts and update synchronized documentation when release flow changes.

# Validation

- release workflow uses canonical `eng/` command contract
- package/publish remain explicit and outside default `eng/check.sh`
- release version and credential requirements are enforced

# Common Failures

- publishing without explicit version validation
- duplicating raw build/pack/publish logic in workflow YAML instead of `eng/` scripts
- drifting workflow docs from workflow implementation

# Synchronization Requirements

- keep `.github/workflows/nuget-publish.yml` synchronized with `docs/workflows/release.md`
- keep package/release guidance synchronized across `docs/WORKFLOWS.md`, `docs/ENGINEERING.md`, and `Nuget.md`

# Related Documents

- [`workflow-changes.md`](workflow-changes.md)
- [`documentation-changes.md`](documentation-changes.md)

# Authority

This TBP is authoritative for release execution process expectations in this repository.

# Document Contract

Update this document when release process expectations change. Keep it synchronized with release workflow docs and release-related issue templates.
