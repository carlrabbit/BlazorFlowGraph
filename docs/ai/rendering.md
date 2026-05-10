# AI Rendering Reference

## Scope

This document captures the rendering responsibilities and constraints that AI-assisted changes should follow.

## Current State

Rendering is SVG-first and browser-side.

The main rendering path is:

1. .NET produces graph snapshots or diffs
2. the browser runtime reconciles graph state into `GraphRuntimeStore`
3. `buildVisibleGraph` projects runtime state into a `VisibleGraph` (filtered subset)
4. `buildRenderFrame` converts `VisibleGraph` + `LayoutResult` into a `RenderFrame`
5. a `GraphRendererBackend` receives the `RenderFrame` and performs the actual rendering
6. the host inserts the rendered result into the DOM

## Render Pipeline (Milestone 3 / Milestone 4)

The rendering pipeline is formally separated into stages:

```
runtime state
    → buildVisibleGraph   (view projection / visibility filtering)
    → buildRenderFrame    (frame construction from VisibleGraph + LayoutResult)
    → GraphRendererBackend.renderFrame   (backend-specific rendering)
```

The separation ensures:
- backends remain replaceable (SVG → Canvas → WebGL) without touching the pipeline
- visibility filtering and frame construction are independently testable
- the renderer never sees raw runtime state

## Rendering Layers

The SVG renderer supports explicit layer ordering via `RenderLayer`:

```
"groups" → "edges" → "nodes" → "labels" → "selection" → "overlays"
```

Use `renderLayer(layer, state, layout, options)` to render a specific layer.

As of Milestone 4:
- `"groups"` — renders group hull containers as dashed rectangles with padded bounding boxes; uses style tokens resolved from group `kind`
- `"edges"` — renders directed edge lines with arrowheads and optional labels
- `"nodes"` — renders node rectangles with kind-specific style tokens and ARIA labels
- `"overlays"` — handled via `buildRenderFrame + buildFrameMarkup` in the backend; not supported in the stateless `renderLayer` path
- `"labels"`, `"selection"` — floating labels are embedded in node/edge elements; selection rings are a browser-side interaction concern

## GraphRendererBackend

The `GraphRendererBackend` interface abstracts the rendering surface:

```typescript
interface GraphRendererBackend {
  initialize(container, width, height): void;
  renderFrame(frame: RenderFrame): void;
  updateViewport(panX, panY, scale): void;
  resize(width, height): void;
  dispose(): void;
}
```

`SvgRendererBackend` is the current implementation. Alternative backends implement this interface without touching the render pipeline or runtime.

As of Milestone 4, `SvgRendererBackend` accepts an optional `styleTokens` registry:

```typescript
const backend = new SvgRendererBackend({ styleTokens: myTokens });
```

## Style Tokens (Milestone 4)

Style tokens map node/group `kind` to visual appearance:

```typescript
interface StyleToken {
  fill: string;        // background fill
  stroke: string;      // border stroke
  strokeWidth: number; // border width
  textColor: string;   // label text colour
  rx: number;          // corner radius
}
```

`defaultStyleTokens` covers: `default`, `service`, `datastore`, `gateway`, `queue`, `group`.

Use `resolveStyleToken(kind, tokens?)` to look up a token with automatic fallback to `default`.

## Accessibility (Milestone 4)

SVG elements now carry ARIA roles:
- SVG root: `role="graphics-document"`, `aria-label="Dataflow graph"`
- Node `<g>` elements: `role="graphics-symbol"`, `aria-label="{node.label}"`
- Group hull `<g>` elements: `role="graphics-object"`, `aria-label="{group.label} group"`
- Edge `<g>` elements: `role="graphics-symbol"`, `aria-label="{edge label or 'edge'}"`

## RenderFrame

`RenderFrame` is the explicit rendering representation produced by the view projection pipeline:

```typescript
interface RenderFrame {
  nodes: readonly RenderNode[];     // positioned nodes (id, label, kind, x, y, width, height)
  edges: readonly RenderEdge[];     // positioned edges (id, label?, sections)
  groups: readonly RenderGroup[];   // group hulls (Milestone 4)
  overlays: readonly RenderOverlay[]; // overlay badges (Milestone 4)
  canvasWidth: number;
  canvasHeight: number;
}
```

Backends receive `RenderFrame`, not raw runtime state. This is the stable surface for backend implementors.

`buildRenderFrame(state, layout, options?)` options as of Milestone 4:
- `visible?: VisibleGraph` — filter nodes/edges/groups to visible subset
- `viewport?: ViewportContext` — apply viewport-space culling (exclude off-screen elements)
- `nodeOverlays?: ReadonlyMap<string, NodeOverlay>` — overlay badges to include in the frame
- `styleTokens?: Record<string, StyleToken>` — custom style registry (passed through to `SvgRendererBackend`)

## Viewport Culling (Milestone 4)

Pass a `ViewportContext` to `buildRenderFrame` to cull elements outside the visible bounds:

```typescript
const viewport = createViewportContext(panX, panY, scale, screenWidth, screenHeight);
const frame = buildRenderFrame(state, layout, { viewport });
```

Elements whose bounding box does not intersect `viewport.visibleBounds` are excluded from the frame, reducing DOM work for large graphs.

## VisibleGraph

`VisibleGraph` is the filtered view of the runtime graph:

```typescript
interface VisibleGraph {
  visibleNodeIds: ReadonlySet<NodeId>;
  visibleEdgeIds: ReadonlySet<string>;
  visibleGroupIds: ReadonlySet<GroupId>;
}
```

Build it with `buildVisibleGraph(data, policy?)` using a `VisibilityPolicy` that expresses:
- search filter (matched node IDs)
- focus filter (focused node and immediate neighbors)
- collapsed group filter (children of collapsed groups are hidden)

## Rendering Responsibilities

The browser runtime is responsible for:

- rendering updates
- viewport-aware behavior
- selection and interaction visuals
- animation continuity
- minimizing DOM churn

Blazor should not become a rendering engine.

## Rendering Constraints

- Prefer incremental updates over full rerenders.
- Keep renderer logic separate from semantic projection logic.
- Preserve stable IDs so the renderer and runtime can reconcile consistently.
- Avoid high-frequency interaction round-trips through SignalR.
- Favor composable SVG rendering primitives over deep UI trees.
- Never pass raw runtime state to a renderer backend — always go through `buildRenderFrame`.
- New rendering backends must implement `GraphRendererBackend`.

## Layout Relationship

Automatic layout is a core feature of the visualization experience.

The `LayoutProvider` interface (in `@dataflow-visualizer/layout`) is the extension point for layout engines.
The `GridLayoutProvider` is the default (reference) implementation.
The `ElkLayoutProvider` (Milestone 4) is the production engine backed by elkjs, implementing the same interface.

The `LayoutGraph` model is purpose-built for layout — distinct from both the runtime graph and the semantic graph.

## Performance Priorities

Prioritize:

- incremental rendering
- stable layout updates
- viewport preservation
- efficient reconciliation
- `VisibleGraph` filtering to reduce rendered element count

Avoid:

- full graph redraws for small changes
- unnecessary allocations
- large Blazor render trees
- browser/server chatter for pointer-frequency events
- passing unfiltered runtime state to backends

## Related Docs

- `docs/rendering/model.md`
- `docs/layout/architecture.md`
- `docs/decisions/0001-svg-first.md`
- `docs/decisions/0002-elk-layout.md`
- `docs/decisions/0004-renderer-backend.md`
- `docs/ai/architecture.md`
