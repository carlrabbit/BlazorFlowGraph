# Goal

Define the deterministic identifier rules that projection, diffing, and runtime reconciliation must preserve.

# Scope

This spec covers identifiers for graph entities exchanged between the .NET semantic side and the browser runtime, including nodes, edges, groups, and overlays that target those entities.

# Non-Goals

- defining rendering style
- defining layout algorithms
- defining milestone sequencing
- replacing protocol serialization details documented elsewhere

# Terminology

- **Stable Identifier** — see [`../TERMINOLOGY.md`](../TERMINOLOGY.md)
- **Graph Snapshot** — see [`../TERMINOLOGY.md`](../TERMINOLOGY.md)
- **Graph Diff** — see [`../TERMINOLOGY.md`](../TERMINOLOGY.md)

# Invariants

- equivalent semantic entities keep the same identifier across snapshots
- diffs refer to existing pre-change identifiers and resulting post-change identifiers deterministically
- runtime-local state that depends on identity can only be preserved when identifiers remain stable
- identifiers are treated as contracts, not presentation details

# Behavioral Rules

1. A producer must emit the same identifier for the same logical entity when its semantic identity has not changed.
2. A producer must emit a different identifier when a logical entity is replaced rather than updated.
3. Snapshot and diff payloads must use identifiers consistently across related records.
4. Consumers may treat identifier instability for unchanged entities as a protocol defect because it breaks reconciliation, layout persistence, and selection continuity.
5. Feature work that introduces a new graph entity kind must define how its identifiers remain stable before the feature is considered complete.

# Inputs

- semantic entities selected for projection
- prior graph versions used for diff generation
- consumer state keyed by graph identifiers

# Outputs

- deterministic identifiers on projected graph entities
- diff operations that can be matched against prior state
- runtime state continuity for selection, layout, visibility, and overlays when semantics are unchanged

# Failure Semantics

- unstable identifiers for unchanged entities invalidate assumptions used by diffing and reconciliation
- when continuity cannot be trusted, consumers may need to recover through a fresh snapshot instead of applying an incremental update
- repeated instability is a behavioral bug and should be tracked through bug-investigation and spec follow-up work

# Validation

- projection and diff tests should verify deterministic identity for unchanged entities
- reconciliation tests should verify that stable identifiers preserve browser-local state across updates
- new entity kinds should add tests that cover identifier stability before and after mutation scenarios

# Related Architecture

- [`../architecture/system-overview.md`](../architecture/system-overview.md)
- [`../protocol/contracts.md`](../protocol/contracts.md)
- [`../ai/protocol.md`](../ai/protocol.md)

# Related Decisions

- [`../decisions/0003-diff-protocol.md`](../decisions/0003-diff-protocol.md)
- [`../decisions/0004-renderer-backend.md`](../decisions/0004-renderer-backend.md)

# Authority

This document is authoritative for stable identifier behavior and validation expectations across projection, diffing, and browser reconciliation.

# Document Contract

Update this spec when identifier rules, recovery behavior, validation expectations, or related entity categories change. Keep it synchronized with [`../SPECS.md`](../SPECS.md), [`../TERMINOLOGY.md`](../TERMINOLOGY.md), protocol documentation, and any milestone or feature document that introduces new identity-bearing graph entities.
