# Release Workflow

# Goal

Define the controlled workflow that packages and publishes versioned NuGet artifacts from validated release commits.

# Constraints

- release input must be an explicit `vX.X.X.X` tag or manual dispatch input
- release preparation must verify commit reachability from `main`
- repository restore/build/package/publish steps must route through canonical `eng/` commands
- publishing must be credential-gated with `NUGET_API_KEY`
- publishing remains explicit and is never part of default `eng/check.sh` validation

# Non-Goals

- replacing local packaging guidance
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

# Test Categories

- release-gated packaging and publish validation (explicit workflow path)

# Relevant Other Workflows

- [`build.md`](build.md)
- [`test-short.md`](test-short.md)
- [`test-long.md`](test-long.md)
- [`package.md`](package.md)

# Validation

- `.github/workflows/nuget-publish.yml` uses `./eng/restore.sh`, `./eng/build.sh`, `./eng/package.sh`, and `./eng/publish.sh`
- publish step is explicitly gated by required credentials
- release/package flow remains outside default `eng/check.sh`

# Authority

This document is authoritative for release workflow intent, constraints, and publish-gating requirements.

# Document Contract

When this workflow intent changes, review:
- `.github/workflows/nuget-publish.yml`
- `docs/WORKFLOWS.md`
- `docs/ENGINEERING.md`
- `docs/tbps/release.md`
- `Nuget.md`
