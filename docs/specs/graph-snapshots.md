# Graph Snapshots

## Status

Active.

## Purpose

Define the durable contract for graph snapshot documents passed from the .NET semantic backend to the TypeScript browser runtime.

Graph snapshots are authoritative projection snapshots. They are not browser runtime state and do not include transient state such as viewport, hover, search, selection, animation, or layout cache.

## Snapshot identity

A graph snapshot MUST include:

- `protocolVersion`
- `version`
- `nodes`
- `edges`
- optional `groups`
- optional metadata and overlay fields only when explicitly specified by active specs

`version` is the projection version for diff continuity. `protocolVersion` is the protocol contract version and changes only when the serialized contract changes.

## Node contract

Each node MUST include:

- stable `id`
- human-readable `label`
- semantic `kind`

A node MAY include metadata. Metadata is opaque to the renderer unless another active spec defines a typed interpretation.

Node IDs MUST obey [`stable-identifiers.md`](stable-identifiers.md).

## Edge contract

Each edge MUST include:

- stable `id`
- stable `sourceId`
- stable `targetId`

An edge MAY include label and metadata. Edges MUST reference existing nodes in the same snapshot unless a recovery spec explicitly allows partial snapshots.

## Group contract

Each group MUST include:

- stable `id`
- human-readable `label`
- semantic `kind`
- `childNodeIds`

Groups are semantic containers, not decorative renderer elements. A group MAY be used by layout, collapse/expand behavior, overlays, and navigation.

## Snapshot validity

A snapshot is valid when:

- all node IDs are unique
- all edge IDs are unique
- all group IDs are unique
- all edge endpoints reference existing nodes
- all group child node IDs reference existing nodes
- `version` is greater than or equal to zero
- `protocolVersion` is supported by the browser runtime

## Runtime behavior

The browser runtime MAY reject unsupported protocol versions.
The browser runtime SHOULD expose validation errors through diagnostics.
The browser runtime MUST NOT treat snapshots as mutable semantic state.

## Authority

This document is authoritative for graph snapshot structure and validity.

## Document Contract

Update this spec when snapshot fields, validity rules, or protocol-version handling change. Keep synchronized with [`../SPECS.md`](../SPECS.md), TypeScript protocol types, and .NET protocol records.
