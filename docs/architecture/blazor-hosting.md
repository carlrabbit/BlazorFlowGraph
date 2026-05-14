# Goal

Define the limited hosting role of Blazor within the repository architecture.

# Responsibilities

- host the graph component surface inside .NET applications
- coordinate dependency injection and runtime bootstrap
- bridge snapshots and diffs to the browser runtime through JS interop
- provide sample and integration surfaces that demonstrate supported usage

# Constraints

- Blazor components must remain thin
- Blazor must not own graph layout, reconciliation, or rendering logic
- integration paths should stay aligned with the packaged browser bundle and supported services
- sample applications should demonstrate the supported integration path without adding conflicting web SDK dependencies

# Non-Goals

- becoming the primary rendering runtime
- embedding graph algorithms in Razor components
- duplicating runtime state machines that already exist in TypeScript
- redefining protocol or semantic concerns inside UI components

# Current Surface

- `BlazorFlowGraph.Blazor` — component package and static web assets
- `BlazorFlowGraph.Blazor.Server` — optional DI registration helpers for server hosts
- `samples/` — supported integration examples

# Related Documents

- [`system-overview.md`](system-overview.md)
- [`../integration/guide.md`](../integration/guide.md)
- [`../ai/architecture.md`](../ai/architecture.md)
