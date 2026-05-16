# Browser Runtime Reconciliation

## Status

Active.

## Purpose

Define how the TypeScript runtime applies snapshots and diffs while preserving browser-owned state.

The runtime owns transient visualization state. The .NET backend owns authoritative semantic projection state.

## Runtime-owned state

The browser runtime owns:

- viewport state
- selection state
- hover state
- focus state
- search state
- expanded group state
- layout cache and persistent layout state
- animation state
- diagnostics state

These states MUST NOT be overwritten by projection updates unless the relevant entity no longer exists or an explicit semantic command requests the change.

## Snapshot application

Applying a full snapshot MUST:

- replace graph data state
- rebuild topology indexes
- invalidate derived visible graph state
- preserve valid selection IDs
- preserve valid focus IDs
- preserve expanded group IDs that still exist
- preserve viewport state
- preserve search query, then recompute matches if possible
- preserve layout policy, then recompute layout if policy requires it

## Diff application

Applying a diff MUST:

- verify version continuity
- update graph data state
- rebuild or incrementally update topology indexes
- update visible graph state
- prune invalid browser-owned IDs
- record diagnostics

## Recovery behavior

When reconciliation cannot apply a diff safely, the runtime MUST expose a recoverable failure mode. The preferred recovery is full snapshot replacement.

## Semantic commands

Semantic commands are the browser runtime's public interaction surface. Commands include but are not limited to:

- `FocusNode`
- `CollapseGroup`
- `ExpandGroup`
- `FitSelection`
- `ApplySearch`
- `NavigateBack`

Commands MUST be deterministic and idempotent where explicitly documented.

## Diagnostics

Reconciliation SHOULD record:

- diff application count
- failed diff count
- last applied version
- visible node/edge counts
- layout duration
- render duration

## Authority

This document is authoritative for browser reconciliation behavior and runtime-owned state preservation.

## Document Contract

Update this spec when runtime state slices, reconciliation behavior, semantic commands, or diagnostics behavior change.
