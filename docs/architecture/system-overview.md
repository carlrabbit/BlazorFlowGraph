# Goal

Define the current runtime boundaries, data flow, and authoritative ownership model for BlazorFlowGraph.

# Responsibilities

- define the repository-wide runtime split between .NET, TypeScript, and Blazor
- define the end-to-end graph projection and rendering flow
- identify the authoritative subsystem for each major concern
- route readers to deeper architecture and decision references

# Constraints

- the semantic model remains the source of truth
- projections remain deterministic and disposable
- graph diffs remain the preferred synchronization mechanism
- stable deterministic identifiers are required across graph entities
- rendering and interaction logic stay in the browser runtime

# Non-Goals

- describing detailed API contracts line by line
- replacing specialized protocol, layout, rendering, or integration references
- redefining project terminology outside `docs/TERMINOLOGY.md`

# System Flow

```text
.NET semantic model
  → projection generation
  → GraphSnapshot / GraphDiff
  → Blazor host and JS interop bridge
  → TypeScript runtime reconciliation
  → visible graph projection
  → layout execution
  → render frame construction
  → SVG backend rendering
```

# Runtime Ownership

## .NET

Owns semantic models, semantic annotations, projection generation, diff generation, validation, orchestration, and persistence.

## TypeScript Runtime

Owns reconciliation, layout execution, rendering, viewport management, selection state, search and filtering behavior, and browser-local interaction handling.

## Blazor

Owns hosting, dependency injection, component composition, and .NET-to-browser integration.

# Repository Map

## .NET Projects

- `src/DotNet/BlazorFlowGraph.Protocol`
- `src/DotNet/BlazorFlowGraph.Semantics`
- `src/DotNet/BlazorFlowGraph.Projection`
- `src/DotNet/BlazorFlowGraph.Diffing`
- `src/DotNet/BlazorFlowGraph.Blazor`
- `src/DotNet/BlazorFlowGraph.Blazor.Server`

## TypeScript Packages

- `src/TypeScript/packages/protocol`
- `src/TypeScript/packages/runtime`
- `src/TypeScript/packages/query`
- `src/TypeScript/packages/renderer-svg`
- `src/TypeScript/packages/layout`
- `src/TypeScript/packages/interop`
- `src/TypeScript/packages/host`

# Related Documents

- [`backend-semantics.md`](backend-semantics.md)
- [`browser-runtime.md`](browser-runtime.md)
- [`blazor-hosting.md`](blazor-hosting.md)
- [`../protocol/contracts.md`](../protocol/contracts.md)
- [`../rendering/model.md`](../rendering/model.md)
- [`../layout/architecture.md`](../layout/architecture.md)
- [`../decisions/`](../decisions)

# Authority

This document is authoritative for repository-wide runtime boundaries, ownership splits, and the top-level architecture map.

# Document Contract

Update this document when runtime ownership, repository structure, or top-level data flow changes. Keep it synchronized with [`README.md`](../../README.md), [`../SPECS.md`](../SPECS.md), specialized architecture documents, and related ADRs in `docs/decisions/`.
