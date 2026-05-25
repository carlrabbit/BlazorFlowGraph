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
- `bun run --filter '*' build` (Vite + tsc for all TypeScript packages)

Optional environment variables:
- `RELEASE_VERSION` — when set, build applies release version properties to .NET build outputs
- `RELEASE_TAG` — optional informational version tag (defaults to `RELEASE_VERSION`)

### `./eng/test.sh`

Runs fast (default) tests only. Excludes slow, e2e, and benchmark work.

```sh
./eng/test.sh
```

Runs:
- `dotnet run --no-build --project tests/DotNet/BlazorFlowGraph.*.Tests --configuration Release` for each test project
- `bun run --filter '*' test` (Vitest for all TypeScript packages)

**Test framework note:** TUnit uses Microsoft Testing Platform (MTP), which requires `dotnet run` rather than `dotnet test`. This is documented in [`docs/engineering/typescript-tools.md`](typescript-tools.md) and reflected in `eng/test.sh`.

**Test categories:**

| Category | Default run | Description |
|---|:---:|---|
| Unit | Yes | Fast, isolated. No network, database, or browser. |
| Integration | No | Uses real services or I/O. Run explicitly when needed. |
| Slow | No | Expensive unit tests. Tagged `Slow`. Excluded from default path. |
| E2E | No | Browser/system tests. Run via `eng/e2e.sh` when added. |
| Benchmark | Never | BenchmarkDotNet only. Run via `eng/benchmark.sh`. |

### `./eng/format.sh`

Formats all .NET and TypeScript/JavaScript source files.

```sh
./eng/format.sh
```

Runs:
- `dotnet format BlazorFlowGraph.slnx`
- `biome check --write .`

### `./eng/check.sh`

Canonical completion gate. Agents must run this before declaring work complete.

```sh
./eng/check.sh
```

Runs in order:
1. `./eng/restore.sh`
2. `./eng/build.sh`
3. `./eng/test.sh`
4. `dotnet format BlazorFlowGraph.slnx --verify-no-changes`
5. `bun run check` (Biome lint + format check + TypeScript typecheck)

If this command exits with code 0, the repository is in a valid state.

### `./eng/benchmark.sh`

Runs benchmarks. This command is **expensive** and **non-default**. Never run as part of normal validation.

```sh
./eng/benchmark.sh
```

No benchmark project is currently configured. Update this script when one is added under `benchmarks/`.

## Optional commands

### `./eng/samples.sh`

Starts all sample apps. Delegates to `tooling/scripts/run-samples-all.sh`.

```sh
./eng/samples.sh
./eng/samples.sh --dry-run
./eng/samples.sh --detach
```

Sample ports: `5100`–`5105`. See [`samples/SAMPLES.json`](../../samples/SAMPLES.json).

### `./eng/package.sh`

Packs all `IsPackable` projects from `src/DotNet` into `artifacts/nuget`.

```sh
RELEASE_VERSION=1.0.0.0 RELEASE_TAG=v1.0.0.0 ./eng/package.sh
```

Requires:
- `RELEASE_VERSION` — dotted numeric version string
- `RELEASE_TAG` — full tag string (defaults to `RELEASE_VERSION`)
- A prior successful `./eng/build.sh` run

Packaging is never part of `eng/check.sh`.

### `./eng/publish.sh`

Publishes all `.nupkg` files from `artifacts/nuget` to NuGet.org.

```sh
NUGET_API_KEY=... ./eng/publish.sh
```

Requires:
- `NUGET_API_KEY` — NuGet API key with push permissions
- A prior `./eng/package.sh` run that produced packages

Publishing is never part of `eng/check.sh`.

## Validation path

Minimal local validation:

```sh
./eng/restore.sh
./eng/build.sh
./eng/test.sh
./eng/check.sh
```

Do not run benchmarks, e2e tests, packaging, or publishing unless explicitly requested.
