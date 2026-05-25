# Package Workflow

# Goal

Define package generation workflow intent using canonical repository packaging commands.

# Constraints

- package generation must use `./eng/package.sh`
- packaging requires explicit release version inputs (`RELEASE_VERSION`, `RELEASE_TAG`)
- packaging remains explicit and separate from default `eng/check.sh` validation

# Non-Goals

- publishing packages to NuGet.org
- replacing local developer packaging guidance in `Nuget.md`

# Triggers

- explicit packaging validation in CI
- release workflow packaging stage

# Inputs

- restored and built repository state
- valid release version metadata

# Outputs

- `.nupkg` and `.snupkg` artifacts under `artifacts/nuget` (release) or workflow-specific artifact path (validation)

# Test Categories

- package-generation validation only (not a test runner category)

# Relevant Other Workflows

- [`build.md`](build.md)
- [`test-short.md`](test-short.md)
- [`release.md`](release.md)

# Validation

- package generation in workflow YAML routes through `./eng/package.sh` for release workflows
- package generation is not part of `eng/check.sh`

# Authority

This document is authoritative for package workflow intent and command-routing constraints.

# Document Contract

When this workflow intent changes, review:
- `.github/workflows/ci.yml`
- `.github/workflows/nuget-publish.yml`
- `docs/WORKFLOWS.md`
- `docs/ENGINEERING.md`
