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
- detached sample launch state MUST use a stable directory under `/tmp`

# Behavioral Rules

- launch tooling MUST validate registry integrity before launching any sample process
- launch tooling MUST fail clearly when a required sample port is unavailable
- launch tooling MUST build sample projects before running them
- launch tooling MUST support `--detach`, `--dry-run`, and `--log-file PATH`
- launch tooling MUST treat `--detach` as the supported non-blocking sample workspace mode
- launch tooling MUST write one PID file per launched detached sample process
- launch tooling MUST clear stale detached PID files before checking detached state
- launch tooling MUST treat a fully running detached sample set as a successful no-op
- launch tooling MUST fail detached startup when only a partial detached sample set is running and MUST print cleanup guidance
- launch tooling MUST append detached sample output to the configured log file
- launch tooling MUST start each sample on `http://0.0.0.0:<port>` by default
- launch tooling SHOULD allow overriding the bind host for loopback-only local runs
- sample apps MUST NOT redirect HTTP to HTTPS; sample hosting is intentionally HTTP-only
- sample workspace dev container MUST forward each assigned sample port
- sample workspace dev container MUST mark each forwarded sample port as public
- sample workspace dev container MUST call `tooling/scripts/run-samples-all.sh --detach`
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
- unavailable launched sample ports MUST block launch with explicit error text
- sample process failure after launch MUST terminate the aggregate run and trigger cleanup of remaining sample processes
- detached partial-state detection MUST block a second inconsistent detached launch and print cleanup guidance

# Validation

Run:

```bash
bash tooling/scripts/validate-samples-registry.sh
bash tooling/scripts/run-samples-all.sh --dry-run
bash tooling/scripts/run-samples-all.sh
bash tooling/scripts/run-samples-all.sh --detach --log-file /tmp/blazor-flow-graph-samples.log
```

Manual checks:

- SampleIndex is reachable on port `5100`
- each listed sample link resolves to its assigned port
- Ctrl+C terminates all launched sample processes
- a second detached launch exits successfully without starting duplicate sample processes
- stopping one detached sample and re-running `--detach` fails with cleanup guidance instead of starting a second partial set

# Related Architecture

- [`../architecture/system-overview.md`](../architecture/system-overview.md)

# Related Decisions

- no ADR required currently; this is operational workspace behavior

# Authority

This document is authoritative for sample-all launch process and sample workspace dev-container launch behavior.

# Document Contract

Update this document when sample launch scripts or sample dev-container behavior changes. Keep it synchronized with `.devcontainer/samples/devcontainer.json`, `tooling/scripts/run-samples-all.sh`, `Codespace.md`, and [`sample-port-registry.md`](sample-port-registry.md).
