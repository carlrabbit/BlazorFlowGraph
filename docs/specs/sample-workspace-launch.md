# Goal

Define the authoritative development-workspace process for building and launching all sample applications concurrently.

# Scope

This spec governs sample launch tooling and sample-focused dev-container integration.

# Non-Goals

- production orchestration
- container orchestration platforms
- reverse proxy infrastructure

# Terminology

- **Sample-all command**: the supported script for launching all samples concurrently.
- **Sample workspace dev container**: secondary dev-container configuration dedicated to sample exploration.

# Invariants

- repository MUST expose one supported command for launching all samples concurrently
- sample-all launch MUST use the sample registry as source of truth
- sample-all launch MUST stop child processes when parent exits
- sample workspace dev container MUST exist separately from default dev container

# Behavioral Rules

- launch tooling MUST validate registry integrity before launching any sample process
- launch tooling MUST fail clearly when a required port is unavailable
- launch tooling MUST build sample projects before running them
- launch tooling MUST start each sample on `http://0.0.0.0:<port>`
- sample workspace dev container MUST forward each assigned sample port
- sample workspace dev container SHOULD auto-open port `5100` (SampleIndex)

# Inputs

- `samples/SAMPLES.json`
- sample launch scripts under `tooling/scripts/`
- `.devcontainer/samples/devcontainer.json`

# Outputs

- concurrently running sample processes bound to deterministic ports
- sample workspace environment with forwarded sample ports and auto-start behavior

# Failure Semantics

- registry validation failure MUST block launch
- unavailable ports MUST block launch with explicit error text
- sample process failure after launch MUST terminate the aggregate run and trigger cleanup of remaining sample processes

# Validation

Run:

```bash
bash tooling/scripts/validate-samples-registry.sh
bash tooling/scripts/run-samples-all.sh
```

Manual checks:

- SampleIndex is reachable on port `5100`
- each listed sample link resolves to its assigned port
- Ctrl+C terminates all launched sample processes

# Related Architecture

- [`../architecture/system-overview.md`](../architecture/system-overview.md)

# Related Decisions

- no ADR required currently; this is operational workspace behavior

# Authority

This document is authoritative for sample-all launch process and sample workspace dev-container launch behavior.

# Document Contract

Update this document when sample launch scripts or sample dev-container behavior changes. Keep it synchronized with `.devcontainer/samples/devcontainer.json`, `tooling/scripts/run-samples-all.sh`, and [`sample-port-registry.md`](sample-port-registry.md).
