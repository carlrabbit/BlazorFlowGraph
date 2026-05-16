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
- [`package-and-release-contract.md`](package-and-release-contract.md)
- [`renderer-backend-contract.md`](renderer-backend-contract.md)
- [`stable-identifiers.md`](stable-identifiers.md)

# Authority

This document is authoritative for spec directory conventions and the required template shape for new specs.

# Document Contract

Update this file when the standard spec template or directory conventions change. Keep it synchronized with [`../SPECS.md`](../SPECS.md) and [`../tbps/create-spec.md`](../tbps/create-spec.md).
