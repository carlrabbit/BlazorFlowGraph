# BlazorFlowGraph

BlazorFlowGraph is a semantic dataflow graph visualization package for Blazor consumers.

It is intended for developers building .NET/Blazor applications that need deterministic graph snapshots, diffs, and browser rendering.

## Install

```bash
dotnet add package BlazorFlowGraph.Blazor
```

## Quick Start

```razor
@using BlazorFlowGraph.Blazor

<DataflowGraph Snapshot="@snapshot" Width="1200" Height="800" />
```

```html
<script src="_content/BlazorFlowGraph.Blazor/js/dataflow-visualizer.js"></script>
```

## Package Split and Public Contracts

Package IDs:

- `BlazorFlowGraph.Blazor`
- `BlazorFlowGraph.Protocol`
- `BlazorFlowGraph.Semantics`
- `BlazorFlowGraph.Projection`
- `BlazorFlowGraph.Diffing`

Public contract references:

- [`docs/specs/graph-snapshots.md`](docs/specs/graph-snapshots.md)
- [`docs/specs/graph-diffs.md`](docs/specs/graph-diffs.md)
- [`docs/specs/browser-runtime-reconciliation.md`](docs/specs/browser-runtime-reconciliation.md)
- [`docs/specs/package-and-release-contract.md`](docs/specs/package-and-release-contract.md)

## Samples

- [`samples.md`](samples.md)
- [`public-docs/samples.md`](public-docs/samples.md)
- [`public-docs/samples/index.md`](public-docs/samples/index.md)

## Public Documentation

- [`docs/PUBLIC-DOCS.md`](docs/PUBLIC-DOCS.md)
- [`public-docs/getting-started.md`](public-docs/getting-started.md)
- [`public-docs/installation.md`](public-docs/installation.md)
- [`public-docs/concepts.md`](public-docs/concepts.md)
- [`public-docs/packages.md`](public-docs/packages.md)
- [`public-docs/diagnostics.md`](public-docs/diagnostics.md)
- [`public-docs/versioning.md`](public-docs/versioning.md)
- [`public-docs/release-notes.md`](public-docs/release-notes.md)
- [`public-docs/nuget/package-readme.md`](public-docs/nuget/package-readme.md)

## Contributor Documentation

- [`docs/TERMINOLOGY.md`](docs/TERMINOLOGY.md)
- [`docs/GUARDRAILS.md`](docs/GUARDRAILS.md)
- [`docs/TBPS.md`](docs/TBPS.md)
- [`docs/SPECS.md`](docs/SPECS.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/DECISIONS.md`](docs/DECISIONS.md)
- [`docs/WORKFLOWS.md`](docs/WORKFLOWS.md)
- [`docs/ENGINEERING.md`](docs/ENGINEERING.md)

## Canonical Engineering Commands

```bash
./eng/restore.sh
./eng/build.sh
./eng/test.sh
./eng/format.sh
./eng/check.sh
./eng/public-docs.sh
./eng/release-check.sh 0.0.0-local
```

## License

This project is licensed under the Unlicense. See [`LICENSE`](LICENSE).
