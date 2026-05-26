# Packaging

## Purpose

Define canonical packaging behavior for BlazorFlowGraph NuGet artifacts.

## Canonical Command

```sh
./eng/package.sh <version>
```

The command packs all `IsPackable` .NET projects into `artifacts/nuget`.

## Validation companions

- `./eng/package-smoke.sh <version>` validates package consumption from local artifacts.
- `./eng/release-check.sh <version>` executes package and release-readiness checks together.

## Authority

This document is authoritative for packaging command usage and output location.

## Document Contract

Update this document when packaging command behavior or package output conventions change.
