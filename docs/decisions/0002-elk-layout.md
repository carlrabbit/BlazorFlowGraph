# ADR 0002 — ELK Layout

**Date:** 2026-05-08  
**Status:** Accepted (Milestone 4)

## Context

Automatic graph layout is required for non-trivial graph topologies.

## Decision

Use Eclipse Layout Kernel (ELK) via `elkjs` for automatic layout. ELK provides:

- Multiple layout algorithms (layered, force, mrtree, box)
- Hierarchical grouping support
- Active maintenance

`ElkLayoutProvider` implements the `LayoutProvider` interface and is the recommended production layout engine.

## Implementation (Milestone 4)

`ElkLayoutProvider` in `@dataflow-visualizer/layout`:

- Implements `LayoutProvider` interface — drop-in replacement for `GridLayoutProvider`
- Accepts `algorithm` option in constructor (default: `"layered"`)
- Loads `elkjs` lazily via `import("elkjs/lib/elk.bundled.js")` on first call — keeps module graph clean for consumers using only `GridLayoutProvider`
- Falls back to `GridLayoutProvider` when ELK fails (e.g. Node.js test environments without WASM worker)
- Produces `LayoutResult` with integer-floored node positions and ELK edge sections

## Consequences

- `elkjs` adds ~500KB to the bundle when `ElkLayoutProvider` is instantiated; tree-shaking avoids this cost for consumers using only `GridLayoutProvider`
- Initial layout uses `GridLayoutProvider` as the reference/fallback implementation
- ELK is only loaded at runtime when `ElkLayoutProvider.computeLayout()` is first called
