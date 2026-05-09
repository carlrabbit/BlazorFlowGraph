# Integration Guide

## Registering Services

```csharp
builder.Services.AddDataflowVisualizer();
```

## Using the Blazor Component

```razor
@using Diagram.Blazor

<DataflowGraph Snapshot="@snapshot" Width="1200" Height="800" />
```

## JavaScript Bootstrap

In your Blazor app, include the host bundle and call `registerGlobals()`:

```html
<script type="module">
  import { registerGlobals } from '/js/dataflow-visualizer-host.js';
  registerGlobals();
</script>
```

## Sending Updates from .NET

```csharp
// Full snapshot (initial load)
await JSRuntime.InvokeVoidAsync("DataflowVisualizer.receiveSnapshot", snapshot);

// Incremental diff
await JSRuntime.InvokeVoidAsync("DataflowVisualizer.receiveDiff", diff);
```
