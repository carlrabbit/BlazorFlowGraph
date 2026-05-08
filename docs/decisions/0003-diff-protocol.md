# ADR 0003 — Diff Protocol

**Date:** 2026-05-08  
**Status:** Accepted

## Context

Sending full graph snapshots on every update is expensive for large graphs.

## Decision

Use an incremental diff protocol (`GraphDiff`) alongside full snapshots.

- The server sends a `GraphSnapshot` on initial connection
- Subsequent updates use `GraphDiff` with `fromVersion`/`toVersion`
- The TypeScript runtime validates version continuity before applying diffs
- If a version gap is detected, the client requests a fresh snapshot

## Consequences

- Reduced network traffic for incremental updates
- Requires version tracking on both server and client
