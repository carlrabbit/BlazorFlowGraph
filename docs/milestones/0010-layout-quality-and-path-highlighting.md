# Milestone 0010: Layout Quality and Path Highlighting

## Status

Implemented (initial slice)

## Milestone Number

0010

## Target Path

```text
docs/milestones/0010-layout-quality-and-path-highlighting.md
```

## Goal

Improve the practical readability and inspection value of BlazorFlowGraph diagrams by introducing better automatic layouts, explicit layout strategy selection, layout stability rules for incremental updates, and path highlighting for upstream, downstream, and selected-node relationship inspection.

The milestone must make dataflow diagrams easier to read and navigate without changing the core product direction.

BlazorFlowGraph remains:

- a semantic dataflow visualization framework;
- not a general-purpose diagram editor;
- not a visual modeling tool;
- not a whiteboard;
- not a browser-only application.

The outcome should be a user-visible improvement in graph comprehension while preserving the existing architectural split:

```text
.NET / Blazor side
  owns semantic model, snapshots, diffs, validation, and host integration

TypeScript / browser side
  owns layout, rendering, reconciliation, viewport state, interaction state, and visual inspection behavior
```

## Background

BlazorFlowGraph is built around semantic dataflow visualization. The project direction is to represent dataflow-like systems as structured semantic graph snapshots and diffs from .NET, then render and interact with those graphs in the browser through a focused TypeScript visualization engine.

The current project direction intentionally avoids generic diagram editing. The graph component should visualize, inspect, select, search, group, and highlight. Editing remains the responsibility of the consuming application.

Milestone 0010 is the first milestone focused primarily on diagram readability and inspection.

It should establish the foundation for:

- a stable layout contract;
- a useful default layout for dataflow diagrams;
- deterministic fallback layouts;
- incremental layout stability across graph updates;
- path highlighting as an inspection feature;
- representative layout and highlighting scenarios for ongoing visual iteration.

This milestone is implementation work, not only documentation alignment.

## Relation to Repository Standards

This milestone document must be updated to meet the repository milestone-document requirements before or during implementation.

At minimum, implementation must review and update:

```text
docs/MILESTONES.md
```

so that milestone 0010 is indexed consistently with the repository documentation model.

## Implementation Status (Current Slice)

This milestone now includes:

- layout strategy selection (`Grid`, `Layered`, `ManualHints`) in the TypeScript layout contract;
- layout direction support (`LeftToRight`, `TopToBottom`);
- manual hint placement and optional prior-position preservation for incremental stability;
- deterministic between-node path traversal utilities;
- path-highlight visual-state derivation for upstream, downstream, and between modes;
- host rendering support for path highlighting in themed SVG output;
- Blazor host parameters for layout strategy and direction pass-through.

If repository standards require additional milestone metadata, authority sections, document contracts, status conventions, public documentation impact sections, or validation sections, this document must be updated accordingly.

## Authority

This document is authoritative for:

- the implementation scope of milestone 0010;
- the non-goals of milestone 0010;
- the required layout and path-highlighting outcomes for milestone 0010;
- the acceptance criteria for milestone 0010;
- the validation expectations for milestone 0010.

This document is not authoritative for:

- global repository structure;
- general engineering command contracts;
- public documentation governance;
- TypeScript tooling policy;
- .NET packaging and release rules;
- visual identity or final visual design language;
- semantic graph behavior outside the layout and path-highlighting scope.

## Required Reading

Before implementation, read:

```text
README.md
AGENTS.md
docs/TERMINOLOGY.md
docs/ARCHITECTURE.md
docs/SPECS.md
docs/DECISIONS.md
docs/GUARDRAILS.md
docs/ENGINEERING.md
docs/MILESTONES.md
docs/RESEARCH.md
docs/research/project-setup-guide-v5.md
docs/research/engineering-guide-v4.md
```

Also read any existing architecture, specs, decisions, guardrails, engineering documents, and public documentation that define:

- graph snapshots;
- graph diffs;
- renderer contracts;
- layout behavior;
- viewport behavior;
- selection behavior;
- graph interaction events;
- TypeScript browser engine structure;
- Blazor interop boundaries;
- samples and representative scenarios.

If a referenced document does not yet exist, implementation must not invent unrelated structure. Create only the minimum directly required document updates for this milestone, or record the missing document as follow-up work.

## Definitions

### Layout

The process that assigns visual positions to graph nodes and, when applicable, edge routing hints or anchor information.

Layout is a visualization concern.

The semantic model may provide hints, grouping, ranking, direction, or preferred placement metadata, but the browser visualization engine owns actual layout calculation and rendering placement.

### Layout Strategy

A named layout algorithm or placement mode selected through renderer configuration or graph view options.

Examples:

```text
Layered
Grid
ManualHints
```

### Layout Direction

The primary flow direction used by directional layout strategies.

Required directions for this milestone:

```text
LeftToRight
TopToBottom
```

### Layout Stability

The property that unchanged graph elements avoid unnecessary visual movement across incremental updates.

Layout stability does not require perfect incremental graph layout, but it does require explicit behavior that prevents avoidable viewport and node-position churn.

### Path Highlighting

A visual inspection mode that emphasizes graph relationships related to one or more nodes while dimming unrelated graph elements.

Path highlighting is related to selection but must not be identical to selection.

A node can be selected without path highlighting. A path can be highlighted as an inspection state.

## User-Facing Outcomes

After this milestone, a user should be able to:

- render a typical dataflow graph with a readable default layout;
- choose between at least a layered layout and a deterministic fallback layout;
- configure the primary layout direction;
- update a graph without unnecessary visual jumping;
- inspect upstream dependencies of a node;
- inspect downstream dependents of a node;
- inspect a direct or computed path between two selected nodes where supported;
- clear highlighting without losing selection;
- view representative sample scenarios that demonstrate the supported layout and highlighting behavior.

## Non-Goals

This milestone must not implement or require:

- generic diagram editing;
- drag-and-drop graph authoring;
- persistent manual diagram editing as a core feature;
- arbitrary whiteboard behavior;
- final visual identity or theme finalization;
- advanced edge routing with full obstacle avoidance;
- pixel-perfect graph layout;
- nested compound graph layout beyond existing grouping support;
- exhaustive all-path enumeration for large graphs;
- semantic graph query language;
- weighted semantic path scoring;
- package release readiness work unless already required by the repository validation gate;
- unrelated repository setup upgrades;
- unrelated public documentation foundation work;
- GitHub Pages setup;
- Playwright adoption unless already part of the repository and directly required by existing validation.

Animations may be added only if they are small, optional, and do not define milestone completion.

## Scope

### 1. Layout Contract

Define or update the internal layout contract used by the TypeScript/browser visualization engine.

The contract must define:

- layout input shape;
- layout output shape;
- node identity requirements;
- edge identity requirements;
- node size representation;
- optional layout hints;
- optional group or rank hints if already part of the graph model;
- layout direction;
- layout strategy selection;
- prior layout state input for stability;
- layout result diagnostics or failure state;
- behavior when layout cannot place all nodes.

The contract must avoid giving semantic authority to the TypeScript layout layer. The browser engine may use semantic metadata as hints, but it must not become the source of semantic truth.

The contract should be stable enough for later layout providers or third-party layout adapters, but it must not over-abstract beyond the strategies implemented in this milestone.

### 2. Layout Strategies

Implement or expose a minimal layout strategy model.

Required strategies:

```text
Layered
Grid
ManualHints
```

#### Layered

The default layout strategy for dataflow diagrams.

The layered layout should:

- support left-to-right direction;
- support top-to-bottom direction;
- place related nodes into directional layers where practical;
- handle branching;
- handle merging;
- avoid obvious node overlap;
- produce useful output for small and medium graphs;
- remain deterministic for the same input and options.

The implementation may be simple. It does not need to match Graphviz, ELK, Dagre, or any external graph layout engine.

If an external layout library is introduced, it must be isolated behind a small adapter and must not leak into the semantic graph model.

#### Grid

A deterministic fallback and debugging layout.

The grid layout should:

- place nodes predictably;
- avoid overlap;
- require minimal graph assumptions;
- work even when graph structure is cyclic, disconnected, or incomplete;
- be useful for debugging layout-independent rendering issues.

#### ManualHints

A placement mode that honors explicit positions where available.

ManualHints should:

- use provided node positions when present;
- provide deterministic fallback placement for nodes without positions;
- avoid treating manual positions as semantic truth;
- preserve compatibility with future user-controlled position hints.

ManualHints is not full diagram editing.

### 3. Layout Direction

Support at least:

```text
LeftToRight
TopToBottom
```

The default direction should be:

```text
LeftToRight
```

unless existing project documentation or implementation establishes a different default.

The direction option must be part of documented layout configuration.

### 4. Layout Stability Across Updates

The implementation must support basic stability across graph diffs or successive graph snapshots.

Required stability rules:

- unchanged nodes should keep previous positions when practical;
- selected nodes should not move unnecessarily;
- newly added nodes should appear near related existing nodes when practical;
- removed nodes should not cause unrelated global reshuffling where avoidable;
- viewport state should not reset after graph updates unless explicitly requested;
- highlighted or selected graph context should remain inspectable after relayout when related elements still exist.

This milestone does not require a mathematically optimal incremental layout algorithm.

It does require clear best-effort stability behavior and tests for the graph/layout state utilities that make this possible.

### 5. Path Highlighting Model

Add a path highlighting model that is distinct from selection.

Required conceptual model:

```ts
type PathHighlightMode =
  | "none"
  | "upstream"
  | "downstream"
  | "between";

interface PathHighlightState {
  mode: PathHighlightMode;
  sourceNodeId?: string;
  targetNodeId?: string;
}
```

The exact implementation may use repository naming conventions, but it must preserve these concepts:

- no path highlight;
- upstream highlight from a source node;
- downstream highlight from a source node;
- path highlight between a source node and target node.

### 6. Path Highlighting Behavior

Implement path highlighting for directed graph relationships.

Required behavior:

- upstream highlighting emphasizes nodes and edges that can reach the source node;
- downstream highlighting emphasizes nodes and edges reachable from the source node;
- between highlighting emphasizes a path or paths between source and target when supported;
- unrelated nodes and edges can be visually dimmed;
- highlight state can be cleared;
- clearing highlight does not clear selection;
- selection can exist without path highlighting;
- path highlighting must tolerate missing nodes, removed nodes, disconnected graphs, and cycles.

For `between` mode, the minimum required implementation is one deterministic path between the selected source and target, preferably shortest by edge count.

All-path enumeration is explicitly out of scope for this milestone.

### 7. Graph Traversal Utilities

Implement or update graph traversal utilities needed by path highlighting.

Required utilities should cover:

- upstream traversal;
- downstream traversal;
- deterministic path finding between two nodes;
- cycle-safe traversal;
- disconnected graph behavior;
- missing node behavior;
- deterministic ordering for stable tests and predictable UI behavior.

Traversal utilities should be tested independently from rendering where practical.

### 8. Visual Treatment

The milestone must define and implement a minimal visual treatment for highlighted and unrelated graph elements.

Required visual states:

```text
normal
highlighted
dimmed
selected
```

The implementation must ensure that:

- highlighted paths are visually distinct from normal graph elements;
- unrelated graph elements are visibly deemphasized during path highlighting;
- selected nodes remain identifiable while path highlighting is active;
- path direction remains understandable through existing edge direction rendering or a minimal enhancement.

This milestone must not finalize visual identity.

If the repository already has design-token or theme infrastructure, use it. If not, keep visual treatment minimal and localized.

### 9. Interaction Surface

Expose path highlighting through the interaction model.

Required interaction capabilities:

- highlight upstream for a node;
- highlight downstream for a node;
- highlight between two nodes where supported;
- clear path highlighting.

The exact UI can be minimal.

Acceptable implementations include:

- context menu actions;
- keyboard-modified selection;
- debug/sample controls;
- explicit API calls from the Blazor host;
- inspector controls in the sample page.

The interaction model must not require permanent editing UI.

### 10. Blazor Integration

Expose the required layout and path highlighting configuration through the Blazor component boundary if the current implementation has such a boundary.

The .NET side should be able to:

- configure layout strategy;
- configure layout direction;
- request path highlighting state or receive highlight interaction events, depending on the existing architecture;
- receive relevant interaction events without owning browser rendering mechanics.

Do not move layout calculation to .NET as part of this milestone.

### 11. Representative Scenarios

Add or update a representative sample/debug page that demonstrates this milestone.

Required scenarios:

- simple linear flow;
- branching flow;
- merging flow;
- diamond dependency;
- fan-in;
- fan-out;
- cyclic graph;
- disconnected graph;
- graph with long labels;
- graph with inserted node;
- graph with removed node;
- graph with selected node;
- graph with upstream highlight;
- graph with downstream highlight;
- graph with between-node highlight;
- grid fallback layout;
- manual hints layout.

The page may be internal, sample-only, or debug-oriented depending on existing repository structure.

The page should make it easy to compare layout and highlighting behavior without manually constructing graph data.

### 12. Documentation

Update relevant internal documentation.

At minimum, review and update:

```text
docs/MILESTONES.md
docs/SPECS.md
docs/ARCHITECTURE.md
docs/TERMINOLOGY.md
docs/GUARDRAILS.md
```

Update only documents affected by this milestone.

Documentation must clearly distinguish:

- semantic graph truth;
- layout hints;
- layout calculation;
- renderer state;
- selection state;
- path highlighting state.

If public documentation already exists by the time this milestone is implemented, review and update relevant `public-docs/` material when the behavior is user-facing.

If public documentation does not yet exist, record public documentation updates as follow-up work unless repository standards require creating them immediately.

### 13. Tests

Add fast tests for layout and graph traversal behavior where practical.

Required test coverage:

- layered layout produces deterministic output for the same input;
- grid layout avoids overlapping nodes for representative small graphs;
- manual hints are honored where provided;
- layout direction affects placement;
- unchanged nodes can preserve prior positions where stability rules apply;
- upstream traversal is correct;
- downstream traversal is correct;
- between-path traversal is deterministic;
- traversal handles cycles;
- traversal handles disconnected graphs;
- traversal handles missing nodes gracefully;
- path highlight state can be cleared independently from selection state.

Rendering-specific tests should remain minimal unless the repository already has an established browser rendering test strategy.

Do not introduce slow, brittle visual tests as the default validation path.

## Required Design Decisions

Implementation must resolve and document the following decisions if they are not already decided:

### Decision 1: Layout Provider Boundary

Decide the exact boundary between:

- graph input model;
- layout input model;
- layout provider;
- renderer;
- viewport state;
- Blazor interop.

The decision must preserve the architecture principle that .NET owns semantics and TypeScript owns layout/rendering.

### Decision 2: Layout Strategy Naming

Confirm final names for layout strategies.

Recommended names:

```text
Layered
Grid
ManualHints
```

Use repository naming conventions.

### Decision 3: Layout State Persistence

Decide where previous layout state is stored.

Acceptable options include:

- renderer state;
- graph view state;
- explicit layout state cache keyed by node id;
- host-provided previous positions.

The chosen design must support stability across updates.

### Decision 4: Path Highlight State Ownership

Decide whether path highlighting state is:

- fully browser-owned;
- host-controlled;
- browser-owned with host notification;
- host-controlled with browser rendering.

The decision must preserve the distinction between selection and highlighting.

### Decision 5: Between-Path Semantics

Decide whether `between` mode highlights:

- one shortest path;
- one deterministic path;
- all shortest paths;
- all paths up to a limit.

For milestone 0010, prefer one deterministic shortest path.

## Implementation Plan

### Phase 1: Document Existing State

Review existing code and documents for:

- graph model;
- renderer model;
- layout behavior;
- selection behavior;
- viewport behavior;
- sample/debug pages;
- TypeScript package structure;
- Blazor component boundary.

Record only necessary updates in existing docs. Do not create broad unrelated documentation.

### Phase 2: Define Layout and Highlighting Contracts

Add or update TypeScript contract types for:

- layout strategy;
- layout direction;
- layout input;
- layout result;
- layout hints;
- path highlight mode;
- path highlight state;
- visual state derivation.

Update .NET-facing contracts only if they are part of the existing public or interop model.

### Phase 3: Implement Layout Strategies

Implement:

- layered layout;
- grid layout;
- manual-hints layout.

Keep algorithms deterministic.

Prefer small, testable functions.

If an external layout dependency is used, isolate it behind an adapter and document the dependency rationale.

### Phase 4: Implement Stability Rules

Add previous-position or layout-state support sufficient to preserve unchanged node positions where practical.

Ensure graph updates do not reset viewport state unless explicitly requested.

### Phase 5: Implement Traversal and Path Highlighting

Add traversal utilities and highlight-state derivation.

Implement:

- upstream highlight;
- downstream highlight;
- between highlight;
- clear highlight.

Keep traversal cycle-safe and deterministic.

### Phase 6: Integrate Visual States

Map highlight state to renderable visual states.

Ensure normal, highlighted, dimmed, and selected states can coexist predictably.

### Phase 7: Add Representative Scenarios

Add or update sample/debug scenario data and UI controls.

The sample must demonstrate the required layout and path highlighting scenarios.

### Phase 8: Tests and Validation

Add fast tests for layout and traversal utilities.

Run the repository validation commands.

Fix failures or document any blocked validation with exact command and failure summary.

### Phase 9: Documentation and Index Updates

Update milestone index and directly affected docs.

At minimum:

```text
docs/MILESTONES.md
```

must reference this milestone when the document is added to the repository.

## Public Documentation Impact

This milestone affects user-visible behavior.

If `docs/PUBLIC-DOCS.md` and `public-docs/` exist when this milestone is implemented, review and update public documentation surfaces that describe:

- graph layout;
- layout options;
- path inspection;
- selection and highlighting;
- samples;
- component usage.

Likely affected public documentation surfaces:

```text
README.md
public-docs/getting-started.md
public-docs/concepts.md
public-docs/samples.md
public-docs/api/
public-docs/guides/
```

If public documentation does not yet exist, record the required public documentation updates as follow-up work unless repository standards require immediate creation.

## Validation Commands

Run the normal implementation validation command:

```sh
./eng/check.sh
```

If relevant scripts exist and are fast enough for the repository’s current command contract, also run:

```sh
./eng/samples.sh
./eng/public-docs.sh
```

Do not run release validation unless this milestone is explicitly combined with release work:

```sh
./eng/release-check.sh <version>
```

## Acceptance Criteria

### Layout Contract

- [ ] A documented layout contract exists or the existing contract is updated.
- [ ] The contract separates semantic graph data from visual layout state.
- [ ] The contract supports layout strategy selection.
- [ ] The contract supports layout direction.
- [ ] The contract supports optional layout hints.
- [ ] The contract supports previous layout state or an equivalent stability input.
- [ ] Layout failure or partial layout behavior is defined.

### Layout Strategies

- [ ] `Layered` layout exists.
- [ ] `Grid` layout exists.
- [ ] `ManualHints` layout exists.
- [ ] The default layout is suitable for dataflow diagrams.
- [ ] Layout output is deterministic for the same graph and options.
- [ ] Layout avoids obvious node overlap for representative small and medium graphs.
- [ ] Layout supports `LeftToRight`.
- [ ] Layout supports `TopToBottom`.

### Layout Stability

- [ ] Unchanged nodes preserve previous positions when practical.
- [ ] Selected nodes avoid unnecessary movement when practical.
- [ ] Newly inserted nodes are placed near related nodes when practical.
- [ ] Removed nodes do not force avoidable global reshuffling.
- [ ] Viewport state is not reset after ordinary graph updates.
- [ ] Stability behavior is covered by tests or documented representative scenarios.

### Path Highlighting

- [ ] Path highlighting state is distinct from selection state.
- [ ] `none` highlight mode is supported.
- [ ] `upstream` highlight mode is supported.
- [ ] `downstream` highlight mode is supported.
- [ ] `between` highlight mode is supported.
- [ ] Highlight state can be cleared without clearing selection.
- [ ] Missing nodes are handled gracefully.
- [ ] Cycles are handled without infinite traversal.
- [ ] Disconnected graphs are handled gracefully.

### Traversal Utilities

- [ ] Upstream traversal is implemented and tested.
- [ ] Downstream traversal is implemented and tested.
- [ ] Deterministic between-node path finding is implemented and tested.
- [ ] Traversal ordering is deterministic.
- [ ] Traversal utilities do not depend on rendering state.

### Visual Behavior

- [ ] Highlighted nodes and edges are visually distinct.
- [ ] Unrelated nodes and edges can be dimmed.
- [ ] Selected nodes remain identifiable while path highlighting is active.
- [ ] Path direction remains understandable.
- [ ] Visual treatment is minimal and does not finalize the visual identity.

### Interaction and Integration

- [ ] Users can trigger upstream highlighting.
- [ ] Users can trigger downstream highlighting.
- [ ] Users can trigger between-node highlighting where supported.
- [ ] Users can clear path highlighting.
- [ ] Blazor integration exposes layout configuration where applicable.
- [ ] Blazor integration does not move layout calculation to .NET.

### Representative Scenarios

- [ ] Linear flow scenario exists.
- [ ] Branching flow scenario exists.
- [ ] Merging flow scenario exists.
- [ ] Diamond dependency scenario exists.
- [ ] Fan-in scenario exists.
- [ ] Fan-out scenario exists.
- [ ] Cyclic graph scenario exists.
- [ ] Disconnected graph scenario exists.
- [ ] Long-label scenario exists.
- [ ] Inserted-node update scenario exists.
- [ ] Removed-node update scenario exists.
- [ ] Selected-node scenario exists.
- [ ] Upstream-highlight scenario exists.
- [ ] Downstream-highlight scenario exists.
- [ ] Between-node-highlight scenario exists.
- [ ] Grid fallback scenario exists.
- [ ] Manual-hints scenario exists.

### Documentation

- [ ] `docs/MILESTONES.md` indexes milestone 0010.
- [ ] Directly affected specs are updated.
- [ ] Directly affected architecture documents are updated.
- [ ] Directly affected terminology is updated.
- [ ] Directly affected guardrails are updated.
- [ ] Public documentation impact is reviewed if public docs exist.
- [ ] No non-root README files are created.

### Validation

- [ ] `./eng/check.sh` passes.
- [ ] `./eng/samples.sh` passes if applicable.
- [ ] `./eng/public-docs.sh` passes if applicable.
- [ ] Any skipped validation is documented with a reason.

## Repository Review Checks

Before completing the milestone, run or manually verify the equivalent of:

```sh
test -f docs/milestones/0010-layout-quality-and-path-highlighting.md
test -f docs/MILESTONES.md
find . -path ./.git -prune -o -name README.md -print
```

The README check must show only:

```text
./README.md
```

unless the repository standards have explicitly changed.

## Follow-Up Work

The following work should not be included unless it becomes directly necessary:

- advanced edge routing;
- animated layout transitions;
- all-path highlighting;
- semantic path queries;
- weighted path scoring;
- large-graph virtualization beyond existing renderer requirements;
- final visual identity;
- theme editor integration;
- Playwright visual regression tests;
- release readiness work unrelated to this milestone.

Possible future milestones may cover:

- advanced layout providers;
- compound/grouped graph layout;
- large-graph navigation and minimap;
- visual identity finalization;
- advanced path analysis;
- user-controlled layout hints;
- public documentation expansion for 1.0.
