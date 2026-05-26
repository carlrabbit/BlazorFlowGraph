# Public Documentation

## Purpose

This document defines the authoritative public documentation surface for BlazorFlowGraph consumers.

Public documentation is consumer-facing guidance for installing, using, diagnosing, versioning, and upgrading BlazorFlowGraph packages.

## Authority

This document is authoritative for:

- public documentation surface definition
- required public documentation source files
- package README source mapping
- synchronization rules between internal docs and `public-docs/`

Internal behavior authority remains in `docs/SPECS.md` and `docs/specs/`.

## Public Documentation Surface

Required files:

- `public-docs/getting-started.md`
- `public-docs/installation.md`
- `public-docs/concepts.md`
- `public-docs/packages.md`
- `public-docs/samples.md`
- `public-docs/diagnostics.md`
- `public-docs/versioning.md`
- `public-docs/release-notes.md`
- `public-docs/nuget/package-readme.md`

Required folders:

- `public-docs/api/`
- `public-docs/diagnostics/`
- `public-docs/guides/`
- `public-docs/nuget/`
- `public-docs/samples/`
- `public-docs/website/`

Do not add `public-docs/README.md`.

## Consumer Contract

Public docs are written for package consumers and must describe:

- intent and supported scenarios
- package install and setup
- public API usage patterns
- diagnostics and known failure behavior
- versioning and release notes

Public docs must not become the internal behavioral authority.

## Package README Source Mapping

NuGet package README source is `public-docs/nuget/package-readme.md`.

If package-specific README files are introduced later, map each package explicitly in this document.

## Synchronization Rules

Update `public-docs/` when public-facing behavior changes in any of the following:

- package shape or package usage
- public APIs
- diagnostics and failure behavior
- samples and user workflows
- release behavior and versioning guidance

When public docs are updated, review and synchronize:

- `README.md`
- `docs/ENGINEERING.md`
- `docs/engineering/public-documentation.md`
- `docs/workflows/public-docs.md`

## Document Contract

Update this document when public documentation scope, required files, mapping rules, or synchronization rules change.
