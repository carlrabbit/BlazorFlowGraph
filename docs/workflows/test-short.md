# Short Test Workflow

# Goal

Define default short-running automated test validation for pull requests and mainline changes.

# Constraints

- short-running validation must use canonical `eng/` commands
- default path excludes long-running, e2e, benchmark, and package-smoke categories
- .NET test execution follows Microsoft Testing Platform expectations (`dotnet run` test executables)

# Triggers

- push to `main`
- pull request targeting `main`

# Inputs

- repository source code
- restored .NET and Bun dependencies

# Outputs

- pass/fail status for default repository test path

# Relevant Other Workflows

- [`build.md`](build.md)
- [`test-long.md`](test-long.md)
- [`package.md`](package.md)
- [`release-check.md`](release-check.md)

# Validation

- `.github/workflows/ci.yml` runs `./eng/check.sh` for canonical short validation
- package-smoke remains outside default `./eng/test.sh` and is owned by release-check

# Authority

This document is authoritative for short-running workflow test intent and default test-scope constraints.

# Document Contract

When this workflow intent changes, review:
- `.github/workflows/ci.yml`
- `docs/WORKFLOWS.md`
- `docs/ENGINEERING.md`
- `docs/guardrails/testing.md`
