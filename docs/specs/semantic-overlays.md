# Semantic Overlays

## Status

Active.

## Purpose

Define how semantic overlay data is represented, applied, rendered, filtered, and preserved in BlazorFlowGraph.

Overlays are semantic annotations attached to graph elements. They are not graph topology, not renderer templates, and not arbitrary DOM extensions.

## Overlay targets

An overlay MAY target:

- a node
- an edge
- a group
- a topology scope, such as a path, neighborhood, search result, or extracted subgraph

The initial required targets are nodes and edges. Group and topology-scope overlays MAY be implemented after the base provider model exists.

## Overlay identity

Each overlay MUST include:

- `kind`
- target identity
- severity or visual priority when applicable
- opaque `data`

Overlay `kind` identifies the semantic layer, for example:

- `health`
- `warning`
- `ownership`
- `throughput`
- `latency`
- `deployment`
- `schema`

The core runtime MUST treat overlay data as opaque unless a spec defines a typed interpretation.

## Overlay registry

The runtime MUST provide an overlay registry with:

- overlay kind registration
- human-readable display name
- z-order
- visibility state
- optional description
- optional legend metadata

The registry controls visibility and ordering. It does not own target overlay values.

## Overlay rendering

The renderer MUST receive overlay information through render frames or an equivalent render projection layer.

The SVG renderer MUST provide a safe default rendering for known overlay display shapes:

- badge
- marker
- halo/highlight
- muted/dimmed state

The renderer MUST escape user-provided text and MUST NOT execute overlay-provided scripts or markup.

## Overlay persistence

Overlay registry visibility is browser-owned runtime state and MAY be persisted in view state.
Overlay values attached to graph elements are semantic projection data and SHOULD come from the backend projection or a registered provider.

## Overlay and diffs

Applying graph diffs MUST prune overlays targeting removed graph elements unless an overlay provider can recompute them for the new graph state.

## Authority

This document is authoritative for overlay identity, target semantics, registry behavior, and safe rendering constraints.

## Document Contract

Update this spec when overlay targets, overlay registry behavior, renderer overlay semantics, or persistence behavior changes.
