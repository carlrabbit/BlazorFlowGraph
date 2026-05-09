# Rendering Model

The SVG renderer (`@dataflow-visualizer/renderer-svg`) converts a `GraphState` into an SVG string.

## Render Pipeline

1. Receive `GraphState` from runtime
2. Convert to `GraphSnapshot` for layout computation
3. Pass through layout engine (`@dataflow-visualizer/layout`)
4. Render nodes and edges as SVG elements
5. Insert into DOM container

## SVG Structure

```xml
<svg>
  <g transform="translate(x,y)">  <!-- node group -->
    <rect .../>                     <!-- node background -->
    <text .../>                     <!-- node label -->
  </g>
  <!-- edge paths would go here -->
</svg>
```
