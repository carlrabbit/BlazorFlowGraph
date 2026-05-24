# Guardrails

## Purpose

Guardrail documents define cross-cutting implementation and testing constraints that apply across all engineering work in this repository.

Guardrails are authoritative for:
- cross-cutting implementation constraints;
- testing constraints and expectations;
- prohibited patterns and tooling restrictions.

Guardrails are not authoritative for:
- engineering commands (see `docs/ENGINEERING.md`);
- behavioral specifications (see `docs/SPECS.md`);
- architectural structure (see `docs/ARCHITECTURE.md`).

## Available Guardrail Documents

| Document | Purpose |
|---|---|
| [`guardrails/engineering-guardrails.md`](guardrails/engineering-guardrails.md) | Engineering-level constraints for build, test, and tooling |

## Authority

This document is authoritative for the guardrail index and for defining what belongs in a guardrail document.

## Document Contract

Update this document when a guardrail document is added, renamed, or retired. Keep it synchronized with [`ENGINEERING.md`](ENGINEERING.md), [`../AGENTS.md`](../AGENTS.md), and [`../copilot-instructions.md`](../copilot-instructions.md).
