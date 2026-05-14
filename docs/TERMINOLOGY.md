# Terminology

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

# Task Best Practice
A reusable project-specific execution pattern for recurring engineering work.
