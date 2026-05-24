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
- [`docs/engineering/tools.md`](engineering/tools.md) — repository tooling scripts and utilities

## Stack

| Layer | Technology |
|---|---|
| .NET runtime | .NET 10 |
| Test framework | TUnit (Microsoft Testing Platform) |
| TS/JS bundler | Bun (bun build) |
| TS/JS test runner | Bun (bun test) |
| TS/JS linter+formatter | Biome |
| .NET formatter | dotnet format |
| CI | GitHub Actions |

## Guardrails

Guardrail constraints are defined in [`docs/GUARDRAILS.md`](GUARDRAILS.md) and [`docs/guardrails/engineering-guardrails.md`](guardrails/engineering-guardrails.md).

See [`docs/engineering/command-contract.md`](engineering/command-contract.md) for full details.

## Authority

This document is authoritative for the engineering index, the stack profile, and for routing to engineering documents under `docs/engineering/`.

## Document Contract

Update this document when engineering documents are added, renamed, or retired, or when the stack profile changes. Keep it synchronized with [`GUARDRAILS.md`](GUARDRAILS.md), [`../AGENTS.md`](../AGENTS.md), [`../copilot-instructions.md`](../copilot-instructions.md), and [`engineering/command-contract.md`](engineering/command-contract.md).
