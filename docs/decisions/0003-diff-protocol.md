# ADR 0003 — Diff Protocol

**Date:** 2026-05-08  
**Status:** Accepted

# Context

Sending full graph snapshots for every update is wasteful for evolving graphs and makes it harder to preserve stable runtime state across changes.

# Decision

Use an incremental diff protocol alongside full snapshots.

- the server sends a `GraphSnapshot` for initial state
- subsequent updates use `GraphDiff` with `fromVersion` and `toVersion`
- the TypeScript runtime validates version continuity before applying diffs
- a version gap triggers recovery through a fresh snapshot

# Consequences

- network traffic and reconciliation work are reduced for incremental changes
- both runtimes must track versions deterministically
- stable identifiers and ordered diff generation become core protocol requirements

# Alternatives Considered

- snapshot-only synchronization, which would increase payload size and reduce layout and selection stability
- ad hoc partial updates without explicit version continuity, which would weaken deterministic recovery
- browser-authoritative mutation tracking, which would conflict with server-authoritative graph ownership

# Related Documents

- [`../architecture/backend-semantics.md`](../architecture/backend-semantics.md)
- [`../protocol/contracts.md`](../protocol/contracts.md)
- [`../ai/protocol.md`](../ai/protocol.md)
