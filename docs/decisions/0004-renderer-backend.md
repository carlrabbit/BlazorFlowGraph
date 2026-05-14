# ADR 0004 — Renderer Backend Abstraction

**Status:** Accepted

# Context

The repository needed a rendering abstraction that separates render-surface implementation from runtime state and view projection.

Before this decision, SVG rendering logic was directly coupled to the host rendering loop, which made alternative backends difficult to introduce without changing pipeline logic.

# Decision

Introduce a formal `GraphRendererBackend` interface and a `RenderFrame` contract between runtime projection and backend rendering.

The chosen structure is:

- `buildRenderFrame(...)` produces a backend-ready rendering contract
- `GraphRendererBackend` defines the rendering surface lifecycle
- `SvgRendererBackend` is the first implementation of the interface
- visibility filtering happens before a backend receives data

# Consequences

- rendering backends become replaceable without changing runtime or host orchestration
- render-frame construction and backend rendering remain independently testable
- backends must not reach into raw runtime state directly
- future Canvas or WebGL work has a clear extension point

# Alternatives Considered

- keeping the SVG renderer embedded in the host, which would preserve implicit coupling
- letting each backend define its own input model, which would fragment the render pipeline
- moving backend selection into Blazor component logic, which would thicken the hosting layer

# Related Documents

- [`../architecture/browser-runtime.md`](../architecture/browser-runtime.md)
- [`../rendering/model.md`](../rendering/model.md)
- [`0001-svg-first.md`](0001-svg-first.md)
- [`../ai/rendering.md`](../ai/rendering.md)
