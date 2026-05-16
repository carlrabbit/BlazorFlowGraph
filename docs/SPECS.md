# Specifications

Specifications are the authoritative location for repository behavior, invariants, contracts, state transitions, failure semantics, and validation expectations.

Use a spec when the repository needs durable behavioral truth. Do not use milestones, research notes, TBPs, or workflow docs as the primary source for behavior.

| Spec | Status | Purpose |
|---|---|---|
| [`specs/graph-snapshots.md`](specs/graph-snapshots.md) | Active | Defines graph snapshot structure, validity rules, identity fields, and protocol-version handling |
| [`specs/graph-diffs.md`](specs/graph-diffs.md) | Active | Defines diff operation semantics, ordering rules, version continuity, and browser-state preservation |
| [`specs/browser-runtime-reconciliation.md`](specs/browser-runtime-reconciliation.md) | Active | Defines runtime-owned state, snapshot/diff reconciliation behavior, recovery paths, and diagnostics expectations |
| [`specs/renderer-backend-contract.md`](specs/renderer-backend-contract.md) | Active | Defines renderer backend lifecycle and RenderFrame/backend separation |
| [`specs/layout-provider-contract.md`](specs/layout-provider-contract.md) | Active | Defines async layout provider interface, LayoutGraph/LayoutResult boundaries, and failure semantics |
| [`specs/package-and-release-contract.md`](specs/package-and-release-contract.md) | Active | Defines package boundaries and release-readiness requirements |
| [`specs/stable-identifiers.md`](specs/stable-identifiers.md) | Active | Defines deterministic identifier requirements across projection, diffing, and browser reconciliation |

# Authority

This document is authoritative for the repository's spec layer, what belongs in a spec, and the index of active specs.

# Document Contract

Update this document when a spec is added, renamed, retired, or its authority changes. Keep it synchronized with [`README.md`](../README.md), [`../AGENTS.md`](../AGENTS.md), [`../copilot-instructions.md`](../copilot-instructions.md), and [`specs/README.md`](specs/README.md).
