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
| [`specs/semantic-overlays.md`](specs/semantic-overlays.md) | Active | Defines semantic overlay identity, targets, registry behavior, and safe rendering constraints |
| [`specs/overlay-provider-contract.md`](specs/overlay-provider-contract.md) | Active | Defines deterministic overlay provider lifecycle, I/O boundaries, and failure isolation |
| [`specs/inspection-workflows.md`](specs/inspection-workflows.md) | Active | Defines semantic inspection payloads, runtime events, and host callback integration |
| [`specs/search-and-filtering.md`](specs/search-and-filtering.md) | Active | Defines explicit search/filter visibility modes and overlay-aware exploration behavior |
| [`specs/semantic-layering.md`](specs/semantic-layering.md) | Active | Defines multi-layer semantic ownership, visibility, and conflict-resolution ordering |
| [`specs/large-graph-visibility.md`](specs/large-graph-visibility.md) | Active | Defines complete-graph vs visible-graph semantics and visibility derivation outputs |
| [`specs/viewport-and-navigation.md`](specs/viewport-and-navigation.md) | Active | Defines browser-owned viewport state and semantic navigation command behavior |
| [`specs/spatial-indexing.md`](specs/spatial-indexing.md) | Active | Defines spatial-index role, required operations, and lifecycle expectations |
| [`specs/progressive-rendering.md`](specs/progressive-rendering.md) | Active | Defines render-budget semantics and progressive frame-priority behavior |
| [`specs/multi-view-navigation.md`](specs/multi-view-navigation.md) | Active | Defines shared-graph, view-local state boundaries, and explicit synchronization |
| [`specs/minimap-overview.md`](specs/minimap-overview.md) | Active | Defines minimap/overview behavior as a coordinated secondary view |
| [`specs/runtime-diagnostics.md`](specs/runtime-diagnostics.md) | Active | Defines required runtime diagnostics metrics and exposure constraints |
| [`specs/sample-port-registry.md`](specs/sample-port-registry.md) | Active | Defines deterministic sample port reservations and sample registry field contracts |
| [`specs/sample-index.md`](specs/sample-index.md) | Active | Defines sample index rendering and current-origin URL resolution behavior |
| [`specs/sample-workspace-launch.md`](specs/sample-workspace-launch.md) | Active | Defines launch-all sample tooling and sample-focused dev-container launch behavior |

# Authority

This document is authoritative for the repository's spec layer, what belongs in a spec, and the index of active specs.

# Document Contract

Update this document when a spec is added, renamed, retired, or its authority changes. Keep it synchronized with [`README.md`](../README.md), [`../AGENTS.md`](../AGENTS.md), and [`../copilot-instructions.md`](../copilot-instructions.md).
