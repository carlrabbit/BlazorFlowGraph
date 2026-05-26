# Engineering

This document is the index for the concrete engineering substrate and stack profiles used in BlazorFlowGraph.

## Quick Reference

```sh
./eng/restore.sh            # Restore .NET and frontend tooling
./eng/build.sh              # Build the repository (no restore)
./eng/test.sh               # Run default (fast) tests
./eng/format.sh             # Format .NET and frontend files
./eng/check.sh              # Canonical completion gate
./eng/benchmark.sh          # Run benchmarks (expensive, non-default)
./eng/samples.sh            # Start all sample apps
./eng/package.sh <version>  # Pack NuGet packages
./eng/package-smoke.sh <version> # Validate local package consumption
./eng/public-api.sh         # Validate public API baseline
./eng/public-docs.sh        # Validate required public docs surface
./eng/release-check.sh <version> # Non-publishing release-readiness gate
./eng/publish.sh            # Publish NuGet packages (requires NUGET_API_KEY)
```

## Documents

- [`docs/engineering/command-contract.md`](engineering/command-contract.md) — canonical commands, accepted arguments, and expected behavior
- [`docs/engineering/typescript-tools.md`](engineering/typescript-tools.md) — TypeScript and JavaScript tooling stack
- [`docs/engineering/tools.md`](engineering/tools.md) — repository tooling scripts and utilities
- [`docs/engineering/packaging.md`](engineering/packaging.md) — package build and package-smoke validation paths
- [`docs/engineering/samples.md`](engineering/samples.md) — sample command routing used by release readiness
- [`docs/engineering/public-documentation.md`](engineering/public-documentation.md) — public documentation validation and synchronization
- [`docs/engineering/release-readiness.md`](engineering/release-readiness.md) — release-check sequencing and scope

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

Guardrail constraints are defined in [`docs/GUARDRAILS.md`](GUARDRAILS.md), [`docs/guardrails/implementation.md`](guardrails/implementation.md), and [`docs/guardrails/testing.md`](guardrails/testing.md).

## Public Documentation

Public documentation authority and source contracts are defined in [`docs/PUBLIC-DOCS.md`](PUBLIC-DOCS.md) and `public-docs/`.

See [`docs/engineering/command-contract.md`](engineering/command-contract.md) for full details.

## Authority

This document is authoritative for the engineering index, the stack profile, and for routing to engineering documents under `docs/engineering/`.

## Document Contract

Update this document when engineering documents are added, renamed, or retired, or when the stack profile or command inventory changes. Keep it synchronized with [`GUARDRAILS.md`](GUARDRAILS.md), [`PUBLIC-DOCS.md`](PUBLIC-DOCS.md), [`../AGENTS.md`](../AGENTS.md), [`../.github/copilot-instructions.md`](../.github/copilot-instructions.md), and [`engineering/command-contract.md`](engineering/command-contract.md).
