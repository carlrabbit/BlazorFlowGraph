# TypeScript Guardrails

## Purpose

TypeScript guardrails define language-specific tooling and execution constraints for JavaScript/TypeScript code in this repository.

## Constraints

- When JavaScript/TypeScript tooling is used or modified, use Bun for package execution and workspace tooling.
- Use Biome for JavaScript/TypeScript linting and formatting.
- Do not introduce npm, pnpm, ESLint, Prettier, Vite, or Vitest paths for canonical repository execution.
- Keep canonical JS/TS command execution aligned with `eng/` scripts and `docs/engineering/command-contract.md`.
- When TypeScript runtime/browser behavior changes user-facing behavior, synchronize affected `public-docs/` pages.

## Authority

This document is authoritative for TypeScript/JavaScript tooling guardrails in this repository.

## Document Contract

Update this document when JS/TS tooling constraints or public-doc synchronization constraints change. Keep it synchronized with [`../../GUARDRAILS.md`](../../GUARDRAILS.md), [`../../ENGINEERING.md`](../../ENGINEERING.md), [`../../PUBLIC-DOCS.md`](../../PUBLIC-DOCS.md), [`../../../AGENTS.md`](../../../AGENTS.md), and [`../../engineering/typescript-tools.md`](../../engineering/typescript-tools.md).
