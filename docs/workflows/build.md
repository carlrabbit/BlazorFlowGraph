# Build Workflow

# Goal

Define how repository builds are executed in automation using canonical `eng/` commands.

# Constraints

- build execution must use canonical repository commands from `docs/ENGINEERING.md`
- build validation must cover both .NET and TypeScript stacks
- workflow YAML remains implementation-focused

# Non-Goals

- publishing release artifacts
- running long-running tests or benchmarks by default

# Triggers

- push to `main`
- pull request targeting `main`

# Inputs

- repository source code
- pinned toolchain definitions (`global.json`, `bun.lock`)

# Outputs

- build success or failure status for repository code

# Test Categories

- none directly; test execution is documented in `test-short.md` and `test-long.md`

# Relevant Other Workflows

- [`test-short.md`](test-short.md)
- [`test-long.md`](test-long.md)
- [`package.md`](package.md)
- [`release.md`](release.md)

# Validation

- `.github/workflows/ci.yml` runs canonical `eng/` build path (`./eng/check.sh`, `./eng/build.sh`)
- no duplicated raw repository build logic is added to workflow YAML

# Authority

This document is authoritative for build workflow intent, constraints, and expected command routing.

# Document Contract

When this workflow intent changes, review:
- `.github/workflows/ci.yml`
- `docs/WORKFLOWS.md`
- `docs/ENGINEERING.md`
- `docs/guardrails/testing.md`
