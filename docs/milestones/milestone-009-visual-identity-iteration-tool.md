# Goal

Purpose: create the first implementation slice for designing the default visual identity of BlazorFlowGraph diagrams.

Goal: create a practical iteration tool so the project owner and AI agents can evaluate representative diagram scenarios using editable design tokens and importable/exportable theme drafts without finalizing the production visual design. The milestone is complete when visual identity work can continue from explicit artifacts instead of hidden assumptions.

# Scope

- define an initial renderer-facing visual role and design-token model for diagram themes
- create an interactive sample that renders representative visual scenarios on one page
- support built-in draft themes, token editing, JSON import, and JSON export for theme iteration
- keep theme behavior close to the real renderer so iteration findings are meaningful
- document the milestone, the milestone index, and any directly affected spec, decision, or engineering documents

BlazorFlowGraph is intended to visualize dataflow-like systems. The default visual identity should support comprehension of dataflow structure, incremental updates, selection, grouping, search, and semantic annotations without drifting into decorative graph, dashboard, or node-editor styling.

## Required Reading

Before implementation, read:

- `docs/TERMINOLOGY.md`
- `docs/ARCHITECTURE.md`
- `docs/SPECS.md`
- `docs/MILESTONES.md`
- `docs/ENGINEERING.md`
- `docs/GUARDRAILS.md`
- `docs/guardrails/implementation.md`
- `docs/guardrails/testing.md`
- `docs/guardrails/languages/typescript.md` if present
- `docs/engineering/command-contract.md`
- `docs/engineering/typescript-tools.md` if present
- `docs/engineering/samples.md` if present
- `docs/PUBLIC-DOCS.md` if public documentation is already active
- `docs/research/project-setup-guide-v5.md`
- `docs/research/engineering-guide-v4.md`

## Design Direction

Initial design direction:

```text
Calm technical dataflow diagrams optimized for incremental comprehension.
```

This means:

- diagrams should feel like interactive technical documentation
- the visual hierarchy should favor graph comprehension over decoration
- nodes should be easier to read than edges
- edges should communicate flow without dominating the canvas
- color should primarily encode semantic state and interaction state
- animation should explain incremental changes instead of decorating the UI
- the default identity should remain usable in dense diagrams and during update transitions

Avoid:

- neon graph styles
- excessive gradients
- heavy shadows
- animated edge particles
- dashboard-like visual noise
- large decorative icon sets
- arbitrary category coloring without semantic purpose
- visual language that implies a node editor when the primary goal is visualization

## Conceptual Model

The implementation should separate the semantic graph model from renderer-owned presentation details.

### Semantic Graph Model

Semantic graph data describes domain structure and semantic state, including nodes, edges, groups, ports, labels, annotations, selection, search results, change sets, warnings, and errors. It should not encode exact colors, shadows, font sizes, or animation timings unless that behavior is explicitly documented elsewhere.

### Visual Roles

Required initial visual roles:

- canvas
- node
- node header
- node body
- node metadata
- port
- edge
- edge label
- group
- group label
- annotation
- minimap or overview placeholder, if already present
- selection outline
- focus outline
- search highlight
- change marker

### Interaction States

Required initial interaction states:

- default
- hovered
- selected
- focused
- dimmed
- hidden by filter
- search match
- upstream highlighted
- downstream highlighted

### Change States

Required initial change states:

- added
- changed
- removed
- moved
- relayouted
- stale

### Diagnostic States

Required initial diagnostic states:

- normal
- warning
- error
- unavailable or unresolved

## Theme Token Model

Introduce an initial design-token model for diagram themes. The model should stay simple enough to edit manually, import, export, diff, and discuss in issues or chat. It does not need to be the final public API.

The implementation should define a TypeScript representation similar to the following shape, adapted to repository conventions:

```ts
export interface FlowGraphThemeDraft {
  metadata: {
    format: 'blazor-flow-graph-theme-draft';
    version: 1;
    name: string;
    description?: string;
  };
  color: {
    canvasBackground: string;
    canvasGrid?: string;
    nodeBackground: string;
    nodeBorder: string;
    nodeText: string;
    nodeMutedText: string;
    nodeHeaderBackground?: string;
    groupBackground: string;
    groupBorder: string;
    groupText: string;
    portFill: string;
    portBorder: string;
    edgeDefault: string;
    edgeHighlighted: string;
    edgeMuted: string;
    selection: string;
    focus: string;
    searchMatch: string;
    stateAdded: string;
    stateChanged: string;
    stateRemoved: string;
    stateWarning: string;
    stateError: string;
    stateStale: string;
  };
  size: {
    nodeRadius: number;
    nodeBorderWidth: number;
    nodePaddingX: number;
    nodePaddingY: number;
    portRadius: number;
    edgeWidth: number;
    selectedEdgeWidth: number;
    groupRadius: number;
    hitAreaPadding: number;
  };
  typography: {
    fontFamily: string;
    monoFontFamily: string;
    labelSize: number;
    metadataSize: number;
    groupLabelSize: number;
  };
  motion: {
    updateDurationMs: number;
    selectionDurationMs: number;
    reduceMotion: boolean;
  };
}
```

The implementation may reduce or extend this model if necessary, but any changes should be documented.

## Intermediate Theme Format

Import and export should use plain JSON with:

- a format marker
- a version number
- a theme name
- color tokens
- size tokens
- typography tokens
- motion tokens

The exported JSON should be stable enough to paste into issues, commit as a draft artifact, compare in a normal text diff, and re-import without losing supported values.

## Built-In Draft Themes

The sample should include at least:

- default light draft
- default dark draft
- high-contrast draft

The light theme is the primary identity draft. The dark and high-contrast themes exist to test token-model robustness rather than to declare final design decisions.

## Interactive Sample Requirements

Create an interactive sample page dedicated to visual identity iteration. It should provide:

- a theme switcher for built-in draft themes
- token editing controls
- import from JSON
- export to JSON
- validation feedback for imported JSON
- reset to the selected built-in theme
- all representative design scenarios visible on one page as separate diagrams
- enough layout structure to compare scenarios without page-to-page navigation

The sample may be implemented as a Blazor sample, a TypeScript/browser sample, or another repository-appropriate sample form, but it must respect the current architecture and the engineering command contract defined by `docs/ENGINEERING.md` and `docs/engineering/command-contract.md`.

## Representative Design Scenarios

The sample page must include separate diagrams for the following scenarios:

1. **Small linear dataflow** — validate baseline node, edge, label, and spacing decisions with three to five nodes, directed edges, readable labels, and one metadata field or annotation.
2. **Branching dataflow** — validate edge routing, fan-out, fan-in, and visual balance with one source node, at least two branches, one merge or sink node, and at least one highlighted path.
3. **Grouped subsystem** — validate group background, borders, labels, and hierarchy with one group containing multiple nodes, at least one edge crossing the group boundary, and a visible group label.
4. **Dense graph with search result** — validate dimming, search highlight, label legibility, and clutter behavior with enough nodes and edges to create moderate density plus visible search matches.
5. **Selected node with upstream/downstream highlighting** — validate selection outlines and dependency context with one selected node and clear upstream and downstream path emphasis.
6. **Incremental update state** — validate added, changed, removed, moved, stale, and relayouted states with at least one example of each practical state.
7. **Warning and error annotations** — validate diagnostic color usage and annotation prominence with warning and error states shown alongside normal content.
8. **Dark mode rendering** — validate dark-surface token behavior without hard-coded light-theme assumptions.
9. **High-contrast rendering** — validate accessibility-oriented token coverage, visible focus and selection indicators, and distinguishable warning and error states.

## Editing Experience

The token editor should stay simple and robust. Required behavior:

- edit color tokens as text values at minimum
- edit numeric size tokens
- edit typography tokens as text or select inputs
- edit motion duration tokens
- toggle reduced motion
- validate malformed JSON on import
- reject unsupported format markers or versions
- preserve unknown future fields only if that behavior is explicitly implemented and documented
- display the current theme name

The UI does not need to be polished. It must be useful for iteration.

## Import Behavior

Import should:

- accept JSON text
- parse the JSON
- validate the format marker and version
- validate required sections and basic token types
- apply the imported theme to all scenarios when valid
- show a clear error when invalid

## Export Behavior

Export should:

- serialize the currently active theme as JSON
- include metadata and all supported token groups
- produce stable formatting with predictable indentation
- allow copy/paste from the sample UI

Direct file download is optional. Copyable JSON is sufficient for this milestone.

## Renderer Integration Expectations

Avoid scattering theme constants through rendering code. Expected structure:

- one theme model or type definition
- one or more built-in draft theme definitions
- one theme validation or normalization function
- renderer code that consumes resolved tokens
- representative diagrams that use common rendering paths where practical

The sample should be close enough to the actual renderer that theme iteration remains meaningful. If temporary rendering paths or placeholders are required, document them clearly.

## Accessibility Requirements

This milestone should include basic accessibility-oriented constraints:

- text remains readable at normal zoom for built-in themes
- selected and focused states do not rely on color alone where practical
- warning and error states remain visually distinct
- a reduced-motion token exists and is respected where animation is implemented
- a high-contrast draft theme is available
- keyboard focus representation is considered if the sample exposes focusable diagram elements

This milestone does not require a full WCAG audit.

## Documentation Requirements

Create or update the following documentation as applicable to the repository's current structure:

- this milestone document under `docs/milestones/`
- `docs/MILESTONES.md` to include this milestone
- `docs/specs/default-visual-identity.md` or equivalent visual identity spec
- `docs/decisions/default-diagram-visual-direction.md` or equivalent decision record
- `docs/engineering/samples.md` if the sample structure or command contract changes
- `docs/engineering/typescript-tools.md` if TypeScript tooling is added or changed
- `docs/PUBLIC-DOCS.md` and `public-docs/` only if this milestone affects public behavior or public theming documentation
- `README.md` only if the public or contributor entry point needs to reference the new sample

The visual identity spec should define purpose, authority, design principles, visual roles, interaction states, change states, accessibility requirements, the default theme contract, non-goals, and open decisions.

The decision record should explain why the project starts with a calm technical dataflow style instead of a decorative graph, dashboard, or node-editor style.

## Engineering Requirements

Implementation must follow the repository engineering command contract.

Use existing canonical `eng/` commands rather than inventing ad-hoc commands.

- If a new sample command is needed, document it in the engineering docs and keep it consistent with existing script conventions.
- If sample validation already exists, include this sample in that path where practical.
- If browser testing exists, prefer a small smoke-level validation over broad visual-permutation coverage unless a later milestone explicitly changes that expectation.

## Testing Requirements

Testing should stay focused and lightweight. Required validation:

- theme import accepts a valid exported theme
- theme import rejects malformed JSON
- theme import rejects an unsupported format marker
- theme import rejects an unsupported version
- built-in draft themes conform to the token model
- export produces re-importable JSON
- the representative sample builds through the applicable repository command

Do not create slow visual-regression infrastructure in this milestone unless the repository already has an inexpensive path for it. Do not add sleeps. Do not add broad snapshot suites that make harmless visual iteration painful.

## Suggested Implementation Slices

These slices are sequencing guidance inside the milestone, not separate milestones:

1. documentation and theme model
2. static scenario page
3. theme switching and token editing
4. import and export
5. validation and documentation sync

## Open Questions

- Should the draft theme format become a public API later or remain a design-time tool format?
- Should the final renderer support CSS custom properties, TypeScript object themes, or both?
- Should future visual-regression tests be image-based, DOM/SVG-structure-based, or token-contract-based?
- Which layout algorithms should be represented in the visual identity sample once multiple layouts exist?
- Should graph scenarios be hand-authored fixtures, generated fixtures, or both?

# Non-Goals

This milestone must not attempt to:

- finalize the default production theme
- create a full theme marketplace or plugin system
- build a general-purpose diagram editor
- persist themes to a server
- create user accounts or cloud synchronization
- implement every future renderer feature
- implement a complete accessibility certification process
- introduce a large frontend framework solely for this tool
- turn samples into production application architecture

# Dependencies

- `docs/MILESTONES.md`, `docs/SPECS.md`, `docs/ENGINEERING.md`, and milestone-related guardrails/TBPs
- `docs/research/project-setup-guide-v5.md` for repository documentation structure
- `docs/research/engineering-guide-v4.md` for engineering command expectations
- current renderer, runtime, and sample architecture under `src/` and `samples/`
- milestone completion depends on creating or updating the related spec and decision documents called out in this milestone

# Deliverables

- [ ] an interactive visual identity sample with all required representative scenarios on one page
- [ ] a centralized draft theme model with built-in light, dark, and high-contrast themes
- [ ] token editing plus JSON import, export, and validation behavior for theme drafts
- [ ] renderer and sample styling routed through the token model where practical
- [ ] a visual identity spec and design-direction decision record
- [ ] synchronized milestone and supporting engineering/public documentation updates where applicable

# Validation

Use the canonical engineering commands for milestone validation:

- `./eng/restore.sh`
- `./eng/build.sh`
- `./eng/test.sh`
- `./eng/check.sh`
- `./eng/samples.sh --dry-run` if sample routing or sample validation changes

Record exact command failures when environment prerequisites block validation.

# Exit Criteria

The milestone is complete when all of the following are true:

- an interactive visual identity sample exists
- the sample shows all required representative design scenarios on one page
- the sample supports switching between built-in light, dark, and high-contrast draft themes
- the sample supports editing the current theme tokens
- the sample supports importing a valid JSON theme draft
- the sample supports exporting the current theme as JSON
- exported JSON can be re-imported successfully
- invalid imports produce clear feedback
- theme constants are centralized behind an initial token model
- renderer or sample styling uses the token model rather than unrelated hard-coded values where practical
- a visual identity spec exists or is updated
- a design-direction decision record exists or is updated
- sample and tooling documentation are updated where applicable
- `docs/MILESTONES.md` references this milestone
- applicable fast validation succeeds through the repository command contract, or failures are documented with exact command and reason

# Related Specs

- create or update `docs/specs/default-visual-identity.md` or an equivalent visual identity spec before marking this milestone complete
- review existing specs for any renderer, sample, or theming behavior made durable by this milestone

# Related Decisions

- create or update `docs/decisions/default-diagram-visual-direction.md` or an equivalent decision record before marking this milestone complete

# Authority

This milestone is authoritative for the implementation scope, sequencing guidance, required representative scenarios, and acceptance criteria of the initial visual identity iteration tool.

Durable behavior discovered during this milestone must move into the appropriate spec, decision, workflow, or engineering document before the milestone is treated as complete.

# Document Contract

Update this document when milestone sequencing, scope, dependencies, deliverables, or exit criteria change. Keep it synchronized with `docs/MILESTONES.md`, `Milestones.md`, milestone-related TBPs, and milestone issue forms. Keep detailed implementation guidance here rather than duplicating it into milestone tracking issues.
