# Large Graph Visibility

## Status

Active.

## Purpose

Define how the runtime determines which parts of a graph are visible, renderable, searchable, selectable, and navigable when graph size grows.

## Complete graph vs visible graph

The runtime graph remains complete unless a semantic projection update removes elements.
The visible graph is a derived view used for rendering and interaction.

A node or edge MAY be absent from the rendered frame while still existing in runtime graph state.

## Visibility inputs

Visibility MAY be affected by:

- viewport bounds
- search filters
- focus/isolation state
- collapsed groups
- overlay-driven filters
- explicit user filters
- renderer budget limits

## Visibility outputs

Visibility computation SHOULD produce:

- visible node IDs
- visible edge IDs
- visible group IDs
- optionally culled element counts
- optionally reason codes for diagnostics/devtools

## Selection and focus

Selection and focus MAY reference elements outside the current visible frame.
The runtime MUST define how to reveal or navigate to hidden selected/focused elements.

## Authority

This document is authoritative for complete graph vs visible graph semantics and visibility derivation.

## Document Contract

Update this spec when visibility inputs, outputs, or selection/focus interactions change.
