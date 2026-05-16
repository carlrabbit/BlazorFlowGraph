# Terminology

This document defines the canonical repository vocabulary.

# Semantic Model
The authoritative domain representation owned by the .NET runtime.

# Projection
A deterministic visualization-oriented graph representation derived from semantic state.

# Graph Snapshot
A complete versioned projection of the current graph state.

# Graph Diff
A deterministic incremental change set between two graph snapshot versions.

# Protocol
The shared contract surface between the .NET backend and the TypeScript runtime.

# Browser Runtime
The TypeScript execution layer that owns reconciliation, rendering, layout, viewport state, and interaction state.

# Blazor Host
The thin hosting and integration layer that connects .NET orchestration to the browser runtime.

# Layout Graph
A layout-specific graph model used by layout engines instead of the semantic or runtime graph directly.

# Visible Graph
A filtered graph view used to limit rendering and interaction work to relevant elements.

# Render Frame
The positioned rendering contract produced before a rendering backend updates the DOM.

# Stable Identifier
A deterministic graph entity identifier required for reconciliation, layout preservation, animation continuity, and selection preservation.

# Overlay
A lightweight semantic decoration applied independently of the core graph structure.

# Specification
A durable behavior document that defines invariants, contracts, failure semantics, and validation expectations for a named area.

# Milestone
A sequencing document that plans scope, dependencies, and exit criteria without becoming the permanent source of behavior truth.

# Task Best Practice
A reusable project-specific methodology or process pattern for recurring engineering work.

# Authority

This document is authoritative for canonical repository terms and their meanings.

# Document Contract

Update this document when a durable term is introduced, renamed, narrowed, or retired. Keep it synchronized with [`SPECS.md`](SPECS.md), architecture docs, milestone docs, workflow docs, TBPs, and issue forms that depend on canonical vocabulary.
