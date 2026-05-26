# Engineering Guide V4

## Status

Research copy of the authoritative Engineering Guide V4 supplied for the repository upgrade discussion.

This research document is non-authoritative until its rules are promoted into `docs/ENGINEERING.md`, `docs/engineering/*`, `docs/GUARDRAILS.md`, `eng/*`, workflows, public documentation, issue templates, and agent instructions.

## Purpose

This guide defines an opinionated, AI-agent-friendly engineering setup for professional .NET repositories that may publish NuGet packages and public documentation.

Version 4 extends Engineering Guide V3 with:

- public documentation building block;
- public documentation validation command;
- package smoke testing;
- public API validation;
- release readiness command;
- user-facing documentation checks for NuGet libraries preparing for version 1.0;
- upgrade instructions from V3 to V4.

The default stack remains:

- .NET 10
- Microsoft Testing Platform (MTP)
- TUnit
- BenchmarkDotNet
- Bun
- Biome

Optional modules cover:

- Blazor
- Playwright
- TypeScript runtime/browser tooling
- NuGet packaging
- samples
- GitHub Copilot
- OpenAI Codex
- GitHub Pages
- public documentation
- release readiness

This guide defines the concrete engineering substrate:

- repository command contract;
- build, test, format, benchmark, package, release, and documentation validation commands;
- toolchain pinning;
- project layout;
- engineering building blocks;
- test classification;
- package validation;
- public API validation;
- optional modules;
- agent validation expectations.

## Relationship to Project Setup Guide V5

Project Setup Guide V5 defines the repository knowledge model.

This guide defines the concrete engineering implementation profile.

```text
Project Setup Guide V5 tells the repository how to organize knowledge.
Engineering Guide V4 tells the repository how to build, test, validate, package, document, and release.
```

## README rule

Only the root `README.md` is allowed.

Do not create local README files in:

```text
eng/
samples/
site/
tools/
docs/**/
public-docs/**/
```

Use named documents instead:

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

---

# 1. Core principles

## 1.1 Agent-executable over descriptive

Instructions must be executable or directly checkable.

Prefer:

```text
Run ./eng/check.sh and ensure it exits with code 0.
```

Avoid:

```text
Make sure the project looks clean.
```

## 1.2 One canonical command per workflow

Agents must not guess which command to run.

Each repository should expose these canonical commands:

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

## 1.3 Fast default, explicit release validation

`./eng/check.sh` is the fast development gate.

It should stay safe for local development, CI pull requests, and AI-agent validation.

`./eng/release-check.sh <version>` is the release gate.

It may run package validation, smoke tests, samples, public API checks, and public documentation checks.

## 1.4 Building blocks, not one giant template

Repositories start small and add capabilities by applying building blocks.

A block must define:

- block ID;
- purpose;
- when to apply;
- files to create or modify;
- packages or tools to add;
- commands to expose;
- validation command;
- done criteria.

## 1.5 Tooling must be pinned or explicit

The repository must pin or explicitly define:

- .NET SDK version through `global.json`;
- package versions through central package management;
- JavaScript/TypeScript tooling through `package.json`, `bun.lock`, and `biome.json` when the frontend/tooling module is used.

## 1.6 Optional means absent by default

Blazor, Playwright, TypeScript, NuGet packaging, samples, GitHub Pages, public documentation, and release-readiness scripts are applied only when the repository needs them.

For NuGet libraries preparing for version 1.0, public documentation and release readiness are required.

---

# 2. Required repository layout

A repository generated from the base blocks should use this layout:

```text
/
├─ .config/
│  └─ dotnet-tools.json
├─ .github/
│  ├─ workflows/
│  ├─ instructions/
│  └─ copilot-instructions.md
├─ artifacts/
│  └─ .gitkeep
├─ docs/
│  ├─ ENGINEERING.md
│  ├─ GUARDRAILS.md
│  ├─ PUBLIC-DOCS.md
│  ├─ WORKFLOWS.md
│  ├─ engineering/
│  │  ├─ dotnet.md
│  │  ├─ command-contract.md
│  │  ├─ building-blocks.md
│  │  ├─ optional-modules.md
│  │  ├─ packaging.md
│  │  ├─ public-documentation.md
│  │  ├─ release-readiness.md
│  │  ├─ samples.md
│  │  ├─ site.md
│  │  └─ typescript-tools.md
│  ├─ guardrails/
│  │  ├─ testing.md
│  │  ├─ implementation.md
│  │  └─ languages/
│  │     ├─ dotnet.md
│  │     └─ typescript.md
│  └─ workflows/
├─ public-docs/
│  ├─ getting-started.md
│  ├─ installation.md
│  ├─ concepts.md
│  ├─ packages.md
│  ├─ samples.md
│  ├─ diagnostics.md
│  ├─ versioning.md
│  ├─ release-notes.md
│  ├─ api/
│  ├─ diagnostics/
│  ├─ guides/
│  ├─ nuget/
│  ├─ samples/
│  └─ website/
├─ eng/
│  ├─ restore.sh
│  ├─ build.sh
│  ├─ test.sh
│  ├─ format.sh
│  ├─ check.sh
│  ├─ benchmark.sh
│  ├─ package.sh
│  ├─ publish.sh
│  ├─ package-smoke.sh
│  ├─ public-api.sh
│  ├─ public-docs.sh
│  ├─ release-check.sh
│  ├─ common.sh
│  ├─ ci/
│  ├─ local/
│  └─ templates/
├─ src/
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ package-smoke/
├─ benchmarks/
├─ samples/
├─ site/
├─ packages/
├─ tools/
├─ .editorconfig
├─ .gitignore
├─ AGENTS.md
├─ Directory.Build.props
├─ Directory.Packages.props
├─ NuGet.config
├─ global.json
└─ README.md
```

Optional modules may add:

```text
tests/e2e/
web/
package.json
bun.lock
biome.json
tsconfig.json
playwright.config.ts
```

## Folder ownership

| Path | Purpose |
|---|---|
| `src/` | Production source projects. |
| `tests/unit/` | Fast unit tests. No network, no database, no browser. |
| `tests/integration/` | Integration tests. May use databases, containers, test hosts, or real infrastructure substitutes. |
| `tests/package-smoke/` | Tests that consume packed packages from local artifacts. Required for NuGet release readiness. |
| `tests/e2e/` | Optional browser/system tests. Requires Playwright block. |
| `benchmarks/` | BenchmarkDotNet projects only. Not part of normal test execution. |
| `eng/` | Canonical repository commands and reusable engineering scripts. Agents must use these. |
| `packages/` | Local NuGet packages or packaging output when package publishing is enabled. |
| `samples/` | Small runnable examples. No local README. Document in `docs/engineering/samples.md` and `public-docs/samples/`. |
| `site/` | Optional static project website source or generated site shell. No local README. Document in `docs/engineering/site.md`. |
| `tools/` | Repository-local helper tools, generators, scripts, and development utilities. No local README. |
| `docs/` | Internal authoritative engineering and semantic documentation. |
| `public-docs/` | Public consumer-facing documentation source. |
| `artifacts/` | Local/generated outputs. Usually ignored except for `.gitkeep`. |

---

# 3. `eng/` folder design

The `eng/` folder is the canonical engineering entry point for both humans and AI agents.

Top-level scripts are the public engineering API.

Nested scripts are implementation details.

CI workflows should call `eng/` scripts instead of embedding repository logic directly.

Prefer:

```yaml
run: ./eng/check.sh
```

Avoid:

```yaml
run: |
  dotnet restore
  dotnet build
  dotnet test
```

## Portability rules

Scripts should:

- use POSIX shell where practical;
- avoid unnecessary Bash-specific features;
- avoid machine-local assumptions;
- work in Linux containers, GitHub Actions, and ChromeOS Linux environments;
- fail clearly when required tools or secrets are missing.

If PowerShell support is required, add parallel `.ps1` wrappers while preserving the same command contract.

---

# 4. Required command contract

## `eng/restore.sh`

```sh
#!/usr/bin/env sh
set -eu

dotnet restore

if [ -f package.json ]; then
  bun install --frozen-lockfile
fi
```

## `eng/build.sh`

```sh
#!/usr/bin/env sh
set -eu

dotnet build --no-restore
```

## `eng/test.sh`

```sh
#!/usr/bin/env sh
set -eu

dotnet test --no-build --configuration Debug --filter "TestCategory!=Slow&TestCategory!=E2E&TestCategory!=PackageSmoke"
```

If the selected test framework or adapter does not use `TestCategory`, the repository must document and implement the equivalent filter.

## `eng/format.sh`

```sh
#!/usr/bin/env sh
set -eu

dotnet format

if [ -f biome.json ]; then
  bun run format
fi
```

## `eng/check.sh`

```sh
#!/usr/bin/env sh
set -eu

./eng/restore.sh
./eng/build.sh
./eng/test.sh

dotnet format --verify-no-changes

if [ -f biome.json ]; then
  bun run check
fi
```

## `eng/benchmark.sh`

```sh
#!/usr/bin/env sh
set -eu

dotnet run --configuration Release --project benchmarks/PROJECT_NAME.Benchmarks
```

## `eng/package.sh`

```sh
#!/usr/bin/env sh
set -eu

VERSION="${1:?version is required}"

dotnet pack --configuration Release --no-build \
  -p:PackageVersion="$VERSION" \
  -p:ContinuousIntegrationBuild=true \
  --output ./artifacts/nuget
```

## `eng/package-smoke.sh`

```sh
#!/usr/bin/env sh
set -eu

VERSION="${1:?version is required}"

# Repository-specific implementation:
# 1. create temporary consumer project
# 2. add artifacts/nuget as local package source
# 3. install package(s)
# 4. build and run the consumer
# 5. verify source generator/analyzer/package behavior where applicable

dotnet test tests/package-smoke --configuration Release \
  -p:PackageSmokeVersion="$VERSION"
```

## `eng/public-api.sh`

```sh
#!/usr/bin/env sh
set -eu

# Repository-specific implementation.
# Typical options:
# - PublicAPI.Shipped.txt / PublicAPI.Unshipped.txt validation
# - Verify snapshots
# - generated API diff
# - package public surface validation

dotnet build --configuration Release --no-restore
```

## `eng/public-docs.sh`

```sh
#!/usr/bin/env sh
set -eu

required_files="
README.md
docs/PUBLIC-DOCS.md
public-docs/getting-started.md
public-docs/installation.md
public-docs/concepts.md
public-docs/packages.md
public-docs/samples.md
public-docs/diagnostics.md
public-docs/versioning.md
public-docs/release-notes.md
"

for file in $required_files; do
  if [ ! -f "$file" ]; then
    echo "Missing public documentation file: $file" >&2
    exit 1
  fi
done
```

## `eng/release-check.sh`

```sh
#!/usr/bin/env sh
set -eu

VERSION="${1:?version is required}"

./eng/check.sh
dotnet build --configuration Release
./eng/package.sh "$VERSION"
./eng/package-smoke.sh "$VERSION"
./eng/samples.sh
./eng/public-api.sh
./eng/public-docs.sh
```

If a repository does not use samples, `eng/samples.sh` may be omitted, but NuGet package repositories should strongly prefer samples before version 1.0.

---

# 5. Building block overview

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

---

# 6. BB00 — Repository Base

## Purpose

Create the repository skeleton and canonical engineering scripts.

## Apply when

Always.

## Files to create

```text
.gitignore
README.md
AGENTS.md
eng/restore.sh
eng/build.sh
eng/test.sh
eng/format.sh
eng/check.sh
eng/benchmark.sh
artifacts/.gitkeep
docs/ENGINEERING.md
docs/GUARDRAILS.md
docs/guardrails/testing.md
docs/guardrails/implementation.md
```

Do not create local README files outside the root repository `README.md`.

## Required conventions

- Shell scripts in `eng/` are executable.
- Agents must use `eng/check.sh` before declaring implementation work complete.
- `artifacts/` is used for generated local output and is ignored except for `.gitkeep`.
- `README.md` lists canonical commands and links to `docs/ENGINEERING.md`.

## Validation

```sh
./eng/check.sh
```

## Done criteria

- Required files exist.
- Scripts are executable.
- Root `README.md` lists commands.
- No non-root README files exist.
- `eng/check.sh` exists, even if later blocks fill in its full behavior.

---

# 7. BB01 — .NET Solution

## Purpose

Create the .NET solution and project structure.

## Apply when

Always.

## Files/projects to create

Example for repository name `Example.Project`:

```text
Example.Project.slnx
src/Example.Project/Example.Project.csproj
tests/unit/Example.Project.Tests.Unit/Example.Project.Tests.Unit.csproj
tests/integration/Example.Project.Tests.Integration/Example.Project.Tests.Integration.csproj
```

Use `.slnx` when supported by the installed .NET SDK and tooling. Use `.sln` only when required by external tooling.

## Required conventions

- Production projects live under `src/`.
- Unit test projects live under `tests/unit/`.
- Integration test projects live under `tests/integration/`.
- Package smoke tests live under `tests/package-smoke/` when BB20 is applied.
- Project names include their role.
- Test projects reference the production projects they test, except package smoke tests, which should consume packed packages.

## Validation

```sh
dotnet build
```

## Done criteria

- Solution exists.
- At least one production project exists.
- At least one unit test project exists.
- Solution builds.

---

# 8. BB02 — Shared Build Configuration

## Purpose

Centralize .NET SDK, build, analyzer, and package configuration.

## Apply when

Always.

## Files to create

```text
global.json
Directory.Build.props
Directory.Packages.props
.config/dotnet-tools.json
```

## Required conventions

- Package versions must be defined centrally.
- Project files must not contain inline package versions unless justified.
- SDK version must be pinned.
- Production code treats warnings as errors.
- Package repositories should generate XML documentation for public API projects.

## Validation

```sh
dotnet restore
dotnet build
```

## Done criteria

- SDK is pinned.
- Central package management is enabled.
- Build properties apply to all projects.
- Restore and build succeed.

---

# 9. BB03 — EditorConfig and C# Style

## Purpose

Provide concrete formatting and analyzer rules so agents do not infer style from examples.

## Apply when

Always.

## File to create

```text
.editorconfig
```

## Required conventions

- `.editorconfig` is authoritative for C# style.
- Agents must run `dotnet format --verify-no-changes` before completion as part of `eng/check.sh`.
- Do not rely on IDE defaults.

## Validation

```sh
dotnet format --verify-no-changes
```

## Done criteria

- `.editorconfig` exists.
- `dotnet format --verify-no-changes` passes.

---

# 10. BB04 — MTP + TUnit Unit Tests

## Purpose

Create the default test foundation using Microsoft Testing Platform and TUnit.

## Apply when

Always.

## Required conventions

- Unit tests must be fast.
- Unit tests must not use network, real database, browser automation, or sleeps.
- Test names should describe observable behavior.
- Tests must be deterministic.
- Avoid broad generated tests that assert implementation details.

## Validation

```sh
dotnet test tests/unit/Example.Project.Tests.Unit/Example.Project.Tests.Unit.csproj
```

## Done criteria

- At least one unit test exists.
- Unit tests run through `dotnet test`.
- Unit test project participates in `eng/test.sh`.

---

# 11. BB05 — Test Guardrails

## Purpose

Prevent agents from creating slow, broad, or operationally expensive tests by default.

## Apply when

Always.

## Test categories

| Category | Default run | Description |
|---|---:|---|
| Unit | Yes | Fast, isolated tests. |
| Integration | Optional in local loop | Uses database, filesystem, test server, or containers. |
| PackageSmoke | No | Tests packed packages as a real consumer. Release gate only. |
| Slow | No | Expensive tests not suitable for normal agent iterations. |
| E2E | No | Browser/system tests. |
| Benchmark | Never via test command | BenchmarkDotNet only. |

## Required rules

- `eng/test.sh` runs fast tests only.
- Integration tests must have their own command or documented filter.
- Package smoke tests must not run in `eng/test.sh`.
- E2E tests must not run as part of normal `dotnet test` unless explicitly requested.
- Benchmarks must never be represented as tests.
- Agents must not add sleeps to tests unless unavoidable and documented.
- Agents must not create tests that depend on test execution order.

## Validation

```sh
./eng/test.sh
```

## Done criteria

- Test categories are documented.
- Default test command excludes slow/e2e/package-smoke work.
- Benchmark policy is documented.
- Release validation has a separate path.

---

# 12. BB06 — BenchmarkDotNet

## Purpose

Add performance measurement without polluting the test suite.

## Apply when

Recommended for libraries, algorithms, serialization, parsers, graph processing, data structures, or performance-sensitive services.

## Required conventions

- Benchmarks run in Release configuration.
- Benchmarks are not part of `eng/test.sh`.
- Benchmark output is written to ignored artifacts.
- Benchmark projects must not contain correctness assertions as their primary purpose.

## Validation

```sh
./eng/benchmark.sh
```

## Done criteria

- Benchmark project exists.
- Benchmark command is documented.
- Normal test command does not execute benchmarks.

---

# 13. BB07 — GitHub Actions CI

## Purpose

Provide hosted validation for build, test, formatting, and optional frontend checks.

## Apply when

Recommended for every repository hosted on GitHub.

## Files to create

```text
.github/workflows/ci.yml
docs/workflows/build.md
docs/workflows/test-short.md
```

## Required conventions

- CI must use the same commands as local development.
- CI must not invent separate build logic.
- Optional module setup must be conditional.
- Workflow intent must be documented in `docs/workflows/`.

## Validation

CI passes on a clean checkout.

## Done criteria

- Workflow exists.
- Workflow uses `./eng/check.sh`.
- Workflow supports repositories with and without Bun tooling.
- Workflow documentation e
