# Command Contract

The `eng/` folder is the canonical engineering entry point for humans, CI, and AI agents.

## Public API

Top-level scripts are the public API:

```text
./eng/restore.sh   — restore .NET packages and frontend dependencies
./eng/build.sh     — build all projects (no restore)
./eng/test.sh      — run all unit and integration tests (no build)
./eng/format.sh    — format all source code
./eng/check.sh     — full check: restore → build → test → format verify
./eng/benchmark.sh — run BenchmarkDotNet benchmarks
```

## Script Layering

```text
eng/
  common.sh         shared helpers (require_command, etc.)
  restore.sh        canonical entry point
  build.sh          canonical entry point
  test.sh           canonical entry point
  check.sh          canonical entry point
  format.sh         canonical entry point
  benchmark.sh      canonical entry point

  ci/
    *.sh            CI-only helpers

  local/
    *.sh            optional local developer utilities

  templates/
    *               reusable generation templates
```

## .NET Test Execution

This repository uses TUnit with Microsoft Testing Platform (MTP). Test projects are
executed with `dotnet run --no-build --configuration Release --project <path>` rather
than `dotnet test`, because MTP test runners are entry-point executables.

`eng/test.sh` enumerates and runs each test project in `tests/DotNet/`.

## TypeScript Tooling

Frontend dependencies use pnpm (current package manager). `eng/restore.sh` detects and runs
`pnpm install --frozen-lockfile` when `package.json` is present. When pnpm is unavailable,
the script falls back to bun if installed. If neither is available, the frontend install step
is skipped — .NET restore still succeeds for .NET-only CI jobs.

If the repository migrates to bun, update `eng/restore.sh` to remove the pnpm/bun detection
logic and use `bun install --frozen-lockfile` directly. `eng/format.sh` and `eng/check.sh`
invoke Biome when `biome.json` is present.

## CI Integration

CI workflows call `eng/` scripts:

```yaml
- run: ./eng/check.sh
```

Do not embed `dotnet restore`, `dotnet build`, or `dotnet test` directly in workflow steps.

## Rules

- Top-level scripts are short, compose lower-level helpers, and fail fast.
- Scripts use POSIX shell where practical.
- Scripts avoid machine-local assumptions and work in Linux containers and GitHub Actions.
- Agents must run `./eng/check.sh` before declaring implementation work complete.
