# ADR 0002 — ELK Layout

**Date:** 2026-05-08  
**Status:** Accepted

# Context

Automatic layout is required for non-trivial semantic graph topologies, and the repository needs a production-capable layout engine that still preserves an explicit provider boundary.

# Decision

Use Eclipse Layout Kernel through `elkjs` as the production layout engine behind the `LayoutProvider` abstraction.

The implementation direction is:

- `ElkLayoutProvider` implements `LayoutProvider`
- the default algorithm is `layered`
- `elkjs` loads lazily on first use
- `GridLayoutProvider` remains the reference and fallback implementation

# Consequences

- the layout package supports both a lightweight default provider and a production provider
- bundle size impact is isolated to consumers that instantiate `ElkLayoutProvider`
- layout failures can fall back to the grid provider without breaking the rest of the pipeline

# Alternatives Considered

- keeping the grid layout as the only implementation, which would limit layout quality for real graph topologies
- coupling a layout engine directly to the runtime or renderer, which would weaken the layout boundary
- moving layout execution into .NET, which would break browser-runtime ownership of layout behavior

# Related Documents

- [`../architecture/browser-runtime.md`](../architecture/browser-runtime.md)
- [`../layout/architecture.md`](../layout/architecture.md)
- [`../ai/rendering.md`](../ai/rendering.md)
