# Testing Guardrails

## Purpose

Testing guardrails define default execution limits for agents and contributors so completion checks remain fast and repeatable.

## Test Categories

| Category | Default | Description |
|---|:---:|---|
| Short-running tests | Yes | Fast local and CI-safe tests executed by default through `./eng/test.sh` and `./eng/check.sh`. |
| PackageSmoke | No (release-only) | Package consumer validation, excluded from `./eng/test.sh`, run via `./eng/package-smoke.sh <version>` and `./eng/release-check.sh <version>`. |
| Long-running tests | No (opt-in) | Slow, integration, or environment-heavy tests excluded from default paths unless explicitly requested. |
| E2E tests | No (opt-in) | Browser or system-level tests never in the default completion path. |
| Benchmarks | No (opt-in) | Performance measurements never in default validation. |

## Execution Limits

- Use short-running tests by default.
- Do not run long-running tests, e2e tests, benchmarks, package, publish, or release commands unless explicitly requested.
- Use `./eng/check.sh` as the default completion gate before declaring implementation work complete.
- Use targeted tests while iterating, then run the required completion gate.

## Release Validation Ownership

`./eng/release-check.sh <version>` owns release validation for:

- package smoke
- public API baseline validation
- sample validation
- public documentation validation

## Authority

This document is authoritative for testing execution limits and the default versus opt-in test boundary.

## Document Contract

Update this document when test categories, execution limits, or default/release validation rules change. Keep it synchronized with [`../GUARDRAILS.md`](../GUARDRAILS.md), [`../ENGINEERING.md`](../ENGINEERING.md), [`../../AGENTS.md`](../../AGENTS.md), [`../../.github/copilot-instructions.md`](../../.github/copilot-instructions.md), and [`../engineering/command-contract.md`](../engineering/command-contract.md).
