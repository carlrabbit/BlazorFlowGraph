# Semantic Layering

## Status

Active.

## Purpose

Define how multiple semantic layers coexist on the same graph without contaminating the core topology model.

## Layer identity

A semantic layer is a named set of annotations, overlays, or derived facts over the graph. Examples:

- topology
- ownership
- runtime health
- traffic
- deployment
- security
- schema/versioning

## Layer ownership

Topology belongs to the graph projection.
Layer data belongs to overlay providers, projection metadata, or application integration.
Renderer backends consume render frames and MUST NOT own semantic layer logic.

## Layer visibility

Each semantic layer SHOULD expose:

- enabled/disabled state
- legend metadata when applicable
- z-order or priority when rendered
- optional filter contribution

## Layer conflicts

When multiple layers affect the same visual element, the runtime MUST resolve ordering through explicit priority/z-order. The renderer MUST NOT guess semantic precedence.

## Authority

This document is authoritative for multi-layer semantic visualization behavior.

## Document Contract

Update this spec when semantic layer identity, priority, visibility, or conflict resolution changes.
