# BlazorFlowGraph Milestone Plan

This document defines the planned milestone progression for BlazorFlowGraph.

The milestones focus on:
- semantic graph projection
- incremental synchronization
- browser-side rendering/runtime
- automatic layouts
- topology exploration

The project intentionally does NOT target:
- generic diagram editing
- BPMN authoring
- whiteboard-style interaction
- arbitrary freeform design tooling

Milestones are capability-oriented and intentionally avoid time estimates.

---

# Architectural Foundation

Before milestone implementation begins, the repository should already provide:

- repository structure
- CI/CD setup
- .NET and TypeScript build pipelines
- workspace/package management
- testing infrastructure
- documentation structure
- architecture decision records (ADRs)

---

# Milestone 1 — Semantic Projection Rendering

## Goal

Establish the foundational rendering pipeline from semantic graph projection to browser visualization.

This milestone proves:
- projection architecture
- browser rendering pipeline
- Blazor integration
- runtime bootstrap

without introducing incremental synchronization complexity.

---

## Scope

## .NET

### Semantic Projection Model

Implement:
- graph projection model
- node model
- edge model
- grouping model
- metadata model

Requirements:
- stable identifiers
- deterministic serialization
- immutable-ish snapshots

---

### Projection Pipeline

Implement:
- semantic extraction pipeline
- projection generation pipeline
- serialization pipeline

Requirements:
- semantic model separated from rendering model
- rendering-independent projection structures

---

## TypeScript Runtime

### Runtime Bootstrap

Implement:
- browser runtime initialization
- graph loading
- rendering bootstrap
- viewport bootstrap

---

### SVG Renderer

Implement:
- SVG graph rendering
- node rendering
- edge rendering
- labels
- basic styling

Requirements:
- scalable DOM structure
- stable element identifiers
- renderer isolation

---

### Viewport Runtime

Implement:
- zoom
- pan
- fit-to-screen
- viewport transforms

---

## Blazor Integration

Implement:
- Blazor host component
- JS interop bridge
- initial graph handoff
- lifecycle integration

Requirements:
- browser runtime owns rendering
- Blazor remains orchestration layer

---

## Samples

Implement:
- minimal viewer sample
- static graph sample
- semantic projection sample

---

## Tests

Implement:
- projection serialization tests
- renderer bootstrap tests
- viewport behavior tests

---

## Exit Criteria

- semantic graph can be projected from .NET
- graph can be rendered in browser
- viewport navigation works
- architecture boundaries are established
- renderer remains browser-owned

---

# Milestone 2 — Semantic Topology Exploration Runtime

## Goal

Transform the system from a graph renderer into a semantic topology exploration runtime.

This milestone establishes:
- semantic navigation
- topology querying
- grouping semantics
- focus systems
- overlay systems
- scalable runtime architecture

---

## Scope

## TypeScript Runtime

### Runtime Store Architecture

Implemented `GraphRuntimeStore` with explicit state slices:
- `GraphDataState` — nodes, edges, groups
- `InteractionState` — selection, hover
- `FocusState` — focused node/group, navigation history
- `SearchState` — text query, matched node IDs
- `OverlayState` — per-node, per-edge overlays
- `LayoutState` — layout policy, expanded group IDs

### Semantic Event Bus

`GraphRuntimeEventBus` fires typed events: `SelectionChanged`, `FocusChanged`, `GroupCollapsed`, `GroupExpanded`, `SearchApplied`, `ViewportChanged`.

### Graph Query Engine

New package `@dataflow-visualizer/query`:
- `buildTopologyIndex` — incoming/outgoing edge maps, group membership
- `findUpstream`, `findDownstream`, `findConnected`, `findNeighbors`
- `findGroupMembers`, `findGroupBoundaryEdges`
- `extractSubgraph` — seed-node-based subgraph extraction with traversal options

### Search Index

`buildSearchIndex` in `@dataflow-visualizer/runtime` — text, kind, and metadata search.

### Layout Policies

`LayoutPolicy` enum: `Never | Incremental | Full | GroupLocal | Manual`.
`PersistentLayoutState` for stable coordinate persistence.

### Renderer Layering

`RenderLayer` type and `renderLayer` function in `@dataflow-visualizer/renderer-svg` provide explicit rendering passes.

---

## .NET

### Protocol Groups

`GraphGroup` and `GroupId` types. `GraphSnapshot` carries optional `groups`. `GraphDiff` carries optional `groupOperations` (`GroupDiffOperation[]`).

### Overlays

`NodeOverlay` and `EdgeOverlay` protocol records.

### Protocol Versioning

`GraphSnapshot.ProtocolVersion` integer field.

### Group Diffing

`GraphDiffer` computes group add/remove/update operations.

### Persistence Model

`GraphViewState` + `ViewportSnapshot` for serializable browser view state (deep links, bookmarks).

### Semantic Attributes

`SemanticGroupAttribute` for marking group containers. `ReflectionGraphProjector` projects them into `GraphGroup` entries.

---

## Tests

- Query engine: 22 traversal, isolation, and grouping tests
- Runtime store and event bus: 24 tests
- .NET protocol + diffing: 39 tests total (groups, overlays, view state)

---

## Exit Criteria

- runtime store separates concerns ✅
- topology querying is centralized in query package ✅
- groups are semantic containers ✅
- layout policies are explicit ✅
- overlays are extensible ✅
- protocol versioning is manageable ✅
- persistence model exists ✅
- semantic event model is formalized ✅

---

# Milestone 3 — Extensible Semantic Visualization Platform

## Goal

Transition BlazorFlowGraph from a semantic graph exploration runtime into an extensible semantic visualization platform.

This milestone establishes:
- renderer backend abstraction
- view projection layer
- overlay platform
- command-driven interactions
- layout provider abstraction
- viewport context
- virtualization-ready architecture
- runtime diagnostics

while preserving semantic-first architecture, explicit runtime ownership, and protocol stability.

---

## Scope

## TypeScript Runtime

### Semantic Commands

New `SemanticCommand` discriminated union in `@dataflow-visualizer/runtime`:
- `FocusNode` — focuses a specific node in the store
- `CollapseGroup` — collapses a group (idempotent)
- `ExpandGroup` — expands a group (idempotent)
- `FitSelection` — signals the renderer to fit the viewport to selection
- `ApplySearch` — applies a search query
- `NavigateBack` — navigates to the previous node in focus history

### GraphRuntimeHost — Composition Root

New `GraphRuntimeHost` class wiring the runtime subsystems:
- holds `GraphRuntimeStore`, `OverlayRegistry`, `RuntimeDiagnostics`
- dispatches `SemanticCommand` with built-in handling + extensible handler registration
- lifecycle coordination without global singletons

### ViewportContext

New `ViewportContext` interface and `createViewportContext` factory:
- pan offset, zoom scale, screen dimensions
- `visibleBounds` in graph-space computed automatically for visibility culling

### VisibleGraph + Visibility Policy

New `VisibleGraph` model and `buildVisibleGraph` function:
- distinct from semantic graph and full runtime graph
- `VisibilityPolicy` supports: search filtering, focus-neighbor filtering, collapsed group filtering
- foundation for virtualization and viewport culling

### Overlay Registry

New `OverlayRegistry` class for structured overlay management:
- overlay `kind` registration with `displayName` and `zOrder`
- visibility toggle per overlay kind
- `getVisible()` returns active overlays in z-order

### Spatial Index

New `SpatialIndex` interface and `buildSpatialIndex` function:
- `query(region)` for visibility culling
- `hitTest(x, y)` for interaction
- Linear-scan implementation (replace with quadtree for large graphs)

### Runtime Diagnostics

New `RuntimeDiagnostics` class:
- timing sample recording (`record(label, durationMs)`)
- visible node/edge count tracking
- diff application counter
- `getSummary()` for devtools

### Expanded Event Bus

`RuntimeEventMap` expanded with Milestone 3 events:
- `CommandDispatched` — semantic command fired through the host
- `OverlayRegistryChanged` — overlay registration/visibility change
- `LayoutCompleted` — layout computation completed with duration

---

## Renderer

### RenderFrame Model

New `RenderFrame` model in `@dataflow-visualizer/renderer-svg`:
- contains positioned `RenderNode[]` and `RenderEdge[]`
- separate from runtime state — produced by the view projection pipeline
- `buildRenderFrame(state, layout, options?)` builds a frame, optionally filtered by `VisibleGraph`

### GraphRendererBackend Interface

New `GraphRendererBackend` interface:
- `initialize(container, width, height)`
- `renderFrame(frame)`
- `updateViewport(panX, panY, scale)`
- `resize(width, height)`
- `dispose()`

### SvgRendererBackend

New `SvgRendererBackend` class implementing `GraphRendererBackend`:
- SVG-based backend wrapping the existing SVG rendering logic
- validates backend abstraction viability

---

## Layout

### LayoutGraph Model

New `LayoutGraph` model in `@dataflow-visualizer/layout`:
- `LayoutGraphNode`, `LayoutGraphEdge`, `LayoutGraphGroup`
- decoupled from runtime graph — purpose-built for layout engines
- `buildLayoutGraph(snapshot, options?)` converts a `GraphSnapshot` to `LayoutGraph`

### LayoutProvider Interface

New `LayoutProvider` interface:
- `computeLayout(graph, options?): Promise<LayoutResult>`
- async to support WASM-based engines (ELK, force-directed)
- enables alternative layouts without touching the rendering pipeline

### GridLayoutProvider

New `GridLayoutProvider` class implementing `LayoutProvider`:
- wraps the existing `computeLayout` grid logic
- serves as the reference/default implementation

### Expanded LayoutPolicy

`LayoutPolicy` expanded with `"Local"` and `"Frozen"` variants.

---

## Tests

- 56 new runtime tests covering: SemanticCommand, createViewportContext, buildVisibleGraph, OverlayRegistry, buildSpatialIndex, RuntimeDiagnostics, GraphRuntimeHost, new RuntimeEventMap events
- 7 new renderer-svg tests covering: buildRenderFrame, RenderFrame model, VisibleGraph filtering
- 15 new layout tests covering: buildLayoutGraph, GridLayoutProvider, LayoutProvider interface, LayoutPolicy expansion
- New test package: `@dataflow-visualizer/layout-tests`

---

## Exit Criteria

- renderer backend abstraction established ✅
- RenderFrame model decouples pipeline from runtime state ✅
- VisibleGraph enables partial rendering and viewport culling ✅
- OverlayRegistry provides structured overlay management ✅
- SemanticCommands drive interactions deterministically ✅
- LayoutProvider interface enables pluggable layout engines ✅
- LayoutGraph decouples layout from runtime graph ✅
- ViewportContext supports viewport-aware rendering ✅
- SpatialIndex foundation for hit testing and virtualization ✅
- RuntimeDiagnostics captures render/layout timing metrics ✅
- All existing tests continue to pass ✅

---

# Milestone 4 — Deferred Platform Completion

## Goal

Collect the deferred Milestone 3 work and the next open topics already called out in the repository documentation before moving on to broader extensions.

This milestone focuses on:
- completing deferred Milestone 3 platform work
- hardening rendering and layout extension points
- improving accessibility, sample coverage, and large-graph readiness

---

## Scope

### Deferred from merged pull requests

- node composition regions and style tokens deferred in PR #13
- accessibility work deferred in PR #13
- playground/sample expansion deferred in PR #13

### Open topics from the current documentation

- add an ELK-backed `LayoutProvider` implementation on top of `LayoutGraph`
- mature group and overlay rendering beyond the current extension-point stubs
- build viewport culling and virtualization on top of `VisibleGraph` and `SpatialIndex`
- add overview/minimap and coordinated multi-view capabilities on `ViewportContext`
- expand overlay-driven inspection plus richer search/filtering workflows on top of the Milestone 2 query/runtime foundations

---

## Exit Criteria

- the deferred Milestone 3 items are implemented or explicitly re-scoped ✅
- the layout pipeline remains provider-based and ready for non-grid engines ✅
- rendering/runtime boundaries remain intact while group and overlay rendering mature ✅
- docs and samples reflect the supported integration path and current platform capabilities ✅

### Implemented

- **ElkLayoutProvider** — ELK-backed `LayoutProvider` using elkjs with lazy dynamic import for tree-shaking; falls back to `GridLayoutProvider` if ELK is unavailable (e.g. in test environments). Accepts `algorithm` and layout option overrides.
- **Style tokens** — `StyleToken` system in `@dataflow-visualizer/renderer-svg` maps node `kind` to visual appearance (fill, stroke, strokeWidth, textColor, rx). `defaultStyleTokens` covers: `default`, `service`, `datastore`, `gateway`, `queue`, `group`. `resolveStyleToken(kind, registry?)` resolves with fallback to `default`.
- **Accessibility** — SVG roots now carry `role="graphics-document"` and `aria-label="Dataflow graph"`. Node `<g>` elements carry `role="graphics-symbol"` and `aria-label` with the node label. Group containers carry `role="graphics-object"`.
- **Group rendering** — `renderLayer("groups", ...)` now produces group hull containers as dashed rectangles with padded bounding boxes around child nodes. `buildRenderFrame` includes `groups: RenderGroup[]` in the frame. Group style tokens applied via kind resolution.
- **Overlay rendering** — `buildRenderFrame` accepts `nodeOverlays?: ReadonlyMap<string, NodeOverlay>` and produces `overlays: RenderOverlay[]` in the frame. `SvgRendererBackend.renderFrame` renders overlay badges (colored circles with short text) on matching nodes.
- **Viewport culling** — `buildRenderFrame` accepts optional `viewport?: ViewportContext`; nodes and group hulls outside `viewport.visibleBounds` are excluded from the frame, reducing backend rendering load for large graphs.
- **LayoutPlayground expansion** — sample now uses varied node kinds (`service`, `datastore`, `gateway`, `queue`), includes a Groups checkbox that splits nodes into two groups, and shows group label/count in the UI.
- **Tests** — 4 new `ElkLayoutProvider` tests in `layout-tests`; 23 new Milestone 4 tests in `renderer-svg-tests` covering style tokens, accessibility, group rendering, overlay rendering, viewport culling, and RenderFrame structure.

### Explicitly re-scoped to Extension — Multi-View Synchronization

- **Minimap / overview panel** — requires dedicated rendering surface, minimap viewport synchronization, and substantial interaction work. Deferred to Extension milestone.
- **Coordinated multi-view** — depends on minimap infrastructure. Deferred to the same Extension milestone.

### Partially deferred

- **Richer search/filtering workflows** — the search index and runtime infrastructure exists. Richer overlay-driven workflows require dedicated UX work and are deferred to Extension — Search and Filtering.

---

# Potential Extensions

The following extensions align with the project's goals and architectural direction.

These are intentionally separated from the core milestones.

---

# Extension — Semantic Overlays

## Goals

Add semantic overlays and runtime metadata visualization.

Possible features:
- throughput visualization
- latency overlays
- ownership overlays
- deployment/environment overlays
- health indicators
- error highlighting

---

# Extension — Advanced Topology Exploration

## Goals

Improve graph comprehension capabilities.

Possible features:
- path analysis
- cycle detection
- orphan detection
- impact analysis
- dependency depth visualization

---

# Extension — Large Graph Optimization

## Goals

Improve scalability for very large graphs.

Possible features:
- viewport culling
- virtualization
- spatial indexing
- progressive rendering
- renderer batching

---

# Extension — Renderer Abstraction

## Goals

Support alternative rendering backends.

Possible targets:
- Canvas renderer
- WebGL renderer

Requirements:
- rendering/runtime separation remains intact

---

# Extension — Temporal Graph Visualization

## Goals

Visualize graph evolution over time.

Possible features:
- historical graph snapshots
- timeline navigation
- topology diff visualization
- playback mode

---

# Extension — Advanced Layout Strategies

## Goals

Expand layout flexibility.

Possible features:
- force-directed layouts
- radial layouts
- domain-specific layouts
- custom layout plugins

---

# Extension — Search and Filtering

## Goals

Improve graph navigation and exploration.

Possible features:
- indexed search
- semantic filtering
- topology filtering
- dynamic highlighting
- saved views

---

# Extension — Semantic Plugin Model

## Goals

Allow consumers to extend projection behavior.

Possible features:
- projection hooks
- semantic enrichers
- metadata providers
- overlay providers

---

# Extension — Multi-View Synchronization

## Goals

Allow multiple coordinated graph views.

Possible features:
- synchronized viewports
- overview/minimap views
- detail/context split views

---

# Explicit Non-Goals

The following areas are intentionally outside the current project direction.

These should not influence milestone planning unless the project direction changes explicitly.

---

# Generic Diagram Authoring

Not a target:
- freeform diagram editing
- arbitrary drag/drop authoring
- Visio-style tooling

---

# BPMN Compliance

Not a target:
- BPMN specification compliance
- BPMN execution engines
- BPMN serialization support

---

# Whiteboard Features

Not a target:
- free drawing
- sticky notes
- collaborative sketching
- canvas whiteboarding

---

# Heavy Client-Side Domain Ownership

Not a target:
- browser-authoritative semantic state
- domain mutation inside renderer
- rendering-driven domain logic

---

# Fine-Grained Blazor Rendering

Not a target:
- large Razor component trees
- Blazor-driven rendering loops
- server-side DOM orchestration

---

# Architectural Constraints

The following constraints should remain valid throughout milestone progression.

---

# Semantic Model Separation

Semantic models and visualization projections must remain separate.

---

# Stable Identifiers

All graph elements must use stable deterministic identifiers.

---

# Browser-Owned Rendering

Rendering and interaction remain browser runtime responsibilities.

---

# Incremental Synchronization

The architecture should prefer incremental updates over full rerendering.

---

# Layout as Infrastructure

Layout systems should remain pluggable and renderer-independent.

---

# Framework Independence

The TypeScript runtime should remain as framework-independent as practical.

Avoid:
- React lock-in
- Vue lock-in
- framework-specific rendering assumptions

---

# Long-Term Direction

BlazorFlowGraph aims to evolve into a semantic topology visualization platform for dynamic .NET systems.

The long-term focus is:
- topology comprehension
- evolving graph visualization
- scalable semantic exploration
- automatic layouts
- stable incremental synchronization

rather than generic diagram authoring.
