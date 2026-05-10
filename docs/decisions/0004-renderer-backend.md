# ADR 0004 — Renderer Backend Abstraction

## Status

Accepted

## Context

Milestone 3 introduces a renderer backend abstraction to decouple the rendering surface from the runtime and render pipeline.

Prior to Milestone 3, the SVG renderer was directly integrated into the host's rendering loop:
- `renderInnerSvg` produced an HTML string that was injected into a `<g>` element
- the host directly managed the `<svg>` element lifecycle
- there was no abstraction between "what to render" and "how to render it"

This created implicit coupling that would make introducing alternative rendering backends (Canvas, WebGL) difficult without touching the pipeline or host logic.

## Decision

Introduce a formal `GraphRendererBackend` interface in `@dataflow-visualizer/renderer-svg`:

```typescript
interface GraphRendererBackend {
  initialize(container: Element, width: number, height: number): void;
  renderFrame(frame: RenderFrame): void;
  updateViewport(panX: number, panY: number, scale: number): void;
  resize(width: number, height: number): void;
  dispose(): void;
}
```

Introduce a `RenderFrame` model as the stable data contract backends receive:

```typescript
interface RenderFrame {
  nodes: readonly RenderNode[];
  edges: readonly RenderEdge[];
  canvasWidth: number;
  canvasHeight: number;
}
```

Introduce `buildRenderFrame(state, layout, options?)` as the view projection step that produces `RenderFrame` from a `GraphState` (optionally filtered by `VisibleGraph`).

The primary SVG implementation is `SvgRendererBackend`, which implements `GraphRendererBackend`.

## Consequences

### Benefits

- Backends are replaceable without changing the pipeline or runtime.
- `RenderFrame` is independently testable without a DOM.
- `buildRenderFrame` is independently testable without a backend.
- Alternative backends (Canvas, WebGL) implement `GraphRendererBackend` as the only integration point.
- `VisibleGraph` filtering is cleanly expressed before frame construction — backends never see hidden elements.

### Constraints

- Backends must not access runtime state directly — they receive `RenderFrame` only.
- The `RenderFrame` contract is stable and should not expose implementation details of any specific backend.
- New backends implement `GraphRendererBackend`; they do not fork or duplicate the render pipeline.

## Related

- `docs/decisions/0001-svg-first.md` — SVG remains primary; this ADR adds abstraction above it.
- `docs/ai/rendering.md` — rendering constraints and pipeline documentation.
- `src/TypeScript/packages/renderer-svg/src/index.ts` — implementation.
