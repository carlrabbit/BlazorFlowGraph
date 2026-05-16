# Graph Diffs

## Status

Active.

## Purpose

Define the durable contract for incremental graph updates between projection snapshots.

Graph diffs are semantic projection updates. They are not visual animation instructions and do not directly mutate browser-only state such as viewport, selection, search, focus, or layout cache.

## Diff identity

Each diff MUST include:

- `protocolVersion`
- `fromVersion`
- `toVersion`
- node operations
- edge operations
- optional group operations

`fromVersion` MUST match the currently applied projection version in the browser runtime unless recovery behavior is explicitly invoked.

## Operation semantics

Supported operation types:

- `add`
- `update`
- `remove`

Add and update operations carry the full replacement entity for the affected node, edge, or group.
Remove operations carry enough identity to remove the entity deterministically.

## Ordering rules

The runtime MUST apply operations in this logical order:

1. remove edges that reference removed nodes or groups
2. remove groups
3. remove nodes
4. add/update nodes
5. add/update groups
6. add/update edges

The implementation MAY internally optimize the order as long as observable results are equivalent.

## Version continuity

If `fromVersion` does not match the runtime's current data version, the runtime MUST NOT apply the diff silently.
It MUST do one of the following:

- reject the diff and emit diagnostics
- request or accept a full snapshot replacement
- enter a documented recovery path

## Browser state preservation

Applying a valid diff MUST preserve browser-owned state whenever possible:

- selection: keep IDs that still exist; drop removed IDs
- focus: keep focused node/group when still valid; clear or fallback when removed
- viewport: unchanged unless caller issues an explicit viewport command
- expanded groups: keep IDs that still exist; drop removed groups
- overlays: keep overlay state only when target IDs still exist

## Equality and update detection

The diff engine MUST use structural equality for projected entities. Entity identity alone is not sufficient to detect updates.

Metadata equality MUST be deterministic. If metadata cannot be compared deterministically, the projection layer MUST normalize it before diffing.

## Authority

This document is authoritative for graph diff structure, application rules, and version-continuity behavior.

## Document Contract

Update this spec when diff operation types, ordering, recovery, or browser state preservation behavior changes. Keep synchronized with .NET diffing tests and TypeScript runtime reconciliation tests.
