# BlazorFlowGraph

BlazorFlowGraph is a dataflow visualization framework for .NET and Blazor applications using the interactive server render mode.

The project focuses on visualizing evolving semantic systems and data flows rather than building a generic diagram editor.

The current architecture combines:

- a .NET semantic backend
- a TypeScript browser runtime
- incremental graph synchronization
- automatic layout infrastructure
- browser-side interaction and rendering

## Goals

BlazorFlowGraph is designed for scenarios such as:

- dataflow visualization
- workflow topology exploration
- event pipeline inspection
- distributed system dependency graphs
- ETL and process visualization
- runtime architecture maps
- semantic graph exploration

The project prioritizes:

- incremental updates
- automatic layouts
- stable viewport and selection persistence
- scalable graph rendering
- semantic overlays
- server-authoritative graph models

## Architecture Overview

```text
+---------------------------------------------------+
| .NET Semantic Backend                             |
|---------------------------------------------------|
| Domain Model                                      |
| Semantic Extraction                               |
| Projection Generation                             |
| Diff Computation                                  |
| Validation                                        |
+------------------------+--------------------------+
                         |
                    Graph Projection
                         |
                    Incremental Diffs
                         |
+------------------------v--------------------------+
| TypeScript Visualization Runtime                  |
|---------------------------------------------------|
| Rendering                                         |
| Layout                                            |
| Reconciliation                                    |
| Viewport Management                               |
| Selection/Search/Grouping                         |
| Interaction Runtime                               |
+---------------------------------------------------+
```

At the repository level, this is currently implemented as:

- `.NET`: `Diagram.Protocol`, `Diagram.Semantics`, `Diagram.Projection`, `Diagram.Diffing`, `Diagram.Blazor`, and `Diagram.Blazor.Server`
- `TypeScript`: `@dataflow-visualizer/protocol`, `@dataflow-visualizer/runtime`, `@dataflow-visualizer/renderer-svg`, `@dataflow-visualizer/layout`, `@dataflow-visualizer/interop`, and `@dataflow-visualizer/host`

For a more detailed breakdown, see [`docs/architecture/overview.md`](docs/architecture/overview.md).

## Design Principles

### Semantic-First

The visualization is a projection of an authoritative semantic model.

The diagram is not the source of truth.

### Incremental Synchronization

Graphs are updated using diffs rather than full rerenders whenever possible.

This enables:

- stable interaction state
- animation continuity
- layout preservation
- scalable updates

### Browser-Native Interaction

Rendering and interaction are browser-side responsibilities.

The browser runtime handles:

- rendering
- selection
- viewport state
- grouping
- filtering
- layout execution
- reconciliation

The .NET side handles:

- semantic graph generation
- diff computation
- validation
- orchestration

### Automatic Layouts

BlazorFlowGraph is optimized for automatically arranged graphs.

The system is intended for topology comprehension rather than manual diagram authoring.

The repository already includes a layout package and automatic layout pipeline. The current implementation is a simple placeholder grid layout, with ELK-based layout documented as the planned production direction.

## Current Features and Planned Direction

### Core Visualization

- SVG rendering pipeline
- incremental graph reconciliation
- Blazor component integration
- viewport sizing and container management
- semantic graph snapshots and diffs

### Layout

- automatic layout package
- placeholder grid layout implementation
- layout abstraction for future strategy upgrades
- ELK integration planned and documented

### Interaction

- browser-side runtime orchestration
- Blazor-to-JavaScript interop bridge
- foundations for selection, viewport, and graph updates

### Integration

- Blazor Server interactive hosting
- .NET 10 targeting
- Razor Class Library packaging
- TypeScript package workspace

## Non-Goals

At least initially, the project does not aim to become:

- a BPMN editor
- a Visio replacement
- a whiteboard or canvas editor
- a freeform diagram designer
- a collaborative editor
- a generic workflow designer

## Repository Structure

```text
src/
  DotNet/
    Diagram.Blazor/
    Diagram.Blazor.Server/
    Diagram.Diffing/
    Diagram.Projection/
    Diagram.Protocol/
    Diagram.Semantics/
  TypeScript/
    packages/
      host/
      interop/
      layout/
      protocol/
      renderer-svg/
      runtime/

samples/
  IncrementalUpdates/
  LargeGraphStress/
  LayoutPlayground/
  MinimalViewer/
  SemanticAnnotations/

tests/
  DotNet/
  E2E/
  TypeScript/

docs/
tooling/
```

## Technology Stack

### .NET

- .NET 10
- Blazor Server interactive components
- Razor Class Libraries

### TypeScript

- TypeScript
- Vite
- pnpm
- Vitest
- Playwright

### Layout

- current placeholder grid layout
- ELK.js integration planned

## Current Status

Early architecture and prototyping phase.

Current milestones in the repository include:

1. semantic projection model
2. static graph rendering
3. incremental diff synchronization
4. Blazor integration and JavaScript interop
5. layout abstraction with a placeholder automatic layout

For the planned milestone progression and long-term capability roadmap, see [`Milestones.md`](Milestones.md).

## Quick Start

### Minimal Blazor Integration

Register services:

```csharp
builder.Services.AddDataflowVisualizer();
```

Render a graph:

```razor
@using Diagram.Blazor

<DataflowGraph Snapshot="@snapshot" Width="1200" Height="800" />
```

Bootstrap the browser host:

```html
<script src="_content/Diagram.Blazor/js/dataflow-visualizer.js"></script>
```

See [`docs/integration/guide.md`](docs/integration/guide.md) for more detail.

## Development

For a zero-install development environment, see [`Codespace.md`](Codespace.md) for GitHub Codespace setup instructions.

### Prerequisites

- .NET 10 SDK
- Node.js LTS
- Corepack enabled for pnpm

### Restore Dependencies

```bash
corepack enable
pnpm install --frozen-lockfile
dotnet restore BlazorFlowGraph.slnx
```

### Build

```bash
dotnet build BlazorFlowGraph.slnx --configuration Release
pnpm build
```

### Test

TypeScript:

```bash
pnpm test
```

.NET test projects use Microsoft Testing Platform and are run as executables:

```bash
dotnet run --no-build --project tests/DotNet/Diagram.Protocol.Tests --configuration Release
dotnet run --no-build --project tests/DotNet/Diagram.Diffing.Tests --configuration Release
dotnet run --no-build --project tests/DotNet/Diagram.Projection.Tests --configuration Release
dotnet run --no-build --project tests/DotNet/Diagram.Semantics.Tests --configuration Release
```

### NuGet Packaging

NuGet packaging and publishing guidance is documented in [`Nuget.md`](Nuget.md).

## Vision

BlazorFlowGraph aims to provide a robust semantic visualization platform for modern .NET applications where graph structures evolve dynamically and must remain comprehensible at scale.

The project intentionally separates:

- semantic modeling
- graph projection
- rendering
- interaction
- layout

to enable long-term extensibility and maintainability.

## License

This project is licensed under the Unlicense. See `LICENSE`.
