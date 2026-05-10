# Architecture Overview

This document provides a high-level overview of the Dataflow Visualizer architecture.

## Components

- **BlazorFlowGraph.Protocol** — Shared graph contracts (nodes, edges, diffs)
- **BlazorFlowGraph.Semantics** — Domain annotations and semantic extraction
- **BlazorFlowGraph.Projection** — Projects semantic models into graph snapshots
- **BlazorFlowGraph.Diffing** — Computes incremental diffs between snapshots
- **BlazorFlowGraph.Blazor** — Razor components
- **BlazorFlowGraph.Blazor.Server** — optional server-side DI registration helpers

## TypeScript Runtime

- **protocol** — TypeScript DTOs mirroring the .NET contracts
- **runtime** — graph reconciliation, visibility projection, viewport context, diagnostics, and command handling
- **query** — topology indexing and traversal helpers
- **renderer-svg** — SVG rendering plus `RenderFrame` / backend abstractions
- **layout** — `LayoutGraph`, `LayoutProvider`, and the placeholder grid layout implementation
- **interop** — .NET/Blazor bridge
- **host** — Runtime bootstrap

## Data Flow

```
.NET semantic model
  → BlazorFlowGraph.Projection (ReflectionGraphProjector)
  → GraphSnapshot / GraphDiff
  → Blazor component / JS interop
  → @dataflow-visualizer/interop (DotNetBridge)
  → @dataflow-visualizer/runtime (GraphRuntimeStore snapshot/diff reconciliation)
  → buildVisibleGraph(...)
  → @dataflow-visualizer/layout (GridLayoutProvider today; ELK planned through LayoutProvider)
  → @dataflow-visualizer/renderer-svg (buildRenderFrame → SvgRendererBackend.renderFrame)
  → DOM / SVG
```
