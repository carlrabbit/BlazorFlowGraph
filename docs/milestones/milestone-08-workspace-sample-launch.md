# Goal

Deliver deterministic workspace sample launching with a registry-backed sample index and sample-focused dev-container workflow.

# Scope

- deterministic fixed ports for all sample apps
- central sample registry in `samples/SAMPLES.json`
- static SampleIndex app in `samples/SampleIndex`
- launch-all tooling for concurrent sample startup
- secondary dev-container configuration for sample exploration
- supporting specs and contributor docs

# Non-Goals

- production hosting or deployment
- reverse proxy infrastructure
- sample feature behavior changes unrelated to hosting/launch

# Dependencies

- `docs/specs/sample-port-registry.md`
- `docs/specs/sample-index.md`
- `docs/specs/sample-workspace-launch.md`
- existing sample projects under `samples/`

# Deliverables

- [x] `samples/SAMPLES.json` with deterministic ports and metadata
- [x] fixed launch profiles for each sample app
- [x] `samples/SampleIndex` app that renders registry-driven links
- [x] sample launch scripts for validation and concurrent run
- [x] `.devcontainer/samples/devcontainer.json`
- [x] docs/spec updates and local usage guidance

# Validation

- `dotnet build BlazorFlowGraph.slnx --no-restore --configuration Release`
- `pnpm typecheck` *(currently fails in existing baseline TypeScript package wiring unrelated to this milestone)*
- `pnpm test` *(currently fails in existing baseline TypeScript package wiring unrelated to this milestone)*
- `bash tooling/scripts/validate-samples-registry.sh`
- `bash tooling/scripts/run-samples-all.sh`

# Exit Criteria

- every sample has deterministic fixed port assignment
- sample registry is source of truth for launch metadata
- sample index renders links using current host/origin-derived URL resolution
- all samples can run concurrently from one command without port collisions
- sample-focused dev-container forwards and launches all samples
- durable behavior is documented in specs and indexed in repository docs

# Related Specs

- [`../specs/sample-port-registry.md`](../specs/sample-port-registry.md)
- [`../specs/sample-index.md`](../specs/sample-index.md)
- [`../specs/sample-workspace-launch.md`](../specs/sample-workspace-launch.md)

# Related Decisions

- no ADR changes required for this milestone

# Authority

This milestone sequences implementation for workspace sample launch. Durable behavior remains in the referenced specs.

# Document Contract

Update this document if milestone sequencing, scope, or exit criteria change. Keep roadmap references synchronized in `Milestones.md`.
