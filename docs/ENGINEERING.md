# Engineering

This document is the index for the concrete engineering substrate and stack profiles used in BlazorFlowGraph.

## Quick Reference

```sh
./eng/restore.sh    # Restore .NET and frontend tooling
./eng/build.sh      # Build the repository (no restore)
./eng/test.sh       # Run default (fast) tests
./eng/format.sh     # Format .NET and frontend files
./eng/check.sh      # Canonical completion gate
./eng/benchmark.sh  # Run benchmarks (expensive, non-default)
./eng/samples.sh    # Start all sample apps
./eng/package.sh    # Pack NuGet packages (requires RELEASE_VERSION)
./eng/publish.sh    # Publish NuGet packages (requires NUGET_API_KEY)
```

## Documents

- [`docs/engineering/command-contract.md`](engineering/command-contract.md) — canonical commands, accepted arguments, and expected behavior
- [`docs/engineering/typescript-tools.md`](engineering/typescript-tools.md) — TypeScript and JavaScript tooling stack

## Stack

| Layer | Technology |
|---|---|
| .NET runtime | .NET 10 |
| Test framework | TUnit (Microsoft Testing Platform) |
| TS/JS runtime | Bun |
| TS/JS linter+formatter | Biome |
| .NET formatter | dotnet format |
| CI | GitHub Actions |

## Guardrails

- Agents must run `./eng/check.sh` before declaring work complete.
- `eng/check.sh` is the canonical gate: restore, build, test, format verify, Biome check.
- Benchmarks, packaging, and publishing are never part of `eng/check.sh`.
- Do not add pnpm, npm, ESLint, or Prettier. Use Bun and Biome.
- Test categories: fast unit tests run by default; slow/e2e/benchmark excluded from `eng/test.sh`.

See [`docs/engineering/command-contract.md`](engineering/command-contract.md) for full details.
