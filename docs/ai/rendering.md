# AI Rendering Reference

## Scope

This document captures the rendering responsibilities and constraints that AI-assisted changes should follow.

## Current State

Rendering is SVG-first and browser-side.

The main rendering path is:

1. .NET produces graph snapshots or diffs
2. the browser runtime reconciles graph state
3. layout is applied in the browser
4. `@dataflow-visualizer/renderer-svg` renders SVG output
5. the host inserts the rendered result into the DOM

## Rendering Responsibilities

The browser runtime is responsible for:

- rendering updates
- viewport-aware behavior
- selection and interaction visuals
- animation continuity
- minimizing DOM churn

Blazor should not become a rendering engine.

## Rendering Constraints

- Prefer incremental updates over full rerenders.
- Keep renderer logic separate from semantic projection logic.
- Preserve stable IDs so the renderer and runtime can reconcile consistently.
- Avoid high-frequency interaction round-trips through SignalR.
- Favor composable SVG rendering primitives over deep UI trees.

## Layout Relationship

Automatic layout is a core feature of the visualization experience.

The repository currently uses a placeholder grid layout while documenting ELK-based layout as the intended future direction. New docs and code should keep that distinction clear.

## Performance Priorities

Prioritize:

- incremental rendering
- stable layout updates
- viewport preservation
- efficient reconciliation

Avoid:

- full graph redraws for small changes
- unnecessary allocations
- large Blazor render trees
- browser/server chatter for pointer-frequency events

## Related Docs

- `docs/rendering/model.md`
- `docs/layout/architecture.md`
- `docs/decisions/0001-svg-first.md`
- `docs/decisions/0002-elk-layout.md`
- `docs/ai/architecture.md`
