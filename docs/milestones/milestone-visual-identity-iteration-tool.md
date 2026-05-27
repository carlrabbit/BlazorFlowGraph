# Milestone: Default Visual Identity Iteration Tool

## Status

Draft milestone.

## Repository Path

Intended repository path after upload:

```text
docs/milestones/default-visual-identity-iteration-tool.md
```

## Purpose

Create the first implementation slice for designing the default visual identity of BlazorFlowGraph diagrams.

The goal of this milestone is not to finalize the visual design. The goal is to create a practical, interactive tool that allows the project owner and AI agents to iterate on the diagram visual identity using concrete representative scenarios, editable design tokens, and import/exportable theme data.

This milestone should produce enough infrastructure to make future visual identity decisions empirical rather than abstract.

## Background

BlazorFlowGraph is intended to visualize dataflow-like systems. The default visual identity should support comprehension of dataflow structure, incremental updates, selection, grouping, search, and semantic annotations. It should not drift into an overly decorative graph style, a dashboard aesthetic, or a generic node editor identity.

The visual identity should be treated as a first-class project concern. It should be described through semantic visual roles and design tokens rather than scattered renderer constants or arbitrary CSS.

The renderer should own browser-side visual behavior. The Blazor side should continue to provide semantic graph state, selection state, annotation state, and update/change state.

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
- `docs/engineering/typescript-tools.md` if present
- `docs/engineering/samples.md` if present
- `docs/PUBLIC-DOCS.md` if public documentation is already active
- `docs/research/project-setup-guide-v5.md`
- `docs/research/engineering-guide-v4.md`

## Authority

This milestone is authoritative for:

- the implementation scope of the initial visual identity iteration tool;
- the required representative visual scenarios for this milestone;
- the initial theme import/export capability required for design iteration;
- the expected milestone acceptance criteria.

This milestone is not authoritative for:

- the final default visual identity;
- final public theming API compatibility;
- final renderer architecture;
- final design token naming if a later specification supersedes it;
- public documentation structure beyond this milestone's direct impact.

## Milestone Goal

Create an interactive sample that displays representative diagram scenarios on one page and allows users to:

- inspect the current theme;
- switch between built-in themes;
- edit visual design tokens;
- import a theme from a simple intermediate format;
- export the current theme to the same simple intermediate format;
- use the exported theme as input for later design discussions and implementation iterations.

The milestone is complete when the project has a working design iteration tool and enough supporting documentation to continue visual identity work without relying on hidden assumptions.

## Non-Goals

This milestone must not attempt to:

- finalize the default production theme;
- create a full theme marketplace or plugin system;
- build a general-purpose diagram editor;
- persist themes to a server;
- create user accounts or cloud synchronization;
- implement every future renderer feature;
- implement a complete accessibility certification process;
- introduce a large frontend framework solely for this tool;
- turn samples into production application architecture.

## Design Direction

The initial design direction is:

```text
Calm technical dataflow diagrams optimized for incremental comprehension.
```

This means:

- diagrams should feel like interactive technical documentation;
- the visual hierarchy should favor graph comprehension over decoration;
- nodes should be easier to read than edges;
- edges should communicate flow without dominating the canvas;
- color should primarily encode semantic state and interaction state;
- animation should explain incremental changes, not decorate the UI;
- the default identity should remain usable in dense diagrams and during update transitions.

Avoid:

- neon graph styles;
- excessive gradients;
- heavy shadows;
- animated edge particles;
- dashboard-like visual noise;
- large decorative icon sets;
- arbitrary category coloring without semantic purpose;
- visual language that implies a node editor when the primary goal is visualization.

## Conceptual Model

The implementation should separate the following concerns.

### Semantic Graph Model

The graph data describes domain structure and semantic state.

Examples:

- nodes;
- edges;
- groups;
- ports;
- labels;
- annotations;
- selection;
- search results;
- change sets;
- warnings;
- errors.

The semantic graph model should not encode presentation details such as exact colors, shadows, font sizes, or animation durations unless there is an explicitly documented reason.

### Visual Roles

Visual roles are renderer-facing categories that map semantic graph data to appearance.

Required initial visual roles:

- canvas;
- node;
- node header;
- node body;
- node metadata;
- port;
- edge;
- edge label;
- group;
- group label;
- annotation;
- minimap or overview placeholder, if already present;
- selection outline;
- focus outline;
- search highlight;
- change marker.

### Interaction States

Required initial interaction states:

- default;
- hovered;
- selected;
- focused;
- dimmed;
- hidden by filter;
- search match;
- upstream highlighted;
- downstream highlighted.

### Change States

Required initial change states:

- added;
- changed;
- removed;
- moved;
- relayouted;
- stale.

### Diagnostic States

Required initial diagnostic states:

- normal;
- warning;
- error;
- unavailable or unresolved.

## Theme Token Model

The milestone should introduce an initial design token model for diagram themes.

The token model should be simple enough to edit manually, import, export, diff, and discuss in issues or chat. It does not need to be the final public API.

The implementation should define a TypeScript representation similar to the following shape, adapted to the actual project conventions:

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

The implementation may reduce or extend this model if necessary, but changes should be documented.

## Intermediate Theme Format

The import/export format should be plain JSON.

Required properties:

- format marker;
- version number;
- theme name;
- color tokens;
- size tokens;
- typography tokens;
- motion tokens.

The exported JSON should be stable enough to:

- paste into an issue;
- commit as a draft file;
- compare in a normal text diff;
- re-import without loss of supported token values.

Example:

```json
{
  "metadata": {
    "format": "blazor-flow-graph-theme-draft",
    "version": 1,
    "name": "Default Light Draft",
    "description": "Initial calm technical light theme draft."
  },
  "color": {
    "canvasBackground": "#f8fafc",
    "canvasGrid": "#e2e8f0",
    "nodeBackground": "#ffffff",
    "nodeBorder": "#cbd5e1",
    "nodeText": "#0f172a",
    "nodeMutedText": "#64748b",
    "groupBackground": "#f1f5f9",
    "groupBorder": "#cbd5e1",
    "groupText": "#334155",
    "portFill": "#ffffff",
    "portBorder": "#64748b",
    "edgeDefault": "#94a3b8",
    "edgeHighlighted": "#2563eb",
    "edgeMuted": "#cbd5e1",
    "selection": "#2563eb",
    "focus": "#0f766e",
    "searchMatch": "#f59e0b",
    "stateAdded": "#16a34a",
    "stateChanged": "#2563eb",
    "stateRemoved": "#dc2626",
    "stateWarning": "#d97706",
    "stateError": "#dc2626",
    "stateStale": "#64748b"
  },
  "size": {
    "nodeRadius": 8,
    "nodeBorderWidth": 1,
    "nodePaddingX": 12,
    "nodePaddingY": 8,
    "portRadius": 4,
    "edgeWidth": 1.5,
    "selectedEdgeWidth": 2.5,
    "groupRadius": 12,
    "hitAreaPadding": 6
  },
  "typography": {
    "fontFamily": "system-ui, sans-serif",
    "monoFontFamily": "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    "labelSize": 13,
    "metadataSize": 11,
    "groupLabelSize": 12
  },
  "motion": {
    "updateDurationMs": 160,
    "selectionDurationMs": 100,
    "reduceMotion": false
  }
}
```

## Built-In Draft Themes

The sample should include at least these built-in themes:

- default light draft;
- default dark draft;
- high contrast draft.

The light theme is the primary identity draft. The dark and high-contrast themes are variants used to test whether the token model is robust.

The built-in themes are not final design decisions.

## Interactive Sample Requirements

Create an interactive sample page dedicated to visual identity iteration.

The sample should provide:

- a theme switcher for built-in draft themes;
- token editing controls;
- import from JSON;
- export to JSON;
- validation feedback for imported JSON;
- reset to selected built-in theme;
- all representative design scenarios visible on one page as separate diagrams;
- enough layout structure to compare scenarios without navigating between pages.

The sample may be implemented as a Blazor sample, a TypeScript/browser sample, or another repository-appropriate sample form, but it must respect the project architecture and engineering guide.

If TypeScript is used, it should remain scoped and should not introduce a heavy frontend stack beyond the repository's chosen tooling.

## Representative Design Scenarios

The sample page must include separate diagrams for the following scenarios.

### 1. Small Linear Dataflow

Purpose:

- validate baseline node, edge, label, and spacing decisions;
- verify that simple diagrams look calm and readable.

Minimum content:

- three to five nodes;
- directed edges;
- readable labels;
- one metadata field or annotation.

### 2. Branching Dataflow

Purpose:

- validate edge routing, fan-out, fan-in, and visual balance.

Minimum content:

- one source node;
- at least two branches;
- one merge or sink node;
- at least one highlighted path.

### 3. Grouped Subsystem

Purpose:

- validate group background, group borders, labels, and hierarchy.

Minimum content:

- one group containing multiple nodes;
- at least one edge crossing the group boundary;
- group label;
- nested metadata or group annotation if supported.

### 4. Dense Graph With Search Result

Purpose:

- validate dimming, search highlight, label legibility, and clutter behavior.

Minimum content:

- enough nodes and edges to create moderate density;
- one or more search matches;
- non-matching content visibly de-emphasized but still understandable.

### 5. Selected Node With Upstream/Downstream Highlighting

Purpose:

- validate selection outlines and dependency context.

Minimum content:

- one selected node;
- upstream path highlight;
- downstream path highlight;
- unrelated nodes dimmed or left neutral according to the current token design.

### 6. Incremental Update State

Purpose:

- validate added, changed, removed, moved, stale, and relayouted visual states.

Minimum content:

- at least one added node;
- at least one changed node;
- at least one removed or disappearing node representation;
- at least one changed edge;
- optional animation or static markers if animation is not yet available.

### 7. Warning And Error Annotations

Purpose:

- validate diagnostic color usage and annotation prominence.

Minimum content:

- at least one warning state;
- at least one error state;
- annotation text or icon placeholder;
- enough surrounding normal content to compare visual weight.

### 8. Dark Mode Rendering

Purpose:

- validate the token model and contrast behavior for dark surfaces.

Minimum content:

- either a dedicated dark-mode scenario or the same scenarios rendered under the dark draft theme;
- no hard-coded light-theme assumptions.

### 9. High Contrast Rendering

Purpose:

- validate accessibility-oriented token coverage.

Minimum content:

- at least one scenario rendered under the high-contrast draft theme;
- visible focus and selection indicators;
- warning and error states distinguishable beyond subtle hue differences where practical.

## Editing Experience

The token editor should be simple and robust.

Required behavior:

- edit color tokens as text values at minimum;
- edit numeric size tokens;
- edit typography tokens as text or select inputs;
- edit motion duration tokens;
- toggle reduced motion;
- validate obvious malformed JSON on import;
- reject unsupported format markers or unsupported versions;
- preserve unknown future fields only if explicitly implemented and documented;
- display current theme name.

The UI does not need to be polished. It must be useful for iteration.

## Import Behavior

Import should:

- accept JSON text;
- parse the JSON;
- validate the format marker;
- validate the version;
- validate required sections;
- validate required token types at a basic level;
- apply the imported theme to all scenarios if valid;
- show a clear error if invalid.

## Export Behavior

Export should:

- serialize the currently active theme as JSON;
- include metadata;
- include all supported token groups;
- produce stable formatting with predictable indentation;
- allow copy/paste from the sample UI.

A direct file download is optional. Copyable JSON is sufficient for this milestone.

## Renderer Integration Expectations

The implementation should avoid scattering theme constants through rendering code.

Expected structure:

- one theme model/type definition;
- one or more built-in draft theme definitions;
- one theme validation or normalization function;
- renderer code consumes resolved tokens;
- representative diagrams use common rendering paths where practical.

The sample should be close enough to the actual renderer that theme iteration is meaningful. If placeholders or temporary rendering paths are used, document them clearly.

## Accessibility Requirements

This milestone should include basic accessibility-oriented constraints:

- text must remain readable at normal zoom for built-in themes;
- selected and focused states must not rely on color alone where practical;
- warning and error states should be visually distinct;
- reduced motion token must exist and be respected where animations are implemented;
- high contrast draft theme must be available;
- keyboard focus representation should be considered if the sample supports focusable diagram elements.

This milestone does not require a full WCAG audit.

## Documentation Requirements

Create or update the following documentation as applicable to the repository's current structure:

- this milestone document after upload under `docs/milestones/`;
- `docs/MILESTONES.md` to include this milestone;
- `docs/specs/default-visual-identity.md` or equivalent visual identity spec;
- `docs/decisions/default-diagram-visual-direction.md` or equivalent decision record;
- `docs/engineering/samples.md` if the sample structure or command contract changes;
- `docs/engineering/typescript-tools.md` if TypeScript tooling is added or changed;
- `docs/PUBLIC-DOCS.md` and `public-docs/` only if this milestone affects public behavior or public theming documentation;
- `README.md` only if the public or contributor entry point needs to reference the new sample.

The visual identity spec should define:

- purpose;
- authority;
- design principles;
- visual roles;
- interaction states;
- change states;
- accessibility requirements;
- default theme contract;
- non-goals;
- open decisions.

The decision record should explain why the project starts with a calm technical dataflow style rather than a decorative graph, dashboard, or node-editor style.

## Engineering Requirements

Implementation must follow the repository engineering command contract.

Use existing canonical commands from `eng/` rather than inventing new ad-hoc commands.

If a new sample command is needed, document it in the engineering docs and keep it consistent with existing script conventions.

If the repository already has sample validation, include this sample in that validation path where practical.

If browser testing exists, do not add broad end-to-end coverage for all visual permutations. Prefer a small smoke-level validation unless explicitly required by a later milestone.

## Testing Requirements

Testing should be focused and lightweight.

Required tests or validation:

- theme import accepts a valid exported theme;
- theme import rejects malformed JSON;
- theme import rejects unsupported format marker;
- theme import rejects unsupported version;
- built-in draft themes conform to the token model;
- export produces re-importable JSON;
- representative sample builds through the applicable repository command.

Do not create slow visual regression infrastructure in this milestone unless the repository already has such infrastructure and it can be used cheaply.

Do not add sleeps to tests.

Do not add broad snapshot tests that make harmless visual iteration painful.

## Acceptance Criteria

The milestone is complete when all of the following are true:

- an interactive visual identity sample exists;
- the sample shows all required representative design scenarios on one page;
- the sample supports switching between built-in light, dark, and high-contrast draft themes;
- the sample supports editing the current theme tokens;
- the sample supports importing a valid JSON theme draft;
- the sample supports exporting the current theme as JSON;
- exported JSON can be re-imported successfully;
- invalid imports produce clear feedback;
- theme constants are centralized behind an initial token model;
- renderer/sample styling uses the token model rather than unrelated hard-coded values where practical;
- a visual identity spec exists or is updated;
- a design direction decision record exists or is updated;
- sample and tooling documentation are updated where applicable;
- `docs/MILESTONES.md` references this milestone after the document is uploaded;
- applicable fast validation succeeds through the repository command contract, or failures are documented with exact command and reason.

## Suggested Implementation Slices

### Slice 1: Documentation And Theme Model

Create the visual identity spec, decision record, draft theme model, and built-in draft themes.

### Slice 2: Static Scenario Page

Create the sample page with all representative scenarios rendered using the initial theme tokens.

### Slice 3: Theme Switching And Token Editing

Add built-in theme switching and token editing controls.

### Slice 4: Import And Export

Add JSON import, validation, export, and re-import validation.

### Slice 5: Validation And Documentation Sync

Add lightweight tests and update required repository documentation.

These slices are sequencing guidance. They are not separate milestones.

## Open Questions

- Should the draft theme format become a public API later or remain a design-time tool format?
- Should the final renderer support CSS custom properties, TypeScript object themes, or both?
- Should future visual regression tests be image-based, DOM/SVG-structure-based, or token-contract-based?
- Which layout algorithms should be represented in the visual identity sample once multiple layouts exist?
- Should graph scenarios be hand-authored fixtures, generated fixtures, or both?

## Public Documentation Impact

This milestone primarily affects internal design and sample infrastructure.

Public documentation is required only if the sample, theme format, or theming surface is exposed as supported user-facing behavior.

If the theme format is explicitly documented as experimental, that status must be clear.

## Milestone Index Update Required

After this document is uploaded to `docs/milestones/default-visual-identity-iteration-tool.md`, update:

```text
docs/MILESTONES.md
```

to reference the new milestone according to the repository milestone index conventions.
