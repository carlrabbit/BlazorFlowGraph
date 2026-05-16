# Layout Architecture

The layout package provides the pluggable layout boundary for the browser runtime.

## Current Implementation (Milestone 4)

- `LayoutGraph` is the layout-specific input model built from `GraphSnapshot`
- `LayoutProvider` is the async interface implemented by layout engines
- `GridLayoutProvider` is the default/reference implementation (grid arrangement)
- `ElkLayoutProvider` is the production layout engine backed by [elkjs](https://github.com/kieler/elkjs)
- `computeLayout(...)` remains the simple built-in grid helper used by the host package

```typescript
// Reference implementation (fast, no dependencies)
const graph = buildLayoutGraph(snapshot);
const provider = new GridLayoutProvider();
const layout = await provider.computeLayout(graph);

// Production ELK layout (hierarchical, layered, etc.)
const elkProvider = new ElkLayoutProvider({ algorithm: "layered" });
const elkLayout = await elkProvider.computeLayout(graph);
```

## ElkLayoutProvider

`ElkLayoutProvider` implements `LayoutProvider` using ELK:

- **Algorithm**: defaults to `"layered"` (Sugiyama-style hierarchical layout); configurable via `algorithm` constructor option
- **Lazy loading**: `elkjs` is loaded via dynamic import on first call to avoid bundling overhead for consumers that only use `GridLayoutProvider`
- **Fallback**: automatically falls back to `GridLayoutProvider` if ELK initialization fails (e.g. in Node.js test environments without a WASM worker context)

```typescript
const provider = new ElkLayoutProvider({ algorithm: "mrtree" });
const layout = await provider.computeLayout(graph, { spacing: 30, nodeWidth: 140 });
```

## Layout Options

All `LayoutProvider` implementations accept `LayoutOptions`:

- `algorithm`: ELK algorithm identifier (e.g. `layered`, `force`, `mrtree`, `box`) — ElkLayoutProvider only
- `nodeWidth` / `nodeHeight`: Default node dimensions
- `spacing`: Padding between nodes

## Adding a New Layout Engine

Implement `LayoutProvider`:

```typescript
class MyLayoutProvider implements LayoutProvider {
  async computeLayout(graph: LayoutGraph, options?: LayoutOptions): Promise<LayoutResult> {
    // ... compute layout
    return { nodes, edges, width, height };
  }
}
```

The rendering pipeline and runtime remain unaffected by layout engine changes.

## Large-Graph and Multi-View Notes

- Layout output is shared semantic positioning data that may be consumed by multiple coordinated views (main viewport, minimap/overview, detail views).
- Minimap/overview views should derive reduced-detail render frames from shared layout results instead of recomputing independent semantic graph state.
- Spatial indexes for viewport culling and hit testing are derived from layout outputs and remain separate from graph truth.
