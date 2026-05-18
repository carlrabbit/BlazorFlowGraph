# BlazorFlowGraph Milestone Plan

This document defines the planned milestone progression for BlazorFlowGraph.

It remains a high-level roadmap, not the authoritative source for permanent behavior. Durable behavioral truth belongs in [`docs/SPECS.md`](docs/SPECS.md) and `docs/specs/`; structure belongs in `docs/architecture/`; rationale belongs in `docs/decisions/`.

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

# Milestone 5 — Public Contract Hardening and Release Readiness

## Goal

Make BlazorFlowGraph consumable as a public library by hardening the existing contract surfaces from Milestones 1–4.

This milestone focuses on:
- contract precision and indexing in `docs/specs/`
- reconciliation and version-continuity hardening
- backend/layout contract validation tests
- CI release-path validation (samples + packing checks)
- public package onboarding clarity

## Non-Goals

- generic diagram editor semantics
- arbitrary node dragging/editing behavior
- plugin marketplace design
- runtime architecture redesign
- Canvas/WebGL backend implementation in this milestone

## Implementation Slices

- [x] Add contract specs for snapshots, diffs, browser reconciliation, renderer backend, layout provider, and package/release.
- [x] Update spec/workflow/architecture indexes to route durable behavior to authoritative documents.
- [x] Close contract gaps in protocol/runtime interop: snapshot validation, diff version continuity checks, and protocol-versioned diffs.
- [x] Add validation tests for snapshot validity, diff mismatch/recovery, renderer backend lifecycle contract, and deterministic layout fallback.
- [x] Update README public onboarding with package install path and contract references.
- [x] Harden CI workflow with sample build and packable project validation.

## Exit Criteria

- public contracts are documented in specs and indexed from `docs/SPECS.md` and `docs/specs/README.md` ✅
- runtime reconciliation enforces version continuity and rejects invalid snapshot payloads via recoverable behavior ✅
- renderer/layout/reconciliation contract tests cover release-critical behavior ✅
- CI validates release-critical sample and packaging paths ✅
- README provides a credible first-use path for package consumers ✅

---

# Milestone 6 — Semantic Overlays and Inspection Workflows

## Goal

Turn overlay infrastructure into a durable semantic exploration system that supports layered overlays, inspection events, and explicit search/filter behavior.

## Implementation Slices

- [x] Add semantic overlay, inspection workflow, search/filtering, overlay-provider, and semantic-layering specs.
- [x] Add runtime overlay provider contract and provider registration lifecycle in `GraphRuntimeHost`.
- [x] Extend `OverlayRegistry` with optional description and legend metadata.
- [x] Recompute provider overlays after snapshot/diff application and command-driven runtime state changes.
- [x] Extend render-frame overlay representation with safe default shape semantics (`badge`, `marker`, `halo`, `muted`).
- [x] Add semantic inspection events and host inspection helpers (`NodeInspected`, `EdgeInspected`, `GroupInspected`, `SelectionInspected`, `OverlayInspected`).
- [x] Add explicit search visibility behavior modes (`highlight`, `filter`, `isolate`).
- [x] Add sample callback flow in `SemanticAnnotations` using `DataflowGraph` inspection callbacks.
- [x] Expand TypeScript runtime and renderer tests for provider lifecycle, failure isolation, overlay metadata, and search/inspection behavior.

## Exit Criteria

- overlay semantics are specified and indexed ✅
- overlay providers can be registered, recomputed, disabled, and inspected ✅
- overlay failures do not break graph rendering ✅
- inspection events allow Blazor consumers to open custom detail UI callbacks ✅
- search/filter behavior is explicit and documented ✅
- sample callback flow demonstrates semantic inspection behavior ✅

---

# Milestone 7 — Large-Graph Interaction and Multi-View Navigation

## Goal

Make BlazorFlowGraph credible for larger real-world dataflow graphs by hardening visibility, viewport/navigation semantics, spatial indexing, progressive rendering, minimap/overview coordination, and runtime diagnostics.

## Non-Goals

- do not make WebGL the default renderer
- do not replace SVG as the default backend
- do not optimize for arbitrary million-node graphs
- do not add generic diagram editing
- do not duplicate semantic graph state across minimap/multi-view surfaces

## Implementation Slices

- [x] Add large-graph visibility, viewport/navigation, spatial-indexing, progressive-rendering, multi-view, minimap, and runtime-diagnostics specs.
- [x] Update spec indexes and architecture/rendering docs to route the new authority surfaces.
- [x] Add visibility diagnostics outputs (including reason-coded culling) to visible-graph derivation.
- [x] Extend semantic navigation commands (`FitGraph`, `RevealElement`, `FocusGroup`, `NavigateForward`) and reveal behavior for hidden targets.
- [x] Keep spatial indexing interface-backed while allowing scalable implementations behind the same query/hit-test contract.
- [x] Add render-budget-aware frame construction that does not mutate semantic graph state.
- [x] Extend runtime diagnostics with graph/visible/culled counts, diff failures, and timing metrics for layout/render/spatial operations.
- [x] Add explicit multi-view coordinator support for synchronized viewports over shared graph data.
- [x] Add minimap/overview runtime helpers as coordinated secondary views over shared graph/layout state.
- [x] Expand tests to cover hidden focused targets, reveal behavior, budgeted rendering, spatial-index compatibility, and multi-view/minimap synchronization.

## Exit Criteria

- large-graph visibility semantics are specified and indexed ✅
- complete graph vs visible/rendered graph boundaries are explicit ✅
- viewport navigation includes semantic reveal/focus workflows ✅
- spatial indexing remains contract-backed and scalable-ready ✅
- render-frame building supports viewport culling plus budgets without semantic data loss ✅
- minimap/overview and multi-view coordination use shared graph state ✅
- runtime diagnostics expose large-graph bottlenecks through aggregate metrics ✅

---

# Milestone 8 — Workspace Sample Launch and Sample Index

## Goal

Make all sample applications runnable together in workspace/dev-container environments with deterministic ports and a registry-driven sample index.

## Implementation Slices

- [x] Add deterministic sample port registry in `samples/SAMPLES.json` (5100-5199 range).
- [x] Assign fixed launch profiles for all sample apps and bind to `0.0.0.0`.
- [x] Add `samples/SampleIndex` static app that renders registry entries and computes links from current browser origin.
- [x] Add `tooling/scripts/validate-samples-registry.sh` for duplicate/missing/out-of-range validation.
- [x] Add `tooling/scripts/run-samples-all.sh` to validate, build, and launch all samples concurrently with cleanup on exit.
- [x] Add `.devcontainer/samples/devcontainer.json` for sample-focused startup and port forwarding.
- [x] Add sample workspace launch specs and update docs/indexes for durable authority routing.

## Exit Criteria

- every sample has deterministic fixed port assignment ✅
- registry is authoritative for sample metadata + ports ✅
- sample index links adapt to current host/origin + sample ports ✅
- all samples launch concurrently from one supported command ✅
- sample-focused dev-container launches and forwards sample ports ✅

---

# Potential Extensions

The following extensions align with the project's goals and architectural direction.

These are intentionally separated from the core milestones.

---

# Extension — Advanced Semantic Overlays

## Goals

Expand baseline semantic overlays with richer domain-specific visualization.

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
