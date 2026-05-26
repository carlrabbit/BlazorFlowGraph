# Command Contract

This document defines the canonical engineering commands for BlazorFlowGraph.

Agents and CI must use these commands instead of inventing raw `dotnet`, `bun`, or script invocations.

## Required commands

### `./eng/restore.sh`

Restores all .NET and frontend (Bun) tooling.

```sh
./eng/restore.sh
```

Runs:
- `dotnet restore BlazorFlowGraph.slnx`
- `bun install --frozen-lockfile`

### `./eng/build.sh`

Builds the repository without restoring. Requires a prior `./eng/restore.sh`.

```sh
./eng/build.sh
```

Runs:
- `dotnet build BlazorFlowGraph.slnx --no-restore --configuration Release`
- `bun run --cwd <package> build` for TypeScript packages

Optional environment variables:
- `RELEASE_VERSION` — optional release version properties for build outputs
- `RELEASE_TAG` — optional informational version tag (defaults to `RELEASE_VERSION`)
- `REFRESH_PACKAGED_BROWSER_BUNDLE=1` — refreshes `src/DotNet/BlazorFlowGraph.Blazor/wwwroot/js/dataflow-visualizer.js`

### `./eng/test.sh`

Runs fast (default) tests only. Excludes slow, e2e, benchmark, and package-smoke work.

```sh
./eng/test.sh
```

Runs:
- `dotnet run --no-build --project tests/DotNet/BlazorFlowGraph.*.Tests --configuration Release`
- `bun run --cwd <package> test` for TypeScript packages

### `./eng/format.sh`

Formats all .NET and TypeScript/JavaScript source files.

```sh
./eng/format.sh
```

### `./eng/check.sh`

Canonical completion gate. Agents must run this before declaring implementation work complete.

```sh
./eng/check.sh
```

Runs in order:
1. `./eng/restore.sh`
2. `./eng/build.sh`
3. `./eng/test.sh`
4. `dotnet format BlazorFlowGraph.slnx --verify-no-changes`
5. `bun run check` + TypeScript typechecks

### `./eng/benchmark.sh`

Runs benchmarks (non-default).

```sh
./eng/benchmark.sh
```

### `./eng/package.sh <version>`

Packs all `IsPackable` projects from `src/DotNet` into `artifacts/nuget`.

```sh
./eng/package.sh 1.0.0
```

Equivalent environment form is also supported:

```sh
RELEASE_VERSION=1.0.0 ./eng/package.sh
```

### `./eng/package-smoke.sh <version>`

Validates local package artifacts as a real consumer.

```sh
./eng/package-smoke.sh 1.0.0
```

Validation includes:
- local artifact presence checks
- clean consumer project restore/build using local package source
- public API usage compile check
- static web asset presence check for Blazor package

### `./eng/public-api.sh`

Validates intentional public API changes using explicit baseline declarations.

```sh
./eng/public-api.sh
```

Strategy (current explicit stub):
- maintain one baseline declaration file per packable package in `tests/package-smoke/public-api/*.txt`
- require an exact `PackageId: <id>` header per file
- fail when a packable project has no matching baseline declaration
- require release notes updates for intentional public API changes

### `./eng/public-docs.sh`

Validates required public documentation files and directories.

```sh
./eng/public-docs.sh
```

### `./eng/release-check.sh <version>`

Runs non-publishing release-readiness validation.

```sh
./eng/release-check.sh 0.0.0-local
```

Runs in order:
1. `./eng/check.sh`
2. `./eng/build.sh`
3. `./eng/package.sh <version>`
4. `./eng/package-smoke.sh <version>`
5. `./eng/samples.sh --dry-run`
6. `./eng/public-api.sh`
7. `./eng/public-docs.sh`

Publishing is never part of `eng/release-check.sh`.

## Optional commands

### `./eng/samples.sh`

Starts all sample apps.

```sh
./eng/samples.sh
./eng/samples.sh --dry-run
./eng/samples.sh --detach
```

### `./eng/publish.sh`

Publishes `.nupkg` files from `artifacts/nuget` to NuGet.org.

```sh
NUGET_API_KEY=... ./eng/publish.sh
```

## Validation path

Required local validation:

```sh
./eng/restore.sh
./eng/build.sh
./eng/test.sh
./eng/check.sh
```

Release-readiness validation:

```sh
./eng/release-check.sh 0.0.0-local
```
