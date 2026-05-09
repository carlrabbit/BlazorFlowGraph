# ADR 0001 — SVG-First Rendering

**Date:** 2026-05-08  
**Status:** Accepted

## Context

We need a rendering strategy for the dataflow graph that works across modern browsers
without requiring a Canvas or WebGL context.

## Decision

Use SVG as the primary rendering format. SVG provides:

- Accessible markup
- CSS styling support
- Easy debugging in browser devtools
- No dependency on browser-specific APIs

## Consequences

- Canvas or WebGL fallback may be needed for very large graphs (>10,000 nodes)
- Animation performance may degrade at scale; addressed via incremental diff rendering
