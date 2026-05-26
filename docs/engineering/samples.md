# Samples Engineering

## Purpose

Define canonical engineering command routing for repository samples.

## Canonical Command

```sh
./eng/samples.sh
```

For release-readiness validation, `./eng/release-check.sh <version>` runs sample validation through:

```sh
./eng/samples.sh --dry-run
```

## Authority

This document is authoritative for engineering sample command routing.

## Document Contract

Update this document when sample command behavior or release-check integration changes.
