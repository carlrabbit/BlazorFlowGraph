# Engineering Guide V4

## Status

Research copy of the authoritative Engineering Guide V4 supplied for the repository upgrade discussion.

This research document is non-authoritative until its rules are promoted into `docs/ENGINEERING.md`, `docs/engineering/*`, `docs/GUARDRAILS.md`, `eng/*`, workflows, public documentation, issue templates, and agent instructions.

## Purpose

Engineering Guide V4 defines an opinionated, AI-agent-friendly engineering setup for professional .NET repositories that may publish NuGet packages and public documentation.

V4 extends Engineering Guide V3 with:

- public documentation building block;
- public documentation validation command;
- package smoke testing;
- public API validation;
- release readiness command;
- user-facing documentation checks for NuGet libraries preparing for version 1.0;
- upgrade instructions from V3 to V4.

The default stack remains:

- .NET 10;
- Microsoft Testing Platform;
- TUnit;
- BenchmarkDotNet;
- Bun;
- Biome.

## Relationship to Project Setup Guide V5

Project Setup Guide V5 defines the repository knowledge model.

Engineering Guide V4 defines the concrete engineering implementation profile.

```text
Project Setup Guide V5 tells the repository how to organize knowledge.
Engineering Guide V4 tells the repository how to build, test, validate, package, document, and release.
```

## README rule

Only the root `README.md` is allowed.

Do not create local README files in `eng/`, `samples/`, `site/`, `tools/`, `docs/**`, or `public-docs/**`.

Use named documents instead, such as:

```text
docs/ENGINEERING.md
docs/PUBLIC-DOCS.md
docs/engineering/command-contract.md
docs/engineering/samples.md
docs/engineering/site.md
docs/engineering/typescript-tools.md
public-docs/getting-started.md
public-docs/nuget/package-readme.md
public-docs/samples/getting-started.md
```

## Core principles

1. Instructions must be executable or directly checkable.
2. Each workflow must have one canonical command.
3. `./eng/check.sh` is the fast development gate.
4. `./eng/release-check.sh <version>` is the release gate.
5. Repositories start small and add capabilities through building blocks.
6. Tooling must be pinned or explicit.
7. Optional modules remain absent until selected.
8. For NuGet libraries preparing for version 1.0, public documentation and release readiness are required.

## Canonical command contract

Base repositories expose:

```text
./eng/restore.sh
./eng/build.sh
./eng/test.sh
./eng/format.sh
./eng/check.sh
./eng/benchmark.sh
```

Package and release capable repositories may add:

```text
./eng/package.sh
./eng/publish.sh
./eng/package-smoke.sh
./eng/public-api.sh
./eng/public-docs.sh
./eng/release-check.sh
```

Optional modules may add:

```text
./eng/e2e.sh
./eng/frontend-check.sh
./eng/frontend-format.sh
./eng/samples.sh
./eng/site-build.sh
```

CI workflows should call `eng/` scripts instead of embedding raw repository logic.

## Fast default and release validation

`./eng/check.sh` is the local, PR, and AI-agent development gate. It should restore, build, run fast tests, and verify formatting/tooling.

`./eng/release-check.sh <version>` is the release gate. It may run package validation, package smoke tests, samples, public API checks, and public documentation checks.

## Building blocks

| Block | Name | Required | Purpose |
|---|---|---:|---|
| BB00 | Repository Base | Yes | Common repository skeleton and command contract. |
| BB01 | .NET Solution | Yes | Solution, source project, test project structure. |
| BB02 | Shared Build Configuration | Yes | `global.json`, `Directory.Build.props`, central package management. |
| BB03 | EditorConfig and C# Style | Yes | Opinionated formatting, analyzers, and style rules. |
| BB04 | MTP + TUnit Unit Tests | Yes | Fast unit testing foundation. |
| BB05 | Test Guardrails | Yes | Fast/slow/integration/e2e/package-smoke separation. |
| BB06 | BenchmarkDotNet | Recommended | Dedicated benchmark project. |
| BB07 | GitHub Actions CI | Recommended | Build/test/check automation. |
| BB08 | Agent Instructions | Yes | Repository-local operating instructions for AI agents. |
| BB09 | Bun + Biome | Optional | TypeScript/JavaScript tooling. |
| BB10 | Blazor Module | Optional | Blazor application project. |
| BB11 | Playwright E2E Module | Optional | Browser automation tests. |
| BB12 | TypeScript Runtime Tools | Optional | Self-authored TypeScript scripts/runtime utilities. |
| BB13 | Documentation Skeleton | Yes | Minimal docs required for maintainability. |
| BB14 | NuGet Packaging | Required for NuGet libraries | NuGet package generation and publishing conventions. |
| BB15 | Samples | Recommended for public packages | Runnable examples that demonstrate supported usage patterns. |
| BB16 | GitHub Copilot | Optional | Repository instructions for Copilot. |
| BB17 | OpenAI Codex | Optional | Repository instructions optimized for Codex. |
| BB18 | GitHub Pages Website | Optional | Static project website deployed through GitHub Pages. |
| BB19 | Public Documentation | Required for public packages before 1.0 | Consumer-facing documentation source and validation. |
| BB20 | Release Readiness | Required for public packages before 1.0 | Release gate, package smoke tests, public API checks, public docs checks. |

## Public documentation block

BB19 adds public user-facing documentation for packages, APIs, diagnostics, samples, release notes, and website publication.

Required files include:

```text
docs/PUBLIC-DOCS.md
docs/tbps/public-documentation-update.md
docs/engineering/public-documentation.md
public-docs/getting-started.md
public-docs/installation.md
public-docs/concepts.md
public-docs/packages.md
public-docs/samples.md
public-docs/diagnostics.md
public-docs/versioning.md
public-docs/release-notes.md
public-docs/api/
public-docs/diagnostics/
public-docs/guides/
public-docs/nuget/
public-docs/samples/
public-docs/website/
eng/public-docs.sh
```

Rules:

- Public docs live in `public-docs/`.
- Internal docs live in `docs/`.
- `docs/PUBLIC-DOCS.md` is the authority for public documentation synchronization.
- Do not create README files under `public-docs/`.
- The root `README.md` remains the first-contact user document.
- NuGet package README content must come from `public-docs/nuget/`.
- Diagnostics must be documented by diagnostic ID.
- Samples must be documented from the user perspective.
- Release notes must describe externally visible changes.

## Release readiness block

BB20 adds release-oriented validation that proves the repository is ready to publish public artifacts.

Required files include:

```text
eng/release-check.sh
eng/package-smoke.sh
eng/public-api.sh
docs/engineering/release-readiness.md
docs/workflows/release-check.md
tests/package-smoke/
```

Required validation flow:

```text
1. ./eng/check.sh
2. dotnet build -c Release
3. ./eng/package.sh <version>
4. ./eng/package-smoke.sh <version>
5. ./eng/samples.sh
6. ./eng/public-api.sh
7. ./eng/public-docs.sh
```

Package smoke tests should verify that packed packages can be installed into a clean consumer project, restored, built, and used through the public API.

Public API validation should track intentional API changes and prevent accidental public surface expansion. `PublicAPI.Shipped.txt` and `PublicAPI.Unshipped.txt` are recommended options, or an equivalent snapshot-based strategy.

## Upgrade guide from Engineering Guide V3

1. Add `docs/PUBLIC-DOCS.md`, `docs/engineering/public-documentation.md`, `public-docs/`, and `eng/public-docs.sh`.
2. Add `docs/engineering/release-readiness.md`, `docs/workflows/release-check.md`, `eng/release-check.sh`, `eng/package-smoke.sh`, `eng/public-api.sh`, and `tests/package-smoke/`.
3. Extend `docs/ENGINEERING.md`, `docs/engineering/command-contract.md`, `AGENTS.md`, and `.github/copilot-instructions.md` with the new commands.
4. Update `docs/guardrails/testing.md` with `PackageSmoke` as a non-default category.
5. Update `docs/engineering/packaging.md` for package README source, smoke tests, release gate, and metadata synchronization.
6. Choose and document a public API validation strategy.
7. Move or create sample documentation under `docs/engineering/samples.md` and `public-docs/samples/`.
8. If GitHub Pages is used, document it under `docs/engineering/site.md`, `public-docs/website/`, and `docs/workflows/pages.md`.
9. Make the root README user-first for public packages.
10. Add public documentation impact sections to documentation, milestone implementation, and release issue templates.
11. Add or update public-docs, release-check, and release workflow specs.
12. Retain Engineering Guide V3 as historical research.

## Completion model

A V4-compliant repository has canonical `eng/` scripts, explicit command contracts, strong test guardrails, Bun/Biome for optional TypeScript tooling, public documentation validation for public packages, package smoke tests, public API checks, and `./eng/release-check.sh <version>` as the non-publishing release gate.
