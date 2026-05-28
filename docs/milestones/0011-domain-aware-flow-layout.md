# Milestone 0011: Domain-Aware Flow Layout

## Status

Proposed

## Milestone Number

0011

## Target Path

```text
docs/milestones/0011-domain-aware-flow-layout.md
```

## Goal

Implement domain-aware layout behavior for BlazorFlowGraph so consumers can tell the renderer which graph relationships are semantically central and which relationships are supporting context.

The milestone introduces layout profiles, primary-flow extraction, layout roles, importance hints, and secondary-context placement. The result should make dataflow diagrams with split and converging processing paths substantially easier to read while preserving the renderer as a reusable graph visualization engine rather than a domain-specific application.

The central user-facing outcome is:

```text
A consumer can enable a dataflow-oriented layout profile, mark one or more edge types as the primary flow, and render a graph where the dominant flow remains visually central while secondary sources and relationships are placed as supporting context.
```

This milestone is implementation work, not only documentation alignment.

## Background

Milestone 0010 establishes general layout quality and path highlighting. It focuses on making graph layout and path inspection broadly useful.

Milestone 0011 builds on that foundation by adding semantic layout influence. BlazorFlowGraph has a semantic .NET backend and a TypeScript browser renderer. That architecture allows the backend to describe domain meaning without forcing the renderer to hard-code one application domain.

The concrete use case motivating this milestone is a dataflow visualization with:

- a small number of datasource nodes;
- processing nodes that split the flow;
- processing nodes that converge the flow later;
- one central edge type that represents the primary dataflow;
- many additional source nodes and secondary connections;
- secondary relationships that should remain visible but should not dominate layout.

The renderer should be able to emphasize the primary flow structurally, not only visually. It should place primary-flow nodes along the main layout spine and attach supporting context near the primary nodes it supports.

## Relation to Repository Standards

This milestone document must be updated to meet the repository milestone-document requirements before or during implementation.

At minimum, implementation must review and update:

```text
docs/MILESTONES.md
```

so that milestone 0011 is indexed consistently with the repository documentation model.

If repository standards require additional milestone metadata, authority sections, document contracts, status conventions, public documentation impact sections, or validation sections, this document must be updated accordingly.

## Authority

This document is authoritative for:

- the implementation scope of milestone 0011;
- the non-goals of milestone 0011;
- the required domain-aware layout behavior for milestone 0011;
- the initial layout profile set for milestone 0011;
- the expected primary-flow and secondary-context placement behavior;
- the acceptance criteria for milestone 0011.

This document is not authoritative for:

- final public API naming beyond the required concepts;
- visual identity or final theme design;
- graph editing behavior;
- persistent manual positioning behavior;
- release packaging policy;
- repository-wide engineering command definitions.

## Document Contract

When this milestone changes, review and update:

- `docs/MILESTONES.md`
- relevant layout specifications under `docs/specs/`
- relevant architecture documents under `docs/architecture/`
- relevant terminology in `docs/TERMINOLOGY.md`
- relevant public documentation under `public-docs/` if layout profiles are user-facing
- `README.md` if first-contact examples or supported feature descriptions change
- sample documentation if representative scenarios are added or changed

## Product Direction Constraints

BlazorFlowGraph remains:

- a semantic dataflow visualization framework;
- not a generic diagram editor;
- not a visual modeling tool;
- not a whiteboard;
- not a browser-only application.

The architectural split remains:

```text
.NET / Blazor side
  owns semantic graph model, snapshots, diffs, validation, and host integration

TypeScript / browser side
  owns layout, rendering, reconciliation, viewport state, interaction state, and visual inspection behavior
```

Domain-aware layout must use explicit semantic hints supplied by the graph model or layout options. The renderer must not infer business meaning from labels, display text, colors, or arbitrary naming conventions.

## User-Facing Outcomes

After this milestone, a consumer should be able to:

- choose a layout profile;
- choose a layout direction;
- identify one or more edge types as the primary flow;
- map domain node types to generic layout roles;
- map domain edge types to generic layout roles;
- assign layout importance where needed;
- render dataflow diagrams where the primary flow is visually central;
- render secondary context without allowing it to dominate rank assignment;
- compare generic layout and dataflow layout on the same representative graph;
- use fallback behavior when domain hints are missing or incomplete.

## Required Layout Profiles

Milestone 0011 must introduce all four initial layout profiles.

```text
generic
dataflow
dependency
hierarchical
```

The profiles may share implementation primitives, but they must exist as selectable profile concepts with documented behavior and fallback rules.

### Generic Profile

The `generic` profile is the neutral baseline layout profile.

Purpose:

- render arbitrary graphs without domain assumptions;
- provide predictable behavior when no semantic hints are available;
- serve as the fallback profile for invalid or incomplete profile configuration.

Expected behavior:

- use the default layout strategy from milestone 0010;
- treat all edges as similarly relevant unless importance is provided;
- avoid relying on node roles or edge roles;
- preserve existing layout stability rules;
- provide deterministic output where practical.

### Dataflow Profile

The `dataflow` profile is optimized for graphs where edges represent movement, transformation, or propagation of data.

Purpose:

- keep the dominant dataflow visually central;
- place datasource/source nodes near the beginning;
- place processing nodes along the primary flow;
- place sink/output nodes near the end;
- preserve split and converge structures;
- place secondary inputs near the primary nodes they support.

Expected behavior:

- use configured primary edge types or primary edge roles to extract the primary-flow subgraph;
- use primary-flow edges for rank assignment before secondary edges;
- place context nodes near their nearest primary-flow attachment point;
- reduce the layout influence of secondary-only connections;
- remain usable when the graph contains cycles by applying documented cycle handling or fallback rules.

### Dependency Profile

The `dependency` profile is optimized for graphs where edges represent depends-on, requires, references, or consumes relationships.

Purpose:

- show dependency direction clearly;
- make root dependencies or required inputs easy to identify;
- make dependents or consumers easy to identify;
- support upstream/downstream reasoning.

Expected behavior:

- use configured dependency edge roles or dependency edge types;
- rank nodes according to dependency direction;
- make shared dependencies readable when many nodes depend on the same source;
- avoid placing low-importance auxiliary references on the main dependency spine;
- use generic fallback when dependency hints are absent.

The implementation must document the selected orientation semantics, for example whether an edge points from dependency to dependent or from dependent to dependency. The profile must not silently reverse user data without documented configuration.

### Hierarchical Profile

The `hierarchical` profile is optimized for parent-child, containment, ownership, or grouping-oriented structures.

Purpose:

- make containment or ownership layers visible;
- support group-like structures;
- arrange root-like nodes before child-like nodes;
- provide a profile for structural diagrams that are not primarily flow or dependency diagrams.

Expected behavior:

- use configured hierarchy edge roles or hierarchy edge types;
- rank nodes by hierarchy depth where practical;
- keep children near parents;
- avoid allowing cross-links to destroy the hierarchy unless explicitly configured;
- use generic fallback when hierarchy hints are absent.

This milestone does not require advanced nested compound graph rendering. The hierarchical profile may initially express hierarchy through rank and proximity rather than true nested containers.

## Core Concepts

### Layout Profile

A layout profile is a named layout behavior optimized for a graph interpretation.

Required initial values:

```text
generic
dataflow
dependency
hierarchical
```

A profile influences ranking, ordering, edge prioritization, and secondary-context placement. A profile must not change the semantic graph.

### Primary Flow

The primary flow is the subgraph formed by edges that represent the dominant relationship for the selected profile.

For the `dataflow` profile, primary-flow edges are commonly edges of type `dataflow` or edges with role `primary-flow`.

### Secondary Context

Secondary context is the set of nodes and edges that are useful for understanding the graph but are not part of the primary flow.

Examples:

- configuration inputs;
- schema inputs;
- metadata connections;
- diagnostic sources;
- monitoring edges;
- reference-data inputs;
- ownership or annotation edges when the selected profile is dataflow.

Secondary context should remain visible but should not dominate layout.

### Layout Role

A layout role maps domain-specific node or edge meaning to generic layout behavior.

Examples:

```text
Datasource -> source
Processing step -> processor
Export/output -> sink
Schema/config/rules -> context
Dataflow edge -> primary-flow
Configuration edge -> dependency
Ownership edge -> hierarchy
```

### Layout Importance

Layout importance is a numeric or ordinal hint used to prioritize placement, ordering, stability, and visual emphasis.

Importance is a hint. It must not become a hard constraint unless explicitly documented.

## Required Model Capabilities

The graph model or layout options must support the following concepts.

### Layout Profile Selection

The consumer must be able to request one of:

```text
generic
dataflow
dependency
hierarchical
```

The renderer must define fallback behavior for:

- missing profile;
- unknown profile;
- profile unsupported by the current renderer version;
- profile configuration that does not match the graph.

### Layout Direction

The layout must support at least:

```text
left-to-right
top-to-bottom
```

The default direction for dataflow diagrams should be documented. The recommended default is `left-to-right`.

### Primary Edge Type Configuration

The consumer must be able to configure one or more edge types as primary for the selected profile.

Example concept:

```json
{
  "layout": {
    "profile": "dataflow",
    "direction": "left-to-right",
    "primaryEdgeTypes": ["dataflow"]
  }
}
```

### Edge Roles

The model must support or be prepared to support edge layout roles.

Initial role concepts:

```text
primary-flow
secondary-flow
dependency
metadata
diagnostic
hierarchy
ownership
```

The implementation may choose a narrower serialized shape if documented, but it must not prevent these concepts from being represented later.

### Node Roles

The model must support or be prepared to support node layout roles.

Initial role concepts:

```text
source
processor
sink
context
group
external
diagnostic
```

The dataflow profile should use these roles when available.

### Importance Hints

The model must support or be prepared to support importance hints for nodes and edges.

Importance may be expressed as numbers, ordinals, or named levels. The implementation must document the chosen representation.

Importance must be optional.

## Suggested TypeScript Contract Shape

The final naming may differ, but the implementation should preserve these concepts.

```ts
type LayoutProfile =
  | "generic"
  | "dataflow"
  | "dependency"
  | "hierarchical";

type LayoutDirection =
  | "left-to-right"
  | "top-to-bottom";

type NodeLayoutRole =
  | "source"
  | "processor"
  | "sink"
  | "context"
  | "group"
  | "external"
  | "diagnostic";

type EdgeLayoutRole =
  | "primary-flow"
  | "secondary-flow"
  | "dependency"
  | "metadata"
  | "diagnostic"
  | "hierarchy"
  | "ownership";

interface GraphLayoutProfileOptions {
  profile?: LayoutProfile;
  direction?: LayoutDirection;
  primaryEdgeTypes?: string[];
  secondaryEdgeTypes?: string[];
  nodeRoles?: Record<string, NodeLayoutRole>;
  edgeRoles?: Record<string, EdgeLayoutRole>;
  nodeImportance?: Record<string, number>;
  edgeImportance?: Record<string, number>;
}
```

The implementation should choose a model that can be serialized from .NET without requiring JavaScript-specific behavior.

## Layout Behavior Requirements

### Primary-Flow Extraction

The layout engine must be able to extract a primary subgraph from:

- configured primary edge types;
- edge roles;
- profile-specific defaults where documented.

For the dataflow profile, configured primary edge types should be the primary mechanism.

Extraction must handle:

- missing primary edge types;
- no matching edges;
- disconnected primary-flow components;
- cycles;
- split structures;
- converge structures.

The behavior for each case must be documented.

### Rank Assignment

Primary-flow edges must influence rank assignment before secondary edges in the dataflow profile.

Secondary edges may influence local placement, but they must not dominate the main flow.

For example, if many metadata/configuration nodes connect to one processor, those nodes should not push the processor far away from the primary flow.

### Split Handling

When a primary flow splits, branches should remain visibly related to the split point.

The layout should prefer:

- shared predecessor near the branch start;
- branch nodes distributed cleanly in the cross-axis;
- branch convergence readable when branches join later;
- minimal avoidable crossings among primary-flow edges.

### Converge Handling

When branches converge, the join node should be placed after its primary-flow dependencies.

The layout should make it clear that multiple branches feed the convergence point.

### Secondary Context Placement

Secondary/context nodes should be placed near the primary node they support.

Placement rules should prefer:

- short secondary edges;
- compact context clusters;
- minimal displacement of primary-flow nodes;
- consistent side placement where practical;
- deterministic ordering where practical.

For left-to-right dataflow layout, secondary context may be placed above or below the primary flow.

For top-to-bottom dataflow layout, secondary context may be placed left or right of the primary flow.

### Stability Across Updates

Domain-aware profiles must preserve the layout stability requirements introduced by milestone 0010.

At minimum:

- unchanged primary-flow nodes should remain stable where practical;
- unchanged context nodes should remain near their prior attachment point;
- adding secondary nodes should not cause unnecessary primary-flow reshuffling;
- removing secondary nodes should not cause unnecessary primary-flow reshuffling;
- selected or inspected nodes should remain visible after relayout where the renderer supports viewport preservation.

### Fallback Behavior

The layout engine must fall back gracefully.

Fallback cases include:

- unknown layout profile;
- missing primary edge type configuration;
- no matching primary edges;
- graph too cyclic for the selected profile algorithm;
- unsupported role values;
- inconsistent role and edge-type hints.

Fallback must not result in an empty layout or runtime failure for valid graph input.

## Representative Scenarios

Milestone 0011 must add representative scenarios for evaluating the layout profiles.

The scenarios should be available in the existing sample/debug surface established for layout and visual iteration.

Required scenarios:

1. simple dataflow: source -> processor -> sink;
2. multiple datasources into one processor;
3. dataflow split into parallel processing branches;
4. dataflow branches converging into one aggregation node;
5. dataflow split and later converge;
6. dataflow with configuration, schema, rules, or reference-data side inputs;
7. dataflow with many low-importance secondary sources;
8. the same graph rendered with `generic` and `dataflow` profiles for comparison;
9. dependency-oriented graph rendered with the `dependency` profile;
10. hierarchy-oriented graph rendered with the `hierarchical` profile;
11. incomplete-hints graph that demonstrates fallback behavior;
12. cyclic graph that demonstrates documented cycle handling or fallback behavior.

The scenarios should be designed to reveal layout problems, not to hide them.

## Public Documentation Impact

This milestone affects public-facing behavior if layout profiles, layout hints, or dataflow layout options are exposed to consumers.

Review and update as applicable:

- `README.md`
- `public-docs/concepts.md`
- `public-docs/getting-started.md`
- `public-docs/samples.md`
- `public-docs/api/`
- `public-docs/guides/`
- `public-docs/release-notes.md`

Public documentation should explain:

- what layout profiles are;
- when to use the dataflow profile;
- how to mark primary edge types;
- what node and edge layout roles mean;
- what fallback behavior users should expect;
- what layout profiles do not guarantee.

## Internal Documentation Impact

Review and update as applicable:

- `docs/TERMINOLOGY.md`
- `docs/SPECS.md`
- relevant specs under `docs/specs/`
- `docs/ARCHITECTURE.md`
- relevant architecture documents under `docs/architecture/`
- `docs/GUARDRAILS.md`
- relevant guardrails under `docs/guardrails/`
- `docs/MILESTONES.md`
- sample and workflow documentation if scenarios or validation commands change

At minimum, terminology should cover:

- layout profile;
- primary flow;
- secondary context;
- layout role;
- layout importance.

## Implementation Scope

### 1. Layout Profile Contract

Define the profile selection contract and the supported initial profile values:

```text
generic
dataflow
dependency
hierarchical
```

The contract must define:

- profile selection;
- default profile;
- fallback behavior;
- direction handling;
- interaction with existing layout strategy selection from milestone 0010.

### 2. Layout Hint Model

Add the layout hint model required to support:

- primary edge types;
- secondary edge types;
- node layout roles;
- edge layout roles;
- node importance;
- edge importance.

The model must remain optional. Existing graphs without layout hints must still render.

### 3. Primary-Flow Extraction

Implement graph utilities that can extract the primary subgraph for a selected profile.

For dataflow, extraction must support configured primary edge types.

For dependency and hierarchical profiles, extraction must support profile-relevant edge roles or configured edge types.

### 4. Dataflow Profile Layout

Implement layout behavior that prioritizes the primary dataflow.

The dataflow profile must:

- rank primary-flow nodes according to direction;
- place source-like nodes near the beginning;
- place sink-like nodes near the end;
- arrange processor-like nodes along the primary flow;
- preserve split and converge readability;
- place secondary context near primary attachment points;
- avoid allowing secondary-only edges to dominate rank assignment.

### 5. Dependency Profile Layout

Implement initial dependency profile behavior.

The dependency profile must:

- rank nodes according to documented dependency direction;
- support dependency edge types or roles;
- make shared dependencies and dependents readable in representative scenarios;
- fall back to generic behavior when dependency hints are absent.

### 6. Hierarchical Profile Layout

Implement initial hierarchical profile behavior.

The hierarchical profile must:

- rank nodes by hierarchy depth where practical;
- keep children near parents;
- support hierarchy or ownership edge types/roles;
- tolerate cross-links;
- fall back to generic behavior when hierarchy hints are absent.

### 7. Generic Profile Baseline

Ensure the generic profile remains available and documented.

The generic profile must:

- avoid domain assumptions;
- remain the fallback profile;
- remain compatible with existing layout behavior from milestone 0010.

### 8. Representative Scenario Page

Add or extend the representative sample/debug page to demonstrate all four profiles.

The page must include scenarios that compare generic and domain-aware layout behavior on the same graph where useful.

### 9. Tests

Add tests for graph utilities and profile behavior.

Tests should cover:

- profile parsing or selection;
- unknown profile fallback;
- primary-flow extraction by edge type;
- primary-flow extraction by edge role;
- disconnected primary-flow components;
- cycle handling or fallback;
- secondary-context association with primary nodes;
- dependency profile orientation behavior;
- hierarchical depth/rank behavior;
- incomplete hint fallback.

Tests should focus on deterministic graph utility behavior and layout invariants rather than pixel-perfect visual snapshots.

### 10. Documentation

Document the behavior in internal and public-facing locations as applicable.

Documentation must include:

- the four layout profiles;
- profile selection behavior;
- primary edge type configuration;
- node and edge layout roles;
- importance hints;
- dataflow-specific rules;
- fallback behavior;
- known limitations.

## Required Design Decisions

The implementation must make and document the following decisions.

### Profile and Strategy Interaction

Define how layout profiles interact with layout strategies from milestone 0010.

Example decision space:

```text
strategy = layered | grid | manual-hints
profile = generic | dataflow | dependency | hierarchical
```

The implementation must specify whether profiles are:

- wrappers around strategies;
- inputs into strategy configuration;
- separate strategy variants;
- or another documented model.

### Edge Direction Semantics

Define edge direction semantics for dependency and hierarchy profiles.

For dependency graphs, document whether an edge means:

```text
A -> B means A depends on B
```

or:

```text
A -> B means A is required by B
```

The same graph must not be interpreted inconsistently across code paths.

### Importance Representation

Define the representation for importance.

Acceptable options include:

- numeric weight;
- ordinal level;
- named enum;
- profile-specific priority.

The selected representation must be serializable from .NET and usable in TypeScript without hidden conversion rules.

### Cycle Handling

Define how each domain-aware profile handles cycles.

The implementation may:

- break cycles for layout only;
- mark cycle edges as secondary for ranking;
- fall back to generic layout;
- use another documented strategy.

It must not fail valid graph rendering solely because a cycle exists.

### Secondary Context Association

Define how secondary context nodes attach to primary-flow nodes.

Possible rules:

- nearest adjacent primary node;
- primary target node;
- primary source node;
- common neighbor;
- explicit attachment hint.

The first implementation may use a simple deterministic rule, but it must be documented.

## Non-Goals

Milestone 0011 does not include:

- manual diagram editing;
- drag-and-drop persisted layout as a core feature;
- arbitrary user-authored layout scripts;
- a plugin API for custom layout engines;
- full constraint-based layout;
- perfect edge routing;
- advanced orthogonal routing;
- full compound graph rendering;
- nested container layout as a required feature;
- automatic semantic inference from labels or colors;
- a generic graph query language;
- timeline, swimlane, or sequence-diagram visualization;
- final visual identity or theme design;
- release packaging work unless required by repository validation;
- GitHub issue creation as part of implementation.

## Validation Commands

Use the repository command contract.

Normal implementation validation:

```sh
./eng/check.sh
```

If public documentation validation exists and is affected:

```sh
./eng/public-docs.sh
```

If representative samples are affected and a sample command exists:

```sh
./eng/samples.sh
```

Do not run release validation unless the implementation task explicitly requires release-readiness validation.

## Acceptance Criteria

- Milestone 0011 is indexed from `docs/MILESTONES.md`.
- The graph model or layout options support layout profile selection.
- The supported initial layout profiles are `generic`, `dataflow`, `dependency`, and `hierarchical`.
- The renderer has documented fallback behavior for missing, unknown, unsupported, or incomplete profile configuration.
- Layout direction supports at least `left-to-right` and `top-to-bottom`.
- The graph model or layout options support primary edge type configuration.
- The graph model or layout options support or are prepared to support node layout roles.
- The graph model or layout options support or are prepared to support edge layout roles.
- The graph model or layout options support or are prepared to support node and edge importance hints.
- The layout engine can extract a primary-flow subgraph from configured edge types or edge roles.
- The dataflow profile uses the primary-flow subgraph to influence rank assignment.
- The dataflow profile places source-like nodes near the beginning of the flow.
- The dataflow profile places sink-like nodes near the end of the flow.
- The dataflow profile arranges processor-like nodes according to primary-flow direction where practical.
- Split structures remain readable in representative dataflow scenarios.
- Converge structures remain readable in representative dataflow scenarios.
- Secondary/context nodes are placed near the primary nodes they support.
- Secondary-only edges do not dominate primary-flow rank assignment in the dataflow profile.
- The dependency profile exists and documents edge direction semantics.
- The dependency profile can prioritize dependency edge types or roles.
- The hierarchical profile exists and can rank or cluster nodes by hierarchy or ownership hints.
- The generic profile remains available and acts as the neutral fallback profile.
- Graphs without domain-aware hints still render through generic fallback behavior.
- Cyclic or partially incompatible graphs use documented cycle handling or fallback behavior.
- Representative scenarios demonstrate all four layout profiles.
- Representative scenarios include the concrete dataflow shape: datasources, processing split, convergence, primary dataflow edge type, and many lower-importance secondary connections.
- Documentation explains layout profiles, primary flow, secondary context, node layout roles, edge layout roles, importance hints, and fallback behavior.
- Tests cover primary-flow extraction and profile fallback behavior.
- Tests cover secondary-context association or placement rules at the graph utility/invariant level.
- Tests cover dependency profile orientation behavior.
- Tests cover hierarchical profile rank or proximity behavior.
- `./eng/check.sh` passes or any failure is documented with the exact failing command and actionable failure summary.

## Follow-Up Work

Possible follow-up milestones may cover:

- advanced edge routing;
- layout animations;
- pinned/manual position persistence;
- layout profile tuning UI;
- visual comparison tooling;
- graph-size performance optimization;
- custom layout adapter API;
- nested compound graph layout;
- richer profile-specific public documentation.
