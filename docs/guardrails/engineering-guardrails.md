# Engineering Guardrails

## Purpose

Engineering guardrails define cross-cutting constraints for build, test, and tooling decisions across the repository.

## Constraints

- Agents must run `./eng/check.sh` before declaring work complete.
- `eng/check.sh` is the canonical gate: restore, build, test, format verify, Biome check.
- Benchmarks, packaging, and publishing are never part of `eng/check.sh`.
- Do not add pnpm, npm, ESLint, Prettier, Vite, or Vitest. Use Bun (build + test) and Biome.
- Test categories: fast unit tests run by default; slow/e2e/benchmark excluded from `eng/test.sh`.

## Authority

This document is authoritative for engineering-level implementation constraints that apply across all repository work.

## Document Contract

Update this document when engineering tooling constraints change. Keep it synchronized with [`../GUARDRAILS.md`](../GUARDRAILS.md), [`../ENGINEERING.md`](../ENGINEERING.md), [`../../AGENTS.md`](../../AGENTS.md), and [`../../eng/check.sh`](../../eng/check.sh).
