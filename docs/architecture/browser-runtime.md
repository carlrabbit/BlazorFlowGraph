# Goal

Define the responsibilities and constraints of the TypeScript browser runtime.

# Responsibilities

- reconcile snapshots and diffs into runtime state
- build filtered graph views for rendering and interaction
- execute layout providers against layout-specific graph data
- build render frames for rendering backends
- manage viewport state, selection state, grouping state, overlays, and diagnostics
- handle browser-local interaction flows without server round-trips for high-frequency input

Reconciliation contract details are specified in:

- [`../specs/graph-snapshots.md`](../specs/graph-snapshots.md)
- [`../specs/graph-diffs.md`](../specs/graph-diffs.md)
- [`../specs/browser-runtime-reconciliation.md`](../specs/browser-runtime-reconciliation.md)

# Constraints

- rendering stays browser-side and SVG-first today
- layout remains provider-based and runtime-local
- backends receive render frames instead of raw runtime state
- visible graph filtering should reduce unnecessary DOM work
- runtime logic should remain framework-independent where practical
- runtime treats .NET projection snapshots/diffs as authoritative semantic inputs
- runtime preserves browser-owned state (viewport, selection, focus, search, expanded groups, overlays) across valid updates
- unsupported protocol versions and version-discontinuous diffs are rejected via a recoverable path

# Non-Goals

- mutating the authoritative semantic model in the browser
- embedding renderer logic inside Blazor components
- coupling layout engines directly to .NET projection types
- sending high-frequency pointer events through SignalR

# Current Subsystems

- `@dataflow-visualizer/runtime` — runtime state, eventing, commands, diagnostics, visible graph projection
- `@dataflow-visualizer/query` — topology indexing and traversal helpers
- `@dataflow-visualizer/layout` — layout graph model and layout providers
- `@dataflow-visualizer/renderer-svg` — render frame construction and SVG backend
- `@dataflow-visualizer/host` — browser bootstrap and runtime coordination
- `@dataflow-visualizer/interop` — bridge to .NET/Blazor

# Related Documents

- [`system-overview.md`](system-overview.md)
- [`../layout/architecture.md`](../layout/architecture.md)
- [`../rendering/model.md`](../rendering/model.md)
- [`../decisions/0001-svg-first.md`](../decisions/0001-svg-first.md)
- [`../decisions/0002-elk-layout.md`](../decisions/0002-elk-layout.md)
- [`../decisions/0004-renderer-backend.md`](../decisions/0004-renderer-backend.md)
- [`../ai/rendering.md`](../ai/rendering.md)
