# Package Workflow

# Goal

Define package generation workflow intent using canonical repository packaging commands.

# Constraints

- package generation must use `./eng/package.sh <version>`
- packaging remains explicit and separate from default `eng/check.sh` validation
- package smoke validation is release-oriented via `./eng/package-smoke.sh <version>`

# Non-Goals

- publishing packages to NuGet.org

# Triggers

- explicit packaging validation in CI/release flows

# Inputs

- restored and built repository state
- valid release version metadata

# Outputs

- `.nupkg` and `.snupkg` artifacts under `artifacts/nuget`

# Relevant Other Workflows

- [`build.md`](build.md)
- [`test-short.md`](test-short.md)
- [`release-check.md`](release-check.md)
- [`release.md`](release.md)

# Validation

- package generation in workflow YAML routes through `./eng/package.sh`
- package generation is not part of `eng/check.sh`

# Authority

This document is authoritative for package workflow intent and command-routing constraints.

# Document Contract

When this workflow intent changes, review:
- `.github/workflows/ci.yml`
- `.github/workflows/nuget-publish.yml`
- `docs/WORKFLOWS.md`
- `docs/ENGINEERING.md`
