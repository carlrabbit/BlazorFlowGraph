# Goal

Define the limited hosting role of Blazor within the repository architecture.

# Responsibilities

- host the graph component surface inside .NET applications
- coordinate dependency injection and runtime bootstrap
- bridge snapshots and diffs to the browser runtime through JS interop
- provide sample and integration surfaces that demonstrate supported usage

Public package/release boundaries are specified in:

- [`../specs/package-and-release-contract.md`](../specs/package-and-release-contract.md)

# Constraints

- Blazor components must remain thin
- Blazor must not own graph layout, reconciliation, or rendering logic
- integration paths should stay aligned with the packaged browser bundle and supported services
- sample applications should demonstrate the supported integration path without adding conflicting web SDK dependencies
- package consumers should only depend on published library packages and static web assets, not test/sample internals
- coordinated multi-view surfaces (overview/minimap + detail) must compose shared runtime graph data instead of duplicating semantic graph state
- viewport synchronization between hosted views must flow through semantic runtime/navigation contracts

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
- [`../specs/viewport-and-navigation.md`](../specs/viewport-and-navigation.md)
- [`../specs/multi-view-navigation.md`](../specs/multi-view-navigation.md)
- [`../specs/minimap-overview.md`](../specs/minimap-overview.md)
