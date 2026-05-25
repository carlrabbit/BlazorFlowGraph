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
| [`guardrails/implementation.md`](guardrails/implementation.md) | Cross-cutting implementation constraints, command usage rules, and public API documentation guardrails |
| [`guardrails/testing.md`](guardrails/testing.md) | Default short-running test rules, long-running test limits, and command execution boundaries |
| [`guardrails/languages/dotnet.md`](guardrails/languages/dotnet.md) | .NET-specific implementation and package-management guardrails |
| [`guardrails/languages/typescript.md`](guardrails/languages/typescript.md) | TypeScript/JavaScript tooling and runtime guardrails |
| [`guardrails/engineering-guardrails.md`](guardrails/engineering-guardrails.md) | Legacy engineering guardrails retained for compatibility while implementation/testing guardrails are authoritative |

## Authority

This document is authoritative for the guardrail index and for defining what belongs in a guardrail document.

## Document Contract

Update this document when a guardrail document is added, renamed, or retired. Keep it synchronized with [`ENGINEERING.md`](ENGINEERING.md), [`../AGENTS.md`](../AGENTS.md), and [`../.github/copilot-instructions.md`](../.github/copilot-instructions.md).
