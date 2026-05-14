# ADR 0001 — SVG-First Rendering

**Date:** 2026-05-08  
**Status:** Accepted

# Context

BlazorFlowGraph needs a browser rendering strategy that works across modern browsers without requiring Canvas-specific or WebGL-specific runtime assumptions.

# Decision

Use SVG as the primary rendering format.

SVG provides:

- accessible markup
- CSS styling support
- direct browser-devtools inspection
- a portable baseline without extra rendering dependencies

# Consequences

- the current rendering backend remains SVG-first
- very large graphs may need alternative backends or additional culling strategies later
- incremental synchronization and render-frame separation remain important for scale

# Alternatives Considered

- Canvas-first rendering, which would reduce DOM output but make inspection and accessibility harder
- WebGL-first rendering, which would increase rendering complexity before the repository needs it
- Blazor-driven rendering, which would violate the browser-runtime ownership model

# Related Documents

- [`../architecture/browser-runtime.md`](../architecture/browser-runtime.md)
- [`../rendering/model.md`](../rendering/model.md)
- [`0004-renderer-backend.md`](0004-renderer-backend.md)
