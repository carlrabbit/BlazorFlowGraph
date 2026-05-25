# Project Setup Guide V5

## Status

Research copy of the authoritative Project Setup Guide V5 supplied for the repository upgrade discussion.

This research document is non-authoritative until its rules are promoted into repository documents such as `docs/PUBLIC-DOCS.md`, `docs/ENGINEERING.md`, `docs/GUARDRAILS.md`, `docs/TBPS.md`, issue templates, public documentation, and agent instructions.

## Purpose

Project Setup Guide V5 defines how a repository is structured as a documentation-first, AI-assisted engineering system.

V5 extends V4 with a first-class public documentation layer for repositories that publish NuGet packages, public APIs, source generators, command-line tools, websites, or other externally consumed artifacts.

## Core model

The repository separates the following responsibilities:

| Layer | Responsibility |
|---|---|
| `README.md` | First-contact public and contributor entry point. |
| `docs/TERMINOLOGY.md` | Canonical vocabulary. |
| `docs/ARCHITECTURE.md` | Index for structural system design. |
| `docs/DECISIONS.md` | Index for decision records and rationale. |
| `docs/SPECS.md` | Index for behavioral truth and invariants. |
| `docs/MILESTONES.md` | Index for controlled implementation phases. |
| `docs/TBPS.md` | Index for reusable operational methodology. |
| `docs/WORKFLOWS.md` | Index for operational workflow specifications. |
| `docs/GUARDRAILS.md` | Index for cross-cutting implementation and testing constraints. |
| `docs/ENGINEERING.md` | Index for concrete engineering substrate and stack profiles. |
| `docs/PUBLIC-DOCS.md` | Index and synchronization contract for public user-facing documentation. |
| `docs/RESEARCH.md` | Index for non-authoritative research and rationale. |
| `public-docs/` | Source for externally consumable documentation. |
| `AGENTS.md` | Concise agent routing and repository synchronization rules. |
| `.github/copilot-instructions.md` | Concise GitHub Copilot routing rules. |
| `.github/ISSUE_TEMPLATE/*.md` | Lightweight issue templates that route work to the correct documents and TBPs. |

The governing rule is:

```text
Terminology defines words.
Architecture defines structure.
Specs define truth.
Decisions define rationale.
Milestones define sequencing.
TBPs define methodology.
Guardrails define project-wide constraints.
Engineering defines command contracts and toolchain setup.
Public docs explain supported usage to consumers.
Issues define concrete work.
Workflows define operations.
```

## Internal documentation vs public documentation

The repository has two documentation bases:

```text
docs/
  internal authoritative engineering and semantic documentation

public-docs/
  external consumer-facing documentation source
```

`docs/` is the internal knowledge system. `public-docs/` is the public documentation source for installation guides, getting-started guides, package docs, diagnostics references, API documentation, sample walkthroughs, versioning policy, release notes, and website content.

The public documentation layer is core to the repository and must be kept synchronized with specs, public API, package metadata, diagnostics, samples, release behavior, and website publication.

## Required structural changes from V4

V5 adds:

- `docs/PUBLIC-DOCS.md` as the internal public documentation authority and synchronization contract;
- `public-docs/` as the source tree for externally consumable documentation;
- public documentation terminology in `docs/TERMINOLOGY.md`;
- public documentation impact sections in milestone and issue templates;
- `docs/tbps/public-documentation-update.md`;
- public documentation synchronization rules in guardrails and agent instructions;
- public documentation validation workflow specs;
- release-readiness coordination with public documentation, package README content, diagnostics references, samples, and release notes.

## README rule

Only the root-level repository `README.md` is allowed.

Do not create additional `README.md` files anywhere else in the repository, including `docs/**`, `public-docs/**`, `eng/`, `samples/`, `tools/**`, or `site/`.

Use named Markdown documents instead, for example:

```text
docs/ENGINEERING.md
docs/PUBLIC-DOCS.md
docs/engineering/command-contract.md
public-docs/getting-started.md
public-docs/nuget/package-readme.md
public-docs/samples/getting-started.md
```

## Index document convention

Every documentation folder under `docs/` may have exactly one index document named `docs/<FOLDER>.md`, where `<FOLDER>` is the folder name in uppercase.

Examples:

```text
docs/ARCHITECTURE.md indexes docs/architecture/
docs/DECISIONS.md indexes docs/decisions/
docs/SPECS.md indexes docs/specs/
docs/MILESTONES.md indexes docs/milestones/
docs/TBPS.md indexes docs/tbps/
docs/WORKFLOWS.md indexes docs/workflows/
docs/GUARDRAILS.md indexes docs/guardrails/
docs/ENGINEERING.md indexes docs/engineering/
docs/RESEARCH.md indexes docs/research/
```

`public-docs/` is governed by `docs/PUBLIC-DOCS.md`; do not create `public-docs/README.md`.

## Public documentation authority

`docs/PUBLIC-DOCS.md` governs:

- public documentation structure;
- public documentation synchronization rules;
- public documentation publication surfaces;
- public documentation ownership.

Public documentation must be user-first, use canonical terminology, explain supported usage, and not duplicate internal specs verbatim.

## Recommended public documentation surfaces

| Surface | Source |
|---|---|
| Root README user sections | `README.md` |
| Getting started docs | `public-docs/getting-started.md` |
| Installation docs | `public-docs/installation.md` |
| Package docs | `public-docs/nuget/` |
| NuGet package README content | `public-docs/nuget/package-readme.md` |
| Public API documentation | `public-docs/api/` |
| Diagnostics reference | `public-docs/diagnostics/` |
| Samples documentation | `public-docs/samples/` |
| Website source content | `public-docs/website/` |
| Release notes | `public-docs/release-notes.md` |
| Versioning policy | `public-docs/versioning.md` |

## Upgrade guide from V4

1. Create `docs/PUBLIC-DOCS.md` and add it to README, AGENTS, Copilot instructions, and `docs/RESEARCH.md`.
2. Create `public-docs/` with getting started, installation, concepts, packages, samples, diagnostics, versioning, release notes, API, diagnostics, NuGet, samples, and website areas.
3. Add public documentation terms to `docs/TERMINOLOGY.md`.
4. Make root README user-first for packages and public APIs.
5. Create `docs/tbps/public-documentation-update.md` and update `docs/TBPS.md`.
6. Update guardrails with public API documentation and synchronization rules.
7. Upgrade engineering guidance to Engineering Guide V4.
8. Add public documentation and release-check workflow specs.
9. Add public documentation impact sections to documentation, milestone implementation, and release issue templates.
10. Make release readiness include package smoke tests, public API validation, samples validation, public documentation validation, and release notes validation.
11. Retain the previous setup guide as historical research.

## Final V5 model

V5 explicitly separates:

```text
Project-internal authority
  docs/

Public consumer-facing source
  public-docs/

Publication mechanisms
  README.md
  NuGet package README
  generated API docs
  website
  release notes
```

The repository should read as a coherent system where `README.md` is the first-contact user and contributor entry point, `docs/*.md` are authoritative internal knowledge indexes, `public-docs/` is the consumer-facing source, and agents are routed through `AGENTS.md` plus `.github/copilot-instructions.md`.
