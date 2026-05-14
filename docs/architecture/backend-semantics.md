# Goal

Define the responsibilities and constraints of the authoritative .NET semantic and projection runtime.

# Responsibilities

- own semantic models and semantic annotations
- generate deterministic graph projections
- generate deterministic graph diffs
- validate semantic and projection state before it reaches the browser runtime
- persist or serialize view and projection state when required

# Constraints

- semantic models must stay decoupled from visualization DTOs
- projection generation must avoid UI and rendering assumptions
- diff generation must prefer minimal ordered mutation sets
- identifiers must remain stable and deterministic
- protocol contracts must stay independent from Blazor component structure

# Non-Goals

- rendering SVG or DOM output
- owning browser-local interaction state
- executing layout algorithms inside .NET components
- letting Blazor components become semantic orchestration layers

# Current Subsystems

- `BlazorFlowGraph.Semantics` — semantic annotations and extraction primitives
- `BlazorFlowGraph.Projection` — semantic-to-graph projection generation
- `BlazorFlowGraph.Diffing` — graph diff computation
- `BlazorFlowGraph.Protocol` — shared contracts and view state records

# Related Documents

- [`system-overview.md`](system-overview.md)
- [`../protocol/contracts.md`](../protocol/contracts.md)
- [`../decisions/0003-diff-protocol.md`](../decisions/0003-diff-protocol.md)
- [`../ai/protocol.md`](../ai/protocol.md)
