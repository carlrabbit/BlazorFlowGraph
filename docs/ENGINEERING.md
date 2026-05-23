# Engineering

This document is the index for engineering substrate documentation in this repository.

## Command Contract

The canonical engineering entry point for humans, CI, and AI agents is the `eng/` folder.

| Command | Purpose |
|---|---|
| `./eng/restore.sh` | Restore .NET packages and frontend dependencies |
| `./eng/build.sh` | Build all projects |
| `./eng/test.sh` | Run unit and integration tests |
| `./eng/format.sh` | Format source code |
| `./eng/check.sh` | Full check: restore, build, test, format verification |
| `./eng/benchmark.sh` | Run BenchmarkDotNet benchmarks |

Agents and CI must use these scripts. Do not embed repository commands directly in workflows or instructions.

## Engineering Documentation

- [`engineering/command-contract.md`](engineering/command-contract.md) — canonical command contract details
- [`engineering/building-blocks.md`](engineering/building-blocks.md) — building block registry
- [`engineering/dotnet.md`](engineering/dotnet.md) — .NET tooling conventions
- [`engineering/tools.md`](engineering/tools.md) — repository-local tooling

## Reference

Engineering Guide V3: [`research/engineering-guide-v3.md`](research/engineering-guide-v3.md)
