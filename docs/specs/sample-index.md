# Goal

Define the authoritative behavior for the static SampleIndex application that discovers and links all registered samples.

# Scope

This spec governs sample index location, registry-driven rendering, and URL construction behavior for local and workspace environments.

# Non-Goals

- production portal UX
- dynamic health checks
- reverse proxy discovery

# Terminology

- **SampleIndex app**: the static Blazor sample hosted at `samples/SampleIndex`.
- **URL resolver**: a centralized browser-side function that builds sample URLs from current location + sample port.

# Invariants

- the SampleIndex app MUST live under `samples/SampleIndex`
- SampleIndex MUST render entries from `samples/SAMPLES.json`
- SampleIndex MUST NOT hardcode one absolute host like `localhost`
- URL construction MUST be centralized in one module/function

# Behavioral Rules

- SampleIndex MUST show at least sample name, description, project path, port, and open link
- URL resolution MUST preserve current protocol
- URL resolution MUST derive host from current browser location
- URL resolution MUST map to each sample's configured port and path
- workspace-specific heuristics (for example Codespaces host substitutions) MUST remain isolated in the same URL resolver module

# Inputs

- sample registry content from `samples/SAMPLES.json` (served to SampleIndex as static content)
- current browser location (`window.location`)

# Outputs

- rendered table/list of registered samples
- computed sample links suitable for localhost and forwarded-port workspace hosts

# Failure Semantics

- if registry content cannot be loaded, SampleIndex MUST show a clear error message
- URL resolver errors MUST not crash page rendering; unresolved entries should remain visible with error state

# Validation

- run SampleIndex and verify it lists every registry sample
- verify links resolve correctly from localhost and forwarded workspace hosts
- ensure URL creation logic remains centralized in one JavaScript module

# Related Architecture

- [`../architecture/system-overview.md`](../architecture/system-overview.md)

# Related Decisions

- no ADR required currently; this behavior is scoped to development sample discoverability

# Authority

This document is authoritative for SampleIndex behavior and URL-resolution constraints.

# Document Contract

Update this document when SampleIndex rendering requirements or URL resolution strategy changes. Keep it synchronized with `samples/SampleIndex/`, `samples/SAMPLES.json`, and [`sample-workspace-launch.md`](sample-workspace-launch.md).
