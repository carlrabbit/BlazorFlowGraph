# Release Check Workflow

# Goal

Define the non-publishing release-readiness validation workflow.

# Constraints

- release readiness must route through `./eng/release-check.sh <version>`
- release check includes package smoke, public API, samples, and public docs validation
- release check never publishes packages

# Triggers

- release workflow before publish
- explicit local release readiness validation

# Inputs

- release version
- repository source and artifacts generated during validation

# Outputs

- pass/fail release-readiness status

# Validation

- `.github/workflows/nuget-publish.yml` runs `./eng/release-check.sh <version>` before `./eng/publish.sh`

# Authority

This document is authoritative for release-check workflow intent.

# Document Contract

When this workflow intent changes, review:
- `.github/workflows/nuget-publish.yml`
- `docs/WORKFLOWS.md`
- `docs/engineering/release-readiness.md`
