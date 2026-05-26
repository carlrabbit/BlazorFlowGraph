# Installation

Install the Blazor host package:

```bash
dotnet add package BlazorFlowGraph.Blazor
```

Render the component in a Razor page:

```razor
@using BlazorFlowGraph.Blazor

<DataflowGraph Snapshot="@snapshot" Width="1200" Height="800" />
```

Load static web assets:

```html
<script src="_content/BlazorFlowGraph.Blazor/js/dataflow-visualizer.js"></script>
```
