# AI Architecture Reference

## Scope

This document summarizes the high-level system architecture that AI-assisted changes should preserve.

## Current State

BlazorFlowGraph is a semantic dataflow visualization framework built around:

- a .NET semantic backend
- a TypeScript browser runtime
- Blazor as the hosting and integration layer
- incremental graph synchronization
- SVG-first rendering

The diagram is a generated projection of semantic state, not the source of truth.

## Runtime Responsibilities

### .NET

The .NET side owns:

- semantic models
- semantic annotations
- projection generation
- diff generation
- validation
- orchestration
- persistence

### TypeScript Runtime

The browser runtime owns:

- graph reconciliation
- rendering
- layout execution
- viewport state
- interaction state
- selection, filtering, and grouping behavior
- visible graph projection
- command dispatch

### Blazor

Blazor should stay thin and primarily handle:

- hosting
- composition
- .NET to browser integration

Avoid pushing rendering, reconciliation, or layout algorithms into Razor components.

## Architectural Constraints

- Keep semantic models decoupled from visualization DTOs.
- Prefer incremental diffs over full graph replacement.
- Preserve stable deterministic IDs for nodes and edges.
- Keep semantic, rendering, and interaction concerns in separate layers.
- Treat the visualization graph as disposable and reproducible.

## Repository Map

### .NET Projects

- `Diagram.Protocol`
- `Diagram.Semantics`
- `Diagram.Projection`
- `Diagram.Diffing`
- `Diagram.Blazor`
- `Diagram.Blazor.Server`

### TypeScript Packages

- `@dataflow-visualizer/protocol`
- `@dataflow-visualizer/runtime`
- `@dataflow-visualizer/renderer-svg`
- `@dataflow-visualizer/layout`
- `@dataflow-visualizer/interop`
- `@dataflow-visualizer/host`

## TypeScript Packages (Updated — Milestone 3)

- `@dataflow-visualizer/protocol` — graph contracts, groups, overlays, protocol versioning
- `@dataflow-visualizer/runtime` — GraphState, state slices, GraphRuntimeStore, GraphRuntimeEventBus, buildSearchIndex; **NEW**: SemanticCommand, GraphRuntimeHost, ViewportContext, VisibleGraph, OverlayRegistry, SpatialIndex, RuntimeDiagnostics, expanded RuntimeEventMap
- `@dataflow-visualizer/query` — topology indexes, traversal (findUpstream/Downstream/Connected/Neighbors/extractSubgraph)
- `@dataflow-visualizer/renderer-svg` — SVG rendering with layer support (RenderLayer); **NEW**: RenderFrame, GraphRendererBackend, SvgRendererBackend, buildRenderFrame
- `@dataflow-visualizer/layout` — layout engine, LayoutPolicy, PersistentLayoutState; **NEW**: LayoutProvider, LayoutGraph, buildLayoutGraph, GridLayoutProvider
- `@dataflow-visualizer/interop` — DotNetBridge exposing store and eventBus
- `@dataflow-visualizer/host` — runtime bootstrap, viewport management

## Runtime Store Architecture

The browser runtime uses a central `GraphRuntimeStore` (in `@dataflow-visualizer/runtime`) that holds:

- `GraphDataState` — nodes, edges, groups (the authoritative projection data)
- `InteractionState` — selection, hover
- `FocusState` — focused node/group, navigation history
- `SearchState` — text/kind query and matched node IDs
- `OverlayState` — per-node and per-edge overlay decorations
- `LayoutState` — layout policy and group expansion state

Mutations fire typed events via `GraphRuntimeEventBus`:
- `SelectionChanged`, `FocusChanged`, `GroupCollapsed`, `GroupExpanded`, `SearchApplied`, `ViewportChanged`
- **NEW (Milestone 3)**: `CommandDispatched`, `OverlayRegistryChanged`, `LayoutCompleted`

## GraphRuntimeHost (Milestone 3)

`GraphRuntimeHost` is the composition root for the browser runtime:
- wires `GraphRuntimeStore`, `OverlayRegistry`, `RuntimeDiagnostics`
- dispatches `SemanticCommand` with built-in handling for `FocusNode`, `CollapseGroup`, `ExpandGroup`, `ApplySearch`, `NavigateBack`, `FitSelection`
- supports additional command handlers via `addCommandHandler`
- avoids global singleton state

## Render Pipeline (Milestone 3)

The rendering pipeline is now formally separated into stages:

```
runtime state
    → buildVisibleGraph (view projection)
    → buildRenderFrame (frame construction)
    → GraphRendererBackend.renderFrame (backend rendering)
```

- `VisibleGraph` — filtered subset of nodes/edges/groups based on viewport, search, and focus
- `RenderFrame` — fully positioned nodes and edges ready for a backend to render
- `GraphRendererBackend` — interface abstracting the render surface (SVG, Canvas, WebGL)
- `SvgRendererBackend` — SVG implementation validating the interface

## LayoutProvider (Milestone 3)

Layout engines implement `LayoutProvider`:
- `computeLayout(graph: LayoutGraph, options?): Promise<LayoutResult>`
- `LayoutGraph` is purpose-built for layout — separate from runtime or semantic graphs
- `GridLayoutProvider` is the default (reference) implementation
- ELK and other engines integrate by implementing `LayoutProvider`

## Visibility and Spatial Index (Milestone 3)

- `buildVisibleGraph(data, policy?)` — produces a `VisibleGraph` from runtime data and a `VisibilityPolicy` (search filter, focus filter, collapsed groups)
- `buildSpatialIndex(entries)` — linear-scan spatial index for hit testing and viewport culling
- Foundation for future virtualization and progressive rendering

## OverlayRegistry (Milestone 3)

`OverlayRegistry` manages structured overlay registration:
- overlays identified by `kind` string
- `displayName` and `zOrder` for display and layering
- visibility toggle per overlay kind
- `getVisible()` returns active overlays in deterministic z-order

## Runtime Diagnostics (Milestone 3)

`RuntimeDiagnostics` collects metrics:
- timing samples with labels (render, layout, diff)
- visible node/edge counts
- total diff application counter
- `getSummary()` for devtools and observability

## Groups

Groups (`GraphGroup`) are semantic topology containers introduced in Milestone 2.
- Protocol: `GraphGroup` in both TypeScript and .NET with `childNodeIds`
- Diff: `GroupDiffOperation` (add/remove/update) in `GraphDiff`
- Runtime: `expandedGroupIds` in `LayoutState` tracks collapse/expand state
- Query: `findGroupMembers`, `findGroupBoundaryEdges` in `@dataflow-visualizer/query`

## Query Engine

The `@dataflow-visualizer/query` package provides topology traversal:
- `buildTopologyIndex(data)` — builds incoming/outgoing edge maps and group membership indexes
- `findUpstream/Downstream/Connected/Neighbors` — BFS traversal with depth limits and filters
- `extractSubgraph` — extracts a subgraph around seed nodes (critical for focus and isolation)

## Search

`buildSearchIndex(data)` in `@dataflow-visualizer/runtime` builds a search index over node labels, kinds, and metadata. The `GraphRuntimeStore.setSearch()` method updates search state and fires `SearchApplied`.

## Persistence

`GraphViewState` (.NET: `Diagram.Protocol/GraphViewState.cs`) captures browser-side view state for deep links and saved views: viewport, expanded groups, selected nodes, focused node.

## Planned Direction

- keep expanding the diff-based synchronization model
- move toward ELK-based layout via the `LayoutProvider` interface
- expand overlay platform with per-layer rendering pipeline
- evolve `SvgRendererBackend` toward full `GraphRendererBackend` lifecycle
- add minimap/multi-viewport support building on `ViewportContext`

## Related Docs

- `README.md`
- `docs/architecture/overview.md`
- `docs/decisions/0001-svg-first.md`
- `docs/decisions/0002-elk-layout.md`
- `docs/decisions/0003-diff-protocol.md`
- `docs/decisions/0004-renderer-backend.md`
