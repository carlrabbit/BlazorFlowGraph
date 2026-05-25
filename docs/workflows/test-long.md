# Long Test Workflow

# Goal

Define how long-running test categories are handled explicitly outside the default short validation path.

# Constraints

- long-running tests must never be implied by default `eng/check.sh` validation
- execution must be explicit (manual dispatch, dedicated workflow, or explicit operator request)
- long-running coverage must remain documented even when no dedicated workflow YAML exists

# Non-Goals

- changing default pull request validation to include long-running tests
- replacing short-running workflow validation

# Triggers

- explicit manual request only

# Inputs

- repository source code at selected commit
- explicit operator intent for long-running validation scope

# Outputs

- explicit long-running validation evidence when requested

# Test Categories

- slow tests
- integration tests beyond default path
- e2e tests (if enabled)
- benchmarks (never default)

# Relevant Other Workflows

- [`test-short.md`](test-short.md)
- [`build.md`](build.md)
- [`release.md`](release.md)

# Validation

- default CI workflow (`.github/workflows/ci.yml`) does not run long-running categories
- release planning or high-risk changes explicitly call out long-running checks when needed

# Authority

This document is authoritative for long-running test workflow intent and explicit-trigger constraints.

# Document Contract

When this workflow intent changes, review:
- `docs/WORKFLOWS.md`
- `docs/ENGINEERING.md`
- `docs/guardrails/testing.md`
- `.github/workflows/*.yml` (if long-test workflow implementation is added or changed)
