# Guardrails

This document is the index for engineering guardrails in this repository.

## Purpose

Guardrails prevent agents and contributors from introducing tests, patterns, or practices that harm build reliability, correctness, or maintainability.

## Guardrail Documents

- [`guardrails/testing.md`](guardrails/testing.md) — test category semantics, fast/slow/integration/e2e separation
- [`guardrails/implementation.md`](guardrails/implementation.md) — implementation quality guardrails

## Core Rules

- All code changes must pass `./eng/check.sh` before being declared complete.
- Tests must be deterministic and not depend on network, real databases, or timing.
- Unit tests must be fast; slow and integration tests are separated by convention.
- No production code in test projects; no test logic in production projects.
