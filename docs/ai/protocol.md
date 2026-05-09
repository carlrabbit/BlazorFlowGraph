# AI Protocol Reference

## Scope

This document describes the shared graph contract expectations between the .NET backend and the TypeScript runtime.

## Current State

The protocol is centered on snapshots and diffs.

### Core Types

- `GraphSnapshot` — a full graph snapshot at a specific version
- `GraphDiff` — an incremental change set between versions
- diff operations — add, remove, and update style operations over graph entities

## Protocol Rules

- The server is authoritative for graph content.
- Clients should apply a full snapshot first, then incremental diffs.
- Graph versions must be monotonic.
- The client must validate diff continuity before applying a diff.
- Stable deterministic identifiers are required for reconciliation and selection preservation.

## Why Stable IDs Matter

Stable IDs are required for:

- diff application
- incremental reconciliation
- animation continuity
- layout persistence
- selection preservation

Transient identifiers undermine the protocol even if the graph content is otherwise unchanged.

## Diff Expectations

Prefer diff generation that is:

- deterministic
- minimal
- explicitly ordered
- easy to test

Avoid replacing the full graph when a smaller mutation set is sufficient.

## Runtime Boundary

The protocol should stay independent from:

- Blazor component structure
- SVG rendering details
- browser-only interaction state

It is the contract between runtimes, not a UI model.

## Planned Direction

The repository documentation positions diff-based synchronization as the long-term operating model.

Future protocol changes should continue to:

- preserve backward reasoning about versions
- support incremental updates cleanly
- avoid coupling semantic authoring concerns to browser rendering concerns

## Groups in the Protocol

`GraphSnapshot` now carries an optional `groups` array (`GraphGroup[]`). Each group has:
- a stable `GroupId`
- a `label` and `kind`
- a `childNodeIds` list pointing to contained nodes

Group diffs are communicated through `GraphDiff.groupOperations` (`GroupDiffOperation[]`).

## Overlays in the Protocol

`NodeOverlay` and `EdgeOverlay` are lightweight decoration records:
- `nodeId`/`edgeId` — the target element
- `kind` — the overlay category (e.g. "health", "warning", "trace")
- `data` — optional metadata bag

These travel independently of the graph data and are applied through `OverlayState`.

## Protocol Versioning

`GraphSnapshot` carries a `protocolVersion` integer (default `1`). This allows the runtime to detect and handle forward/backward compatibility between server and client.

## Related Docs

- `docs/protocol/contracts.md`
- `docs/decisions/0003-diff-protocol.md`
- `docs/ai/architecture.md`
