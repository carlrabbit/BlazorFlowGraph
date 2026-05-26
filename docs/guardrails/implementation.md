# Implementation Guardrails

## Purpose

Implementation guardrails define repository-wide constraints for making code and documentation changes.

## Constraints

- Use canonical engineering commands from `docs/ENGINEERING.md` and `docs/engineering/command-contract.md`.
- Use `eng/` scripts for canonical restore/build/test/format/check/package/publish/release-check/public-docs flows.
- Do not invent ad hoc build, test, format, benchmark, package, release, or publish command paths.
- Do not add README files outside the repository root `README.md`.
- Do not add package versions directly to project files; keep NuGet package versions in `Directory.Packages.props`.

## Public API Documentation

- Public API documentation must describe intent, contract, constraints, and failure behavior.
- Public API documentation must not merely restate implementation mechanics.

## Public Documentation Synchronization

Update `public-docs/` when public behavior changes in any of these areas:

- public APIs
- package shape/installation/usage
- diagnostics and failure behavior
- samples and consumer workflows
- release behavior and versioning/release notes

## Authority

This document is authoritative for cross-cutting implementation constraints and public-facing documentation guardrails.

## Document Contract

Update this document when implementation constraints or public documentation rules change. Keep it synchronized with [`../GUARDRAILS.md`](../GUARDRAILS.md), [`../ENGINEERING.md`](../ENGINEERING.md), [`../PUBLIC-DOCS.md`](../PUBLIC-DOCS.md), [`../../AGENTS.md`](../../AGENTS.md), and [`../../.github/copilot-instructions.md`](../../.github/copilot-instructions.md).
