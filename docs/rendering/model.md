# Rendering Model

Rendering is browser-side and SVG-first.

## Render Pipeline

1. Reconcile `GraphSnapshot` / `GraphDiff` into `GraphRuntimeStore`
2. Build a filtered `VisibleGraph` view from runtime state
3. Compute positions through the layout layer (`GridLayoutProvider` today, `LayoutProvider` abstraction for future engines)
4. Build a `RenderFrame` from runtime state + layout result
5. Render the frame through `SvgRendererBackend` (or another `GraphRendererBackend` implementation)
6. Update the DOM/SVG container

## RenderFrame

`RenderFrame` is the stable rendering contract produced by the projection pipeline:

- positioned `RenderNode[]`
- positioned `RenderEdge[]`
- `canvasWidth`
- `canvasHeight`

Backends receive `RenderFrame`, not raw runtime state.

## Rendering Layers

The SVG renderer exposes ordered render layers:

```text
groups → edges → nodes → labels → selection → overlays
```

`groups` and `overlays` currently exist as extension points; the main SVG backend already renders nodes, labels, and edges from `RenderFrame`.

## SVG Structure

```xml
<svg>
  <g class="dfv-viewport" transform="translate(x,y) scale(s)">
    <g class="dfv-edge">...</g>
    <g class="dfv-node" data-node-id="...">
      <rect .../>
      <text .../>
    </g>
  </g>
</svg>
```
