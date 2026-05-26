# BlazorFlowGraph

BlazorFlowGraph provides semantic dataflow graph rendering for Blazor applications.

## Install

```bash
dotnet add package BlazorFlowGraph.Blazor
```

## Quick start

```razor
@using BlazorFlowGraph.Blazor

<DataflowGraph Snapshot="@snapshot" Width="1200" Height="800" />
```

```html
<script src="_content/BlazorFlowGraph.Blazor/js/dataflow-visualizer.js"></script>
```

## Learn more

- `public-docs/getting-started.md`
- `public-docs/packages.md`
- `public-docs/diagnostics.md`
