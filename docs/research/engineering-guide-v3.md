# Engineering Guide V3

## Purpose

This guide defines the concrete engineering substrate for an opinionated, AI-agent-friendly professional .NET repository.

The default stack is:

- .NET 10
- Microsoft Testing Platform
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
- GitHub Pages

This guide is designed around reusable building blocks. A new repository starts with base blocks and adds optional blocks only when needed.

## Relationship to Project Setup Guide V3

Project Setup Guide V3 defines the semantic repository structure.

This guide defines the engineering substrate.

```text
Project Setup Guide V3:
  documentation structure
  terminology
  specs
  milestones
  TBPs
  guardrails
  workflows
  issue templates
  agent routing

Engineering Guide V3:
  command contract
  build
  restore
  test
  format
  benchmark
  package
  samples
  site
  .NET tooling
  TypeScript tooling
  optional engineering modules
```

Rule:

```text
V3 tells the repository how to think.
Engineering Guide V3 tells the repository how to build.
```

## Core Principles

### 1. Agent-executable over descriptive

Instructions must be executable or directly checkable.

Prefer:

```text
Run ./eng/check.sh and ensure it exits with code 0.
```

Avoid:

```text
Make sure the project looks clean.
```

### 2. One canonical command per workflow

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

Optional modules may add:

```text
./eng/e2e.sh
./eng/frontend-check.sh
./eng/frontend-format.sh
./eng/package.sh
./eng/publish.sh
./eng/samples.sh
./eng/site-build.sh
```

### 3. Building blocks, not one giant template

Repositories should start small and add capabilities by applying building blocks.

A building block must define:

- block ID
- purpose
- when to apply
- files to create or modify
- packages/tools to add
- commands to expose
- validation command
- done criteria

### 4. Tooling must be pinned or explicit

The repository must pin or explicitly define:

- .NET SDK version through `global.json`
- package versions through central package management
- JavaScript/TypeScript tooling through `package.json`, lockfile, and `biome.json` when the frontend/tooling module is used

### 5. Optional means absent by default

Blazor, Playwright, TypeScript, NuGet publishing, samples, and website support are optional modules.

Do not add them unless the repository needs them.

### 6. No folder-local README files

The repository may contain exactly one README file:

```text
README.md
```

Do not create:

```text
eng/README.md
samples/README.md
tools/README.md
docs/**/README.md
```

Document these areas through:

```text
docs/ENGINEERING.md
docs/engineering/command-contract.md
docs/engineering/samples.md
docs/engineering/tools.md
docs/engineering/website.md
```

## Required Repository Layout

A generated base repository should use this layout:

```text
/
├─ .config/
│  └─ dotnet-tools.json
│
├─ .github/
│  ├─ ISSUE_TEMPLATE/
│  ├─ workflows/
│  ├─ instructions/
│  └─ copilot-instructions.md
│
├─ artifacts/
│  └─ .gitkeep
│
├─ docs/
│  ├─ TERMINOLOGY.md
│  ├─ ARCHITECTURE.md
│  ├─ DECISIONS.md
│  ├─ SPECS.md
│  ├─ MILESTONES.md
│  ├─ TBPS.md
│  ├─ WORKFLOWS.md
│  ├─ GUARDRAILS.md
│  ├─ ENGINEERING.md
│  ├─ RESEARCH.md
│  │
│  ├─ engineering/
│  │  ├─ command-contract.md
│  │  ├─ building-blocks.md
│  │  ├─ dotnet.md
│  │  ├─ samples.md
│  │  ├─ packaging.md
│  │  ├─ website.md
│  │  └─ tools.md
│  │
│  ├─ guardrails/
│  │  ├─ testing.md
│  │  ├─ implementation.md
│  │  └─ languages/
│  │     ├─ dotnet.md
│  │     └─ typescript.md
│  │
│  └─ research/
│     └─ engineering-guide-v3.md
│
├─ eng/
│  ├─ restore.sh
│  ├─ build.sh
│  ├─ test.sh
│  ├─ format.sh
│  ├─ check.sh
│  ├─ benchmark.sh
│  ├─ common.sh
│  ├─ ci/
│  ├─ local/
│  └─ templates/
│
├─ src/
├─ tests/
│  ├─ unit/
│  └─ integration/
│
├─ benchmarks/
├─ packages/
├─ samples/
├─ site/
├─ tools/
│
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

## Folder Ownership

| Path | Purpose |
|---|---|
| `src/` | Production source projects |
| `tests/unit/` | Fast unit tests; no network, database, browser, or long-running work |
| `tests/integration/` | Integration tests; may use databases, containers, test hosts, or real infrastructure substitutes |
| `tests/e2e/` | Optional browser/system tests; requires Playwright block |
| `benchmarks/` | BenchmarkDotNet projects only; not part of normal test execution |
| `eng/` | Canonical repository commands and reusable engineering scripts |
| `eng/ci/` | CI-only helper scripts or workflow fragments |
| `eng/local/` | Local developer utilities not required in CI |
| `eng/templates/` | Reusable file templates for generators or agents |
| `packages/` | Local package output when package publishing is enabled |
| `samples/` | Small runnable usage examples |
| `site/` | Optional static project website source |
| `tools/` | Repository-local helper tools, generators, scripts, and development utilities |
| `docs/` | Human- and agent-readable repository documentation |
| `artifacts/` | Local/generated outputs; ignored except `.gitkeep` |

## Engineering Command Contract

The `eng/` folder is the canonical engineering entry point for humans, CI, and AI agents.

Top-level scripts are the public API.

Agents and CI should prefer only these scripts:

```text
./eng/restore.sh
./eng/build.sh
./eng/test.sh
./eng/check.sh
./eng/format.sh
./eng/benchmark.sh
```

Nested scripts are implementation details.

### Script Layering

```text
eng/
  common.sh         shared helpers
  restore.sh        canonical entry point
  build.sh          canonical entry point
  test.sh           canonical entry point
  check.sh          canonical entry point
  format.sh         canonical entry point
  benchmark.sh      canonical entry point

  ci/
    *.sh            CI-only helpers

  local/
    *.sh            optional local utilities

  templates/
    *               reusable generation templates
```

### Canonical Script Rules

Top-level scripts should:

- be short
- compose lower-level helpers
- avoid duplicated logic
- avoid hidden side effects
- fail fast
- use deterministic command ordering

Prefer:

```text
./eng/restore.sh
./eng/build.sh
./eng/test.sh
```

Avoid duplicated restore/build logic in CI workflows, issue instructions, or agent instructions.

### Shared Helper Example

`eng/common.sh`:

```sh
#!/usr/bin/env sh
set -eu

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Required command not found: $1" >&2
    exit 1
  }
}
```

### Script Extension Rules

When adding a new capability:

- prefer extending an existing canonical script first
- add a new top-level script only if the workflow is conceptually separate
- avoid creating many overlapping commands

Good examples:

```text
eng/e2e.sh
eng/package.sh
eng/publish.sh
eng/samples.sh
eng/site-build.sh
```

Bad examples:

```text
eng/test-all.sh
eng/test-fast.sh
eng/test-fast-no-db.sh
eng/test-local.sh
```

### CI Behavior

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

### Portability Rules

Scripts should:

- use POSIX shell where practical
- avoid unnecessary Bash-specific features
- avoid machine-local assumptions
- work in Linux containers, GitHub Actions, and ChromeOS Linux environments

If PowerShell support is required, add parallel `.ps1` wrappers while preserving the same command contract.

## Required Command Scripts

### `eng/restore.sh`

```sh
#!/usr/bin/env sh
set -eu

dotnet restore

if [ -f package.json ]; then
  bun install --frozen-lockfile
fi
```

### `eng/build.sh`

```sh
#!/usr/bin/env sh
set -eu

dotnet build --no-restore
```

### `eng/test.sh`

```sh
#!/usr/bin/env sh
set -eu

dotnet test --no-build --configuration Debug --filter "TestCategory!=Slow&TestCategory!=E2E"
```

If the selected test framework or adapter does not use `TestCategory`, the repository must document and implement the equivalent filter.

### `eng/format.sh`

```sh
#!/usr/bin/env sh
set -eu

dotnet format

if [ -f biome.json ]; then
  bun run format
fi
```

### `eng/check.sh`

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

### `eng/benchmark.sh`

```sh
#!/usr/bin/env sh
set -eu

dotnet run --configuration Release --project benchmarks/PROJECT_NAME.Benchmarks
```

Replace `PROJECT_NAME.Benchmarks` with the actual benchmark project name when the benchmark block is applied.

## Building Block Overview

| Block | Name | Required | Purpose |
|---|---:|---:|---|
| BB00 | Repository Base | Yes | Common repository skeleton and command contract |
| BB01 | .NET Solution | Yes | Solution, source project, test project structure |
| BB02 | Shared Build Configuration | Yes | `global.json`, `Directory.Build.props`, central package management |
| BB03 | EditorConfig and C# Style | Yes | Formatting, analyzers, and style rules |
| BB04 | MTP + TUnit Unit Tests | Yes | Fast unit testing foundation |
| BB05 | Test Guardrails | Yes | Fast/slow/integration/e2e separation |
| BB06 | BenchmarkDotNet | Recommended | Dedicated benchmark project |
| BB07 | GitHub Actions CI | Recommended | Build/test/check automation |
| BB08 | Agent Instructions | Yes | Repository-local operating instructions for AI agents |
| BB09 | Bun + Biome | Optional | TypeScript/JavaScript tooling |
| BB10 | Blazor Module | Optional | Blazor application project |
| BB11 | Playwright E2E Module | Optional | Browser automation tests |
| BB12 | TypeScript Runtime Tools | Optional | Self-authored TypeScript scripts/runtime utilities |
| BB13 | Documentation Skeleton | Yes | Minimal docs required for maintainability |
| BB14 | NuGet Packaging | Optional | NuGet package generation and publishing conventions |
| BB15 | Samples | Optional | Runnable examples that demonstrate supported usage patterns |
| BB16 | GitHub Copilot | Optional | Repository instructions for Copilot |
| BB17 | OpenAI Codex | Optional | Repository instructions and command contracts optimized for Codex |
| BB18 | GitHub Pages Website | Optional | Static project website deployed through GitHub Pages |

## BB00 — Repository Base

### Purpose

Create the repository skeleton and canonical engineering scripts.

### Apply when

Always.

### Files to create

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
docs/engineering/command-contract.md
docs/guardrails/testing.md
```

### Required Conventions

- Shell scripts in `eng/` are executable.
- Agents must use `eng/check.sh` before declaring implementation work complete.
- `artifacts/` is used for generated local output and is ignored except `.gitkeep`.
- `README.md` must list canonical commands.
- No folder-local README files are allowed.

### Example `.gitignore`

```gitignore
# .NET
bin/
obj/
TestResults/
*.user
*.suo
*.rsuser

# BenchmarkDotNet
BenchmarkDotNet.Artifacts/

# Local artifacts
artifacts/*
!artifacts/.gitkeep

# Package output
packages/*
!packages/.gitkeep

# Bun / JS / TS
node_modules/
bun.lockb

# IDE
.vs/
.vscode/.ropeproject
.idea/

# OS
.DS_Store
Thumbs.db
```

If Bun creates `bun.lock`, commit it. If Bun creates `bun.lockb`, commit it only if this is the configured lockfile format for the selected Bun version.

### Validation

```sh
./eng/check.sh
```

### Done Criteria

- Required files exist.
- Scripts are executable.
- README lists commands.
- `eng/check.sh` exists, even if later blocks fill in its full behavior.
- No forbidden README files exist.

## BB01 — .NET Solution

### Purpose

Create the .NET solution and project structure.

### Apply when

Always.

### Files/projects to create

Example for repository name `Example.Project`:

```text
Example.Project.slnx
src/Example.Project/Example.Project.csproj
tests/unit/Example.Project.Tests.Unit/Example.Project.Tests.Unit.csproj
tests/integration/Example.Project.Tests.Integration/Example.Project.Tests.Integration.csproj
```

Use `.slnx` when supported by the installed .NET SDK and tooling. Use `.sln` only when required by external tooling.

### Required Conventions

- Production projects live under `src/`.
- Unit test projects live under `tests/unit/`.
- Integration test projects live under `tests/integration/`.
- Project names include their role.
- Test projects reference the production projects they test.

### Validation

```sh
dotnet build
```

### Done Criteria

- Solution exists.
- At least one production project exists.
- At least one unit test project exists.
- Solution builds.

## BB02 — Shared Build Configuration

### Purpose

Centralize .NET SDK, build, analyzer, and package configuration.

### Apply when

Always.

### Files to create

```text
global.json
Directory.Build.props
Directory.Packages.props
.config/dotnet-tools.json
```

### Example `global.json`

```json
{
  "sdk": {
    "version": "10.0.100",
    "rollForward": "latestFeature"
  }
}
```

### Example `Directory.Build.props`

```xml
<Project>
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <LangVersion>latest</LangVersion>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <AnalysisLevel>latest</AnalysisLevel>
    <AnalysisMode>Recommended</AnalysisMode>
    <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
    <ContinuousIntegrationBuild Condition="'$(CI)' == 'true'">true</ContinuousIntegrationBuild>
    <Deterministic>true</Deterministic>
  </PropertyGroup>

  <PropertyGroup Condition="$(MSBuildProjectName.Contains('.Tests.'))">
    <IsTestProject>true</IsTestProject>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>
</Project>
```

### Example `Directory.Packages.props`

```xml
<Project>
  <ItemGroup>
    <PackageVersion Include="TUnit" Version="0.0.0" />
    <PackageVersion Include="TUnit.Assertions" Version="0.0.0" />
    <PackageVersion Include="Microsoft.Testing.Platform" Version="0.0.0" />
    <PackageVersion Include="BenchmarkDotNet" Version="0.0.0" />
  </ItemGroup>
</Project>
```

Replace `0.0.0` with current approved versions during repository creation.

### Required Conventions

- Package versions must be defined centrally.
- Project files must not contain inline package versions unless justified.
- SDK version must be pinned.
- Production code treats warnings as errors.

### Validation

```sh
dotnet restore
dotnet build
```

### Done Criteria

- SDK is pinned.
- Central package management is enabled.
- Build properties apply to all projects.
- Restore and build succeed.

## BB03 — EditorConfig and C# Style

### Purpose

Provide concrete formatting and analyzer rules so agents do not infer style from examples.

### Apply when

Always.

### Files to create

```text
.editorconfig
```

### Required Conventions

- `.editorconfig` is authoritative for C# style.
- Agents must run `dotnet format --verify-no-changes` before completion when code formatting may be affected.
- Do not rely on IDE defaults.

### Validation

```sh
dotnet format --verify-no-changes
```

### Done Criteria

- `.editorconfig` exists.
- `dotnet format --verify-no-changes` passes.

## BB04 — MTP + TUnit Unit Tests

### Purpose

Create the default test foundation using Microsoft Testing Platform and TUnit.

### Apply when

Always.

### Required Conventions

- Unit tests must be fast.
- Unit tests must not use network, real database, browser automation, or sleeps.
- Test names should describe observable behavior.
- Tests must be deterministic.
- Avoid broad generated tests that assert implementation details.

### Validation

```sh
./eng/test.sh
```

### Done Criteria

- At least one unit test exists.
- Unit tests run through `./eng/test.sh`.

## BB05 — Test Guardrails

### Purpose

Prevent agents from creating slow, broad, or operationally expensive tests by default.

### Apply when

Always.

### Test Categories

| Category | Default Run | Description |
|---|---|---|
| Unit | Yes | Fast, isolated, no external dependencies |
| Integration | Explicit | May use databases, containers, or test hosts |
| E2E | Explicit | Browser/system tests via Playwright |
| Benchmark | Never | BenchmarkDotNet performance tests only |

### Done Criteria

- Test guardrail documentation exists at `docs/guardrails/testing.md`.
- Unit and integration test projects are separated.

## BB06 — BenchmarkDotNet

### Purpose

Provide a dedicated benchmark project for performance measurements.

### Apply when

Recommended when performance-sensitive code exists.

### Files to create

```text
benchmarks/BlazorFlowGraph.Benchmarks/BlazorFlowGraph.Benchmarks.csproj
```

### Done Criteria

- Benchmark project exists under `benchmarks/`.
- `eng/benchmark.sh` runs the benchmark project.

## BB07 — GitHub Actions CI

### Purpose

Automate build, test, and check on push and pull request events.

### Apply when

Recommended.

### Required Conventions

- CI calls `eng/` scripts, not inline repository commands.
- CI uploads test results and artifacts.

### Done Criteria

- CI runs `./eng/check.sh` or equivalent `eng/` script composition.
- CI runs on push to main and on pull requests to main.

## BB08 — Agent Instructions

### Purpose

Provide repository-local operating instructions for AI agents.

### Apply when

Always.

### Files to create or update

```text
AGENTS.md
```

### Required Conventions

- `AGENTS.md` references `eng/check.sh` as the validation command.
- `AGENTS.md` lists routing rules for documentation changes.

## BB13 — Documentation Skeleton

### Purpose

Provide the minimal documentation structure for maintainability.

### Apply when

Always.

### Files to create

```text
docs/TERMINOLOGY.md
docs/SPECS.md
docs/TBPS.md
docs/WORKFLOWS.md
docs/ENGINEERING.md
docs/GUARDRAILS.md
docs/engineering/command-contract.md
docs/guardrails/testing.md
docs/research/engineering-guide-v3.md
```
