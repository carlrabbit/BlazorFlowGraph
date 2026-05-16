# BlazorFlowGraph

BlazorFlowGraph is a semantic dataflow visualization framework for .NET and Blazor applications.

The repository focuses on semantic graph projection, incremental synchronization, automatic layout, and browser-side rendering rather than generic diagram editing.

## Documentation Map

Start here:

- [`docs/TERMINOLOGY.md`](docs/TERMINOLOGY.md) — canonical project vocabulary
- [`docs/SPECS.md`](docs/SPECS.md) — behavioral authority, invariants, contracts, and validation expectations
- [`docs/architecture/system-overview.md`](docs/architecture/system-overview.md) — runtime boundaries and subsystem responsibilities
- [`docs/WORKFLOWS.md`](docs/WORKFLOWS.md) — workflow intent index
- [`docs/TBPS.md`](docs/TBPS.md) — reusable task best practices
- [`docs/agent-context/project-context.md`](docs/agent-context/project-context.md) — concise repository context
- [`docs/milestones/README.md`](docs/milestones/README.md) — milestone document structure
- [`docs/decisions/`](docs/decisions) — accepted architectural decisions
- [`Milestones.md`](Milestones.md) — capability roadmap and milestone progression

Specialized references:

- [`docs/integration/guide.md`](docs/integration/guide.md) — consumer integration guidance
- [`docs/protocol/contracts.md`](docs/protocol/contracts.md) — shared graph contract reference
- [`docs/layout/architecture.md`](docs/layout/architecture.md) — layout engine reference
- [`docs/rendering/model.md`](docs/rendering/model.md) — render pipeline reference
- [`docs/research/README.md`](docs/research/README.md) — exploratory research document location
- [`docs/ai/`](docs/ai) — AI-facing architecture, protocol, and rendering references
- [`samples.md`](samples.md) — sample catalog with run commands and screenshots

`docs/agent-context/` and `docs/ai/` are routing and context aids. Durable terminology, behavior, structure, rationale, workflow intent, and process guidance live in terminology, specs, architecture, decisions, workflows, and TBPs.

## Repository Structure

```text
src/
  DotNet/
  TypeScript/
samples/
tests/
docs/
.github/
tooling/
```

## Architecture at a Glance

- `.NET` owns semantic models, projection generation, diff generation, validation, and orchestration.
- `TypeScript` owns rendering, layout execution, reconciliation, viewport state, and interaction state.
- `Blazor` stays thin and acts as the hosting and integration layer.

Authoritative architecture details live in [`docs/architecture/system-overview.md`](docs/architecture/system-overview.md).

## Quick Start

### Register services

```csharp
builder.Services.AddDataflowVisualizer();
```

### Render a graph

```razor
@using BlazorFlowGraph.Blazor

<DataflowGraph Snapshot="@snapshot" Width="1200" Height="800" />
```

### Load the browser bundle

```html
<script src="_content/BlazorFlowGraph.Blazor/js/dataflow-visualizer.js"></script>
```

## Development

### Prerequisites

- .NET 10 SDK
- Node.js LTS
- Corepack enabled for pnpm

### Restore

```bash
corepack enable
pnpm install --frozen-lockfile
dotnet restore BlazorFlowGraph.slnx
```

### Build

```bash
pnpm build
dotnet build BlazorFlowGraph.slnx --no-restore --configuration Release
```

### TypeScript checks

```bash
pnpm typecheck
pnpm test
```

### .NET tests

```bash
dotnet run --no-build --project tests/DotNet/BlazorFlowGraph.Protocol.Tests --configuration Release
dotnet run --no-build --project tests/DotNet/BlazorFlowGraph.Diffing.Tests --configuration Release
dotnet run --no-build --project tests/DotNet/BlazorFlowGraph.Projection.Tests --configuration Release
dotnet run --no-build --project tests/DotNet/BlazorFlowGraph.Semantics.Tests --configuration Release
```

### Additional guidance

- [`Codespace.md`](Codespace.md) — zero-install Codespaces setup
- [`Nuget.md`](Nuget.md) — NuGet packaging and release guidance
- [`tooling/README.md`](tooling/README.md) — repository tooling notes

## Current Status

The repository is in an early platform-building phase with milestones covering semantic projection, incremental synchronization, layout infrastructure, renderer abstraction, and sample-driven validation.

See [`Milestones.md`](Milestones.md) for the roadmap.

## License

This project is licensed under the Unlicense. See [`LICENSE`](LICENSE).
