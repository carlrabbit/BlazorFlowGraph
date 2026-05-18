# Goal

Define the authoritative contract for deterministic BlazorFlowGraph sample ports.

# Scope

This spec governs sample app port assignment and registry validation for local development, Codespaces, and dev-container workspace launches.

# Non-Goals

- production deployment hosting
- runtime service discovery
- reverse proxy design

# Terminology

- **Sample registry**: `samples/SAMPLES.json`, the machine-readable source of truth for sample metadata and ports.
- **Sample port range**: reserved development range `5100-5199`.

# Invariants

- each sample app MUST have exactly one registry entry in `samples/SAMPLES.json`
- each registry entry MUST declare exactly one fixed HTTP port
- sample ports MUST be unique and within `5100-5199`
- `sample-index` MUST use port `5100`

# Behavioral Rules

- sample registry entries MUST include: `id`, `name`, `description`, `projectPath`, `port`, and `path`
- `projectPath` MUST point to an existing sample `.csproj`
- launch profiles for sample apps MUST bind to `0.0.0.0` on their assigned port
- workspace launch tooling MUST reject duplicate or invalid ports before starting any sample process

# Inputs

- `samples/SAMPLES.json`
- sample project files under `samples/*/*.csproj`
- sample launch settings under `samples/*/Properties/launchSettings.json`

# Outputs

- deterministic per-sample HTTP endpoints
- validation success/failure output from registry validation tooling

# Failure Semantics

Validation MUST fail when:

- required registry fields are missing
- two samples use the same port
- a sample project has no registry entry
- a registry entry points to a missing project file
- a sample port is outside `5100-5199`
- `sample-index` is not assigned to port `5100`

# Validation

Run:

```bash
bash tooling/scripts/validate-samples-registry.sh
```

Validation passes only when registry and sample project topology satisfy all invariants.

# Related Architecture

- [`../architecture/system-overview.md`](../architecture/system-overview.md)

# Related Decisions

- no ADR required currently; deterministic sample hosting is scoped to development workspace behavior

# Authority

This document is authoritative for sample port reservation and sample registry field requirements.

# Document Contract

Update this document when sample registry fields, reserved ranges, or deterministic launch rules change. Keep it synchronized with [`sample-workspace-launch.md`](sample-workspace-launch.md), [`sample-index.md`](sample-index.md), `samples/SAMPLES.json`, and tooling scripts under `tooling/scripts/`.
