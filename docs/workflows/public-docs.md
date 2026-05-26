# Public Documentation Workflow

# Goal

Define how public documentation consistency is validated.

# Constraints

- workflow validation must route through `./eng/public-docs.sh`
- public docs are consumer-facing and do not replace internal specs as authority

# Triggers

- pull requests and mainline changes where fast validation is run
- release-check workflow execution

# Inputs

- `docs/PUBLIC-DOCS.md`
- `public-docs/` sources
- `README.md`

# Outputs

- pass/fail status for public documentation presence and required structure checks

# Validation

- `.github/workflows/ci.yml` runs `./eng/public-docs.sh`
- release flow runs `./eng/public-docs.sh` through `./eng/release-check.sh <version>`

# Authority

This document is authoritative for public documentation workflow intent.

# Document Contract

When this workflow intent changes, review:
- `.github/workflows/ci.yml`
- `.github/workflows/nuget-publish.yml`
- `docs/WORKFLOWS.md`
- `docs/PUBLIC-DOCS.md`
