# Architecture

## Purpose

Architecture documents define runtime boundaries, subsystem responsibilities, and structural relationships.

Architecture documents are authoritative for:
- runtime ownership boundaries;
- subsystem responsibilities and constraints;
- integration seams between subsystems;
- structural design decisions that are durable across milestones.

Architecture documents are not authoritative for:
- feature behavior or invariants (see `docs/SPECS.md`);
- decision rationale (see `docs/DECISIONS.md`);
- engineering commands or toolchain (see `docs/ENGINEERING.md`).

## Available Architecture Documents

| Document | Purpose |
|---|---|
| [`architecture/system-overview.md`](architecture/system-overview.md) | Repository-wide runtime boundaries and ownership |
| [`architecture/backend-semantics.md`](architecture/backend-semantics.md) | .NET semantic-side responsibilities |
| [`architecture/browser-runtime.md`](architecture/browser-runtime.md) | Browser runtime responsibilities and constraints |
| [`architecture/blazor-hosting.md`](architecture/blazor-hosting.md) | Blazor hosting and integration responsibilities |

## Authority

This document is authoritative for the architecture index and for routing to architecture documents under `docs/architecture/`.

## Document Contract

Update this document when architecture documents are added, renamed, or retired. Keep it synchronized with [`DECISIONS.md`](DECISIONS.md), [`../README.md`](../README.md), [`../AGENTS.md`](../AGENTS.md), and [`architecture/system-overview.md`](architecture/system-overview.md).
