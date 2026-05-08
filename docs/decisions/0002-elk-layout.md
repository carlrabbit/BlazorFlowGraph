# ADR 0002 — ELK Layout

**Date:** 2026-05-08  
**Status:** Proposed

## Context

Automatic graph layout is required for non-trivial graph topologies.

## Decision

Use Eclipse Layout Kernel (ELK) via `elkjs` for automatic layout. ELK provides:

- Multiple layout algorithms (layered, force, mrtree, box)
- Hierarchical grouping support
- Active maintenance

## Consequences

- `elkjs` adds ~500KB to the bundle (mitigated by code splitting)
- Initial layout will use a simple grid fallback
