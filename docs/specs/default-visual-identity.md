# Default Visual Identity

## Status

Active.

Experimental design-token and sample-iteration surface for milestone 009.

## Purpose

Define the current experimental visual identity draft used to evaluate BlazorFlowGraph diagrams through a shared token model and representative sample scenarios.

## Design principles

The default visual identity MUST optimize for calm technical comprehension over decoration.

The current draft emphasizes:

- readable node labels before ornamental treatment;
- restrained edge styling that communicates flow without dominating the canvas;
- semantic state through explicit tokens instead of scattered renderer constants;
- enough contrast for dense graphs, search states, selection, focus, and diagnostics;
- reduced-motion compatibility through theme-level motion tokens.

The draft MUST avoid neon styling, heavy shadows, dashboard-like chrome, and node-editor visual language unless a later decision record changes direction.

## Visual roles

The draft theme model covers these renderer-facing roles:

- canvas and optional grid;
- node surface, header, text, and muted metadata;
- group surface, border, and label;
- ports;
- edges in default, highlighted, and muted states;
- selection, focus, and search emphasis;
- change-state accents for added, changed, removed, and stale states.

## Interaction and change states

The sample iteration tool MUST support visual review of at least the following states:

- selected and focused nodes;
- dimmed non-matching context;
- search matches;
- upstream and downstream emphasis;
- added, changed, removed, moved, relayouted, and stale change markers;
- warning, error, and unavailable diagnostics.

The milestone 009 workshop uses these states as experimental renderer hints. Future public API commitments require follow-up specification work.

## Theme draft contract

The current draft format is a JSON object with:

- `metadata` containing `format`, `version`, `name`, and optional `description`;
- `color` tokens for canvas, nodes, groups, edges, interaction states, and diagnostics;
- `size` tokens for radii, padding, and stroke widths;
- `typography` tokens for label and metadata sizing;
- `motion` tokens for update and selection timing plus reduced-motion preference.

The current format marker is `blazor-flow-graph-theme-draft` and the current version is `1`.

The workshop MUST reject malformed JSON, unsupported format markers, and unsupported versions before applying a theme draft.

## Accessibility requirements

Built-in themes and imported drafts used in the workshop SHOULD preserve:

- readable label text at normal sample zoom;
- non-color-only distinction for selection or focus where practical;
- distinguishable warning and error treatments;
- a reduced-motion token that can disable animation-oriented styling decisions;
- a high-contrast built-in draft for comparison.

## Non-goals

This spec does not define:

- a stable public theming API;
- final renderer architecture for every future interaction state;
- production-ready WCAG certification evidence;
- a plugin or theme marketplace model.

## Related documents

- [`../milestones/milestone-009-visual-identity-iteration-tool.md`](../milestones/milestone-009-visual-identity-iteration-tool.md)
- [`renderer-backend-contract.md`](renderer-backend-contract.md)
- [`search-and-filtering.md`](search-and-filtering.md)
- [`semantic-overlays.md`](semantic-overlays.md)
- [`../decisions/0005-default-diagram-visual-direction.md`](../decisions/0005-default-diagram-visual-direction.md)

## Authority

This document is authoritative for the current experimental default visual identity draft contract and the required state coverage of the visual identity workshop.

## Document Contract

Update this document when the theme draft contract, required visual roles, or required state coverage changes.
