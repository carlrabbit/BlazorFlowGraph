# Integration Guide

## Registering Services

Repository samples reference `BlazorFlowGraph.Blazor` directly and register the projector/differ services explicitly:

```csharp
builder.Services.AddSingleton<IGraphProjector, ReflectionGraphProjector>();
builder.Services.AddSingleton<IGraphDiffer, GraphDiffer>();
```

If your host references `BlazorFlowGraph.Blazor.Server`, `AddDataflowVisualizer()` wraps those registrations for you.

## Using the Blazor Component

```razor
@using BlazorFlowGraph.Blazor

<DataflowGraph Snapshot="@snapshot" Width="1200" Height="800" />
```

## JavaScript Bootstrap

Load the committed browser bundle before the component renders. The bundle auto-registers `window.DataflowVisualizer`:

```html
<script src="_content/BlazorFlowGraph.Blazor/js/dataflow-visualizer.js"></script>
```

## Sending Graph Data

`DataflowGraph` handles `DataflowVisualizer.mount(...)` on first render and sends a full snapshot whenever its `Snapshot` parameter version changes.

If you are building a custom bridge instead of using `DataflowGraph`, you can still call the global API directly:

```csharp
// Full snapshot (initial load)
await JSRuntime.InvokeVoidAsync("DataflowVisualizer.receiveSnapshot", snapshot);

// Incremental diff
await JSRuntime.InvokeVoidAsync("DataflowVisualizer.receiveDiff", diff);
```
