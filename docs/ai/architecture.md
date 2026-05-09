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

## TypeScript Packages (Updated)

- `@dataflow-visualizer/protocol` — graph contracts, groups, overlays, protocol versioning
- `@dataflow-visualizer/runtime` — GraphState, state slices, GraphRuntimeStore, GraphRuntimeEventBus, buildSearchIndex
- `@dataflow-visualizer/query` — topology indexes, traversal (findUpstream/Downstream/Connected/Neighbors/extractSubgraph)
- `@dataflow-visualizer/renderer-svg` — SVG rendering with layer support (RenderLayer)
- `@dataflow-visualizer/layout` — layout engine, LayoutPolicy, PersistentLayoutState
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
- preserve automatic layout as a core capability
- move toward ELK-based layout while keeping current placeholder behavior clearly distinguished
- evolve overlay rendering with per-layer rendering pipeline

## Related Docs

- `README.md`
- `docs/architecture/overview.md`
- `docs/decisions/0001-svg-first.md`
- `docs/decisions/0002-elk-layout.md`
- `docs/decisions/0003-diff-protocol.md`
