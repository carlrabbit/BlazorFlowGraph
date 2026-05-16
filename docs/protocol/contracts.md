# Protocol Contracts

The protocol defines the shared data contracts between the .NET backend and the TypeScript runtime.

## Core Types

### GraphSnapshot
A complete snapshot of the graph at a given version number.

Current fields:
- `version`
- `nodes`
- `edges`
- optional `groups`
- optional `protocolVersion`

### GraphDiff
An incremental diff between two versions containing:
- `protocolVersion`
- `fromVersion`
- `toVersion`
- `nodeOperations`
- `edgeOperations`
- optional `groupOperations`

### DiffOperationType
`add | remove | update`

### GraphGroup
Semantic grouping contract with:
- stable `id`
- `label`
- `kind`
- `childNodeIds`
- optional `metadata`

### NodeOverlay / EdgeOverlay
Lightweight overlay records for runtime decoration and inspection.

### GraphViewState / ViewportSnapshot
Serializable browser-side view state for deep links, bookmarks, and saved views.

## Versioning
Graph versions are monotonically increasing integers. The TypeScript runtime validates that
the `fromVersion` in a diff matches its current state version before applying.

`protocolVersion` on `GraphSnapshot` provides a separate compatibility hook for contract evolution.

## Protocol Rules

- the .NET side is authoritative for graph content
- clients apply a full snapshot first, then continuous diffs
- stable deterministic IDs are required for reconciliation, layout persistence, and selection preservation
- protocol contracts remain independent from Blazor component structure and renderer implementation details
