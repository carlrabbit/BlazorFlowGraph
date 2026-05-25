# Implementation Guardrails

## Purpose

Implementation guardrails define repository-wide constraints for making code and documentation changes.

## Constraints

- Use canonical engineering commands from `docs/ENGINEERING.md` and `docs/engineering/command-contract.md`.
- Use `eng/` scripts for canonical restore/build/test/format/check/package/publish flows.
- Do not invent ad hoc build, test, format, benchmark, package, release, or publish command paths.
- Do not add README files outside the repository root `README.md`.
- Do not add package versions directly to project files; keep NuGet package versions in `Directory.Packages.props`.
- Keep public API documentation focused on API intent, behavioral contract, constraints, and usage. Do not document internal implementation mechanics as API contract.

## Authority

This document is authoritative for cross-cutting implementation constraints and public API documentation guardrails.

## Document Contract

Update this document when implementation constraints or API documentation rules change. Keep it synchronized with [`../GUARDRAILS.md`](../GUARDRAILS.md), [`../ENGINEERING.md`](../ENGINEERING.md), [`../../AGENTS.md`](../../AGENTS.md), and [`../../.github/copilot-instructions.md`](../../.github/copilot-instructions.md).
