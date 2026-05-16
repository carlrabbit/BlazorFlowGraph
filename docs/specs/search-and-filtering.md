# Search and Filtering

## Status

Active.

## Purpose

Define semantic search and filtering behavior for graph exploration.

Search and filtering are visualization/runtime features. They do not mutate graph topology.

## Search scope

Search MUST support:

- node label
- node ID
- node kind
- selected metadata fields

Search SHOULD eventually support:

- edge label
- edge kind/metadata
- group label/kind
- overlay kind/value

## Filter types

Filtering MAY operate on:

- text query
- node kind
- metadata values
- overlay kind/severity
- topology scope
- group membership

## Search state

Search state is browser-owned runtime state and SHOULD include:

- query text
- matched node IDs
- active filters
- active result index for navigation

## Visibility behavior

Search MUST support explicit visibility behavior options:

- `highlight` (keep full topology visible and highlight matches)
- `filter` (show only matched nodes/edges)
- `isolate` (show matched neighborhoods)

The behavior MUST be explicit through search/filter options and must not be implicit.

## Integration with overlays

Overlay-driven filtering SHOULD be supported through overlay providers or registered overlay metadata. The search system MUST NOT hardcode domain-specific overlay kinds.

## Authority

This document is authoritative for search/filter semantics and their interaction with visible graph state.

## Document Contract

Update this spec when search scopes, filter types, visibility behavior, or overlay integration changes.
