# Release Readiness

## Purpose

Define the non-publishing release validation gate for BlazorFlowGraph.

## Canonical Command

```sh
./eng/release-check.sh <version>
```

## Required release-check sequence

`./eng/release-check.sh <version>` runs, in order:

1. `./eng/check.sh`
2. release build (`./eng/build.sh`)
3. `./eng/package.sh <version>`
4. `./eng/package-smoke.sh <version>`
5. `./eng/samples.sh --dry-run`
6. `./eng/public-api.sh`
7. `./eng/public-docs.sh`

## Notes

- Release check never publishes packages.
- Publish remains explicit via `./eng/publish.sh` in release workflow.

## Authority

This document is authoritative for release-check command sequencing and scope.

## Document Contract

Update this document when release-check sequencing or validation scope changes.
