# Release Workflow

# Goal

Define the controlled workflow that validates release readiness and then publishes versioned NuGet artifacts.

# Constraints

- release input must be an explicit version/tag
- repository release validation must route through `./eng/release-check.sh <version>`
- publish remains explicitly credential-gated with `NUGET_API_KEY`
- publishing is never part of default `eng/check.sh`

# Non-Goals

- making package publication part of normal PR validation

# Triggers

- push of tags matching `v*.*.*.*`
- `workflow_dispatch` with required `release_version` input

# Inputs

- release tag/version
- repository source at selected commit
- NuGet publish credentials

# Outputs

- versioned package artifacts
- published NuGet packages for packable projects
- uploaded workflow artifacts for release inspection

# Relevant Other Workflows

- [`build.md`](build.md)
- [`test-short.md`](test-short.md)
- [`package.md`](package.md)
- [`public-docs.md`](public-docs.md)
- [`release-check.md`](release-check.md)

# Validation

- `.github/workflows/nuget-publish.yml` uses `./eng/release-check.sh <version>` before `./eng/publish.sh`
- publish step is explicitly gated by required credentials
- release/package flow remains outside default `eng/check.sh`

# Authority

This document is authoritative for release workflow intent, constraints, and publish-gating requirements.

# Document Contract

When this workflow intent changes, review:
- `.github/workflows/nuget-publish.yml`
- `docs/WORKFLOWS.md`
- `docs/ENGINEERING.md`
- `docs/workflows/release-check.md`
- `docs/tbps/release.md`
- `Nuget.md`
