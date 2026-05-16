# Specifications

Specifications are the authoritative location for repository behavior, invariants, contracts, state transitions, failure semantics, and validation expectations.

Use a spec when the repository needs durable behavioral truth. Do not use milestones, research notes, TBPs, or workflow docs as the primary source for behavior.

| Spec | Status | Purpose |
|---|---|---|
| [`specs/stable-identifiers.md`](specs/stable-identifiers.md) | Active | Defines deterministic identifier requirements across projection, diffing, and browser reconciliation |

## Planned Spec Areas

These areas already appear in architecture, roadmap, or protocol references and should graduate into dedicated specs as they need tighter behavioral authority:

- graph snapshots and version continuity
- graph diffs and recovery behavior
- browser runtime reconciliation

# Authority

This document is authoritative for the repository's spec layer, what belongs in a spec, and the index of active specs.

# Document Contract

Update this document when a spec is added, renamed, retired, or its authority changes. Keep it synchronized with [`README.md`](../README.md), [`../AGENTS.md`](../AGENTS.md), [`../copilot-instructions.md`](../copilot-instructions.md), and [`specs/README.md`](specs/README.md).
