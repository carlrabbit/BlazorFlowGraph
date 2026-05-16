# Spatial Indexing

## Status

Active.

## Purpose

Define the role of spatial indexes for hit testing, culling, viewport queries, and interaction acceleration.

## Spatial index role

A spatial index is a derived runtime structure. It MUST NOT be the source of graph truth.

## Indexed entries

Entries SHOULD include:

- element ID
- element kind (`node`, `edge`, `group`, optionally `overlay`)
- graph-space bounding box
- optional z-order or render-order information

## Required operations

The spatial index MUST support:

- region query
- point hit test

The spatial index SHOULD eventually support:

- nearest element query
- incremental update
- layer-aware hit testing

## Implementation strategy

A linear scan implementation is acceptable for small graphs and tests.
Large graph scenarios SHOULD use a more scalable index such as an R-tree or quadtree behind the same interface.

## Rebuild behavior

The index MUST be rebuilt or updated when layout results or visible render frames change.

## Authority

This document is authoritative for spatial index semantics and lifecycle.

## Document Contract

Update this spec when index entry shape, operations, or lifecycle behavior changes.
