# Build Workflow

# Goal

Define how repository builds are executed in automation using canonical `eng/` commands.

# Constraints

- build execution must use canonical repository commands from `docs/ENGINEERING.md`
- build validation must cover both .NET and TypeScript stacks

# Triggers

- push to `main`
- pull request targeting `main`

# Inputs

- repository source code
- pinned toolchain definitions (`global.json`, `bun.lock`)

# Outputs

- build success or failure status for repository code

# Relevant Other Workflows

- [`test-short.md`](test-short.md)
- [`package.md`](package.md)
- [`public-docs.md`](public-docs.md)
- [`release-check.md`](release-check.md)
- [`release.md`](release.md)

# Validation

- `.github/workflows/ci.yml` runs canonical `eng/` build path (`./eng/check.sh`)

# Authority

This document is authoritative for build workflow intent, constraints, and expected command routing.

# Document Contract

When this workflow intent changes, review:
- `.github/workflows/ci.yml`
- `docs/WORKFLOWS.md`
- `docs/ENGINEERING.md`
- `docs/guardrails/testing.md`
