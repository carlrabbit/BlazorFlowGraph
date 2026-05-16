# Minimap and Overview

## Status

Active.

## Purpose

Define the minimap/overview feature as a coordinated secondary view over the same runtime graph.

## Minimap identity

The minimap is a view, not a separate graph runtime.
It consumes shared graph/layout state and produces its own render frame.

## Minimap responsibilities

The minimap SHOULD:

- show graph extent
- show current viewport rectangle
- support click/drag navigation when enabled
- respect collapsed groups and high-level visibility filters
- avoid full-detail rendering for large graphs

## Detail reduction

The minimap MAY render simplified shapes instead of full node/edge visuals.
It MUST preserve spatial/topological orientation.

## Synchronization

Main viewport changes SHOULD update the minimap viewport rectangle.
Minimap navigation SHOULD update the main viewport through semantic viewport commands.

## Authority

This document is authoritative for minimap identity, responsibilities, and synchronization behavior.

## Document Contract

Update this spec when minimap rendering, navigation, or synchronization behavior changes.
