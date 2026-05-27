# Decisions

## Purpose

Architecture decision records capture durable rationale for accepted design choices. They explain why the repository chose a direction; they do not replace architecture docs for structure or specs for behavior.

Decision records are authoritative for:
- rationale behind accepted structural design choices;
- the history of alternatives considered.

Decision records are not authoritative for:
- how the system currently works (see `docs/ARCHITECTURE.md`);
- behavioral invariants (see `docs/SPECS.md`).

## Available Decision Records

| ADR | Status | Purpose |
|---|---|---|
| [`decisions/0001-svg-first.md`](decisions/0001-svg-first.md) | Accepted | Records the SVG-first rendering decision |
| [`decisions/0002-elk-layout.md`](decisions/0002-elk-layout.md) | Accepted | Records the ELK-backed layout provider decision |
| [`decisions/0003-diff-protocol.md`](decisions/0003-diff-protocol.md) | Accepted | Records the diff-based synchronization decision |
| [`decisions/0004-renderer-backend.md`](decisions/0004-renderer-backend.md) | Accepted | Records the renderer backend abstraction decision |
| [`decisions/0005-default-diagram-visual-direction.md`](decisions/0005-default-diagram-visual-direction.md) | Accepted | Records the calm technical dataflow visual direction decision |

## Authority

This document is authoritative for decision-record routing and the ADR index for this repository.

## Document Contract

Update this document when an ADR is added, renamed, superseded, or retired. Keep it synchronized with [`ARCHITECTURE.md`](ARCHITECTURE.md) and [`../README.md`](../README.md).
