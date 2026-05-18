# Specs Directory

This directory stores behavior-level specifications.

Specs define durable truth for:

- goals and scope for a behavior area
- terminology used by the behavior
- invariants and behavioral rules
- inputs, outputs, and failure semantics
- validation expectations
- related architecture and decision links

Create new specs with [`../tbps/create-spec.md`](../tbps/create-spec.md).

## Standard Spec Template

Every spec should use this structure:

```markdown
# Goal

# Scope

# Non-Goals

# Terminology

# Invariants

# Behavioral Rules

# Inputs

# Outputs

# Failure Semantics

# Validation

# Related Architecture

# Related Decisions

# Authority

# Document Contract
```

## Current Specs

- [`browser-runtime-reconciliation.md`](browser-runtime-reconciliation.md)
- [`graph-diffs.md`](graph-diffs.md)
- [`graph-snapshots.md`](graph-snapshots.md)
- [`layout-provider-contract.md`](layout-provider-contract.md)
- [`overlay-provider-contract.md`](overlay-provider-contract.md)
- [`package-and-release-contract.md`](package-and-release-contract.md)
- [`renderer-backend-contract.md`](renderer-backend-contract.md)
- [`inspection-workflows.md`](inspection-workflows.md)
- [`large-graph-visibility.md`](large-graph-visibility.md)
- [`search-and-filtering.md`](search-and-filtering.md)
- [`minimap-overview.md`](minimap-overview.md)
- [`multi-view-navigation.md`](multi-view-navigation.md)
- [`progressive-rendering.md`](progressive-rendering.md)
- [`runtime-diagnostics.md`](runtime-diagnostics.md)
- [`sample-index.md`](sample-index.md)
- [`sample-port-registry.md`](sample-port-registry.md)
- [`sample-workspace-launch.md`](sample-workspace-launch.md)
- [`semantic-layering.md`](semantic-layering.md)
- [`semantic-overlays.md`](semantic-overlays.md)
- [`spatial-indexing.md`](spatial-indexing.md)
- [`stable-identifiers.md`](stable-identifiers.md)
- [`viewport-and-navigation.md`](viewport-and-navigation.md)

# Authority

This document is authoritative for spec directory conventions and the required template shape for new specs.

# Document Contract

Update this file when the standard spec template or directory conventions change. Keep it synchronized with [`../SPECS.md`](../SPECS.md) and [`../tbps/create-spec.md`](../tbps/create-spec.md).
