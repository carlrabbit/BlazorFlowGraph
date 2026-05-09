# AI Architecture Reference

## Scope

This document summarizes the high-level system architecture that AI-assisted changes should preserve.

## Current State

BlazorFlowGraph is a semantic dataflow visualization framework built around:

- a .NET semantic backend
- a TypeScript browser runtime
- Blazor as the hosting and integration layer
- incremental graph synchronization
- SVG-first rendering

The diagram is a generated projection of semantic state, not the source of truth.

## Runtime Responsibilities

### .NET

The .NET side owns:

- semantic models
- semantic annotations
- projection generation
- diff generation
- validation
- orchestration
- persistence

### TypeScript Runtime

The browser runtime owns:

- graph reconciliation
- rendering
- layout execution
- viewport state
- interaction state
- selection, filtering, and grouping behavior

### Blazor

Blazor should stay thin and primarily handle:

- hosting
- composition
- .NET to browser integration

Avoid pushing rendering, reconciliation, or layout algorithms into Razor components.

## Architectural Constraints

- Keep semantic models decoupled from visualization DTOs.
- Prefer incremental diffs over full graph replacement.
- Preserve stable deterministic IDs for nodes and edges.
- Keep semantic, rendering, and interaction concerns in separate layers.
- Treat the visualization graph as disposable and reproducible.

## Repository Map

### .NET Projects

- `Diagram.Protocol`
- `Diagram.Semantics`
- `Diagram.Projection`
- `Diagram.Diffing`
- `Diagram.Blazor`
- `Diagram.Blazor.Server`

### TypeScript Packages

- `@dataflow-visualizer/protocol`
- `@dataflow-visualizer/runtime`
- `@dataflow-visualizer/renderer-svg`
- `@dataflow-visualizer/layout`
- `@dataflow-visualizer/interop`
- `@dataflow-visualizer/host`

## Planned Direction

- keep expanding the diff-based synchronization model
- preserve automatic layout as a core capability
- move toward ELK-based layout while keeping current placeholder behavior clearly distinguished

## Related Docs

- `README.md`
- `docs/architecture/overview.md`
- `docs/decisions/0001-svg-first.md`
- `docs/decisions/0002-elk-layout.md`
- `docs/decisions/0003-diff-protocol.md`
