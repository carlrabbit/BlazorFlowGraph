# Protocol Contracts

The protocol defines the shared data contracts between the .NET backend and the TypeScript runtime.

## Core Types

### GraphSnapshot
A complete snapshot of the graph at a given version number.

### GraphDiff
An incremental diff between two versions containing node and edge operations.

### DiffOperationType
`add | remove | update`

## Versioning
Graph versions are monotonically increasing integers. The TypeScript runtime validates that
the `fromVersion` in a diff matches its current state version before applying.
