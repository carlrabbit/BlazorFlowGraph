# Public Documentation Engineering

## Purpose

Define engineering-time validation and synchronization rules for the public documentation surface.

## Canonical Command

```sh
./eng/public-docs.sh
```

`eng/public-docs.sh` validates required public documentation files and directories.

## Required Sources

- `docs/PUBLIC-DOCS.md`
- `public-docs/getting-started.md`
- `public-docs/installation.md`
- `public-docs/concepts.md`
- `public-docs/packages.md`
- `public-docs/samples.md`
- `public-docs/diagnostics.md`
- `public-docs/versioning.md`
- `public-docs/release-notes.md`
- `public-docs/nuget/package-readme.md`

## Synchronization

When public-facing behavior changes, synchronize:

- public docs sources under `public-docs/`
- root `README.md`
- release notes and diagnostics references

## Authority

This document is authoritative for engineering validation of public documentation.

## Document Contract

Update this document when public documentation validation scope or command behavior changes.
