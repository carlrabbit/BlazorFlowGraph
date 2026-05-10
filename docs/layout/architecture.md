# Layout Architecture

The layout package provides the pluggable layout boundary for the browser runtime.

## Current Implementation

- `LayoutGraph` is the layout-specific input model built from `GraphSnapshot`
- `LayoutProvider` is the async interface implemented by layout engines
- `GridLayoutProvider` is the current default/reference implementation
- `computeLayout(...)` remains the simple built-in grid helper used by the reference provider

```typescript
const graph = buildLayoutGraph(snapshot);
const provider = new GridLayoutProvider();
const layout = await provider.computeLayout(graph);
```

## Planned Direction

ELK remains the planned production layout engine, but it should plug into the existing `LayoutProvider` interface rather than changing the rendering pipeline or runtime ownership boundaries.

## ELK Integration Sketch

```typescript
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();
const layout = await elk.layout(elkGraph);
```

## Layout Options

- `algorithm`: ELK algorithm identifier (e.g. `layered`, `force`, `mrtree`)
- `nodeWidth` / `nodeHeight`: Default node dimensions
- `spacing`: Padding between nodes
