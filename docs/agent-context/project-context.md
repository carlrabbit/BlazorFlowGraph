# Project Context

## Repository Purpose

BlazorFlowGraph is a semantic dataflow visualization framework for .NET and Blazor applications.

## Runtime Ownership

- `.NET` owns semantic models, projection generation, diff generation, validation, and orchestration.
- `TypeScript` owns rendering, reconciliation, layout execution, viewport state, and interaction handling.
- `Blazor` owns hosting and integration only.

## Critical Constraints

- Treat the semantic model as the source of truth.
- Preserve stable deterministic identifiers across graph entities.
- Prefer graph diffs over full graph replacement.
- Keep rendering and interaction logic out of Blazor components.
- Preserve browser-local handling for high-frequency interaction state.

## Major Non-Goals

- generic diagram editing
- BPMN authoring
- whiteboard-style interaction
- browser-authoritative domain mutation

## Key References

- [`../TERMINOLOGY.md`](../TERMINOLOGY.md)
- [`../SPECS.md`](../SPECS.md)
- [`../architecture/system-overview.md`](../architecture/system-overview.md)
- [`../decisions/`](../decisions)
- [`../workflows/`](../workflows)
- [`../tbps/`](../tbps)

This document is a routing/context aid. Do not treat it as a replacement for terminology, specs, architecture, decisions, workflows, or TBPs.

# Authority

This document is authoritative only for concise project context and routing cues for contributors and agents.

# Document Contract

Update this document when repository-level context or entry-point references change. Keep it synchronized with [`../../README.md`](../../README.md) and [`../../AGENTS.md`](../../AGENTS.md).
