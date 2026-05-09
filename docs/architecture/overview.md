# Architecture Overview

This document provides a high-level overview of the Dataflow Visualizer architecture.

## Components

- **Diagram.Protocol** — Shared graph contracts (nodes, edges, diffs)
- **Diagram.Semantics** — Domain annotations and semantic extraction
- **Diagram.Projection** — Projects semantic models into graph snapshots
- **Diagram.Diffing** — Computes incremental diffs between snapshots
- **Diagram.Blazor** — Razor components
- **Diagram.Blazor.Server** — Server integration and DI registration

## TypeScript Runtime

- **protocol** — TypeScript DTOs mirroring the .NET contracts
- **runtime** — Graph state reconciliation engine
- **renderer-svg** — SVG rendering
- **layout** — ELK-based automatic layout
- **interop** — .NET/Blazor bridge
- **host** — Runtime bootstrap

## Data Flow

```
.NET semantic model
  → Diagram.Projection (ReflectionGraphProjector)
  → GraphSnapshot / GraphDiff
  → Blazor JS Interop
  → @dataflow-visualizer/interop (DotNetBridge)
  → @dataflow-visualizer/runtime (applySnapshot / applyDiff)
  → @dataflow-visualizer/renderer-svg (renderToSvg)
  → DOM / SVG
```
