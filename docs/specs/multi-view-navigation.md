# Multi-View Navigation

## Status

Active.

## Purpose

Define how multiple synchronized views of the same runtime graph can coexist.

## Shared graph state

Multiple views MUST share graph data state. They MUST NOT duplicate semantic graph state.

## View-local state

Each view MAY own separate:

- viewport state
- render budget
- visible graph derivation
- interaction mode
- selected overlay visibility

Shared selection/focus/search MAY be configurable.

## Coordinated behavior

The runtime SHOULD support coordinated views such as:

- overview + detail
- minimap + main viewport
- search results + graph view
- comparison/detail panels

## Synchronization model

Synchronization MUST be explicit. One view should not implicitly overwrite another view's viewport unless configured through a coordinator.

## Authority

This document is authoritative for multi-view state ownership and synchronization behavior.

## Document Contract

Update this spec when view-local/shared state boundaries or synchronization behavior changes.
