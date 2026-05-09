# Milestones

# BlazorFlowGraph Milestone Plan

This document defines the planned milestone progression for BlazorFlowGraph.

The milestones focus on:
- semantic graph projection
- incremental synchronization
- browser-side rendering/runtime
- automatic layouts
- topology exploration

The project intentionally does NOT target:
- generic diagram editing
- BPMN authoring
- whiteboard-style interaction
- arbitrary freeform design tooling

Milestones are capability-oriented and intentionally avoid time estimates.

---

# Architectural Foundation

Before milestone implementation begins, the repository should already provide:

- repository structure
- CI/CD setup
- .NET and TypeScript build pipelines
- workspace/package management
- testing infrastructure
- documentation structure
- architecture decision records (ADRs)

---

# Milestone 1 — Semantic Projection Rendering

## Goal

Establish the foundational rendering pipeline from semantic graph projection to browser visualization.

This milestone proves:
- projection architecture
- browser rendering pipeline
- Blazor integration
- runtime bootstrap

without introducing incremental synchronization complexity.

---

# Scope

## .NET

### Semantic Projection Model

Implement:
- graph projection model
- node model
- edge model
- grouping model
- metadata model

Requirements:
- stable identifiers
- deterministic serialization
- immutable-ish snapshots

---

### Projection Pipeline

Implement:
- semantic extraction pipeline
- projection generation pipeline
- serialization pipeline

Requirements:
- semantic model separated from rendering model
- rendering-independent projection structures

---

## TypeScript Runtime

### Runtime Bootstrap

Implement:
- browser runtime initialization
- graph loading
- rendering bootstrap
- viewport bootstrap

---

### SVG Renderer

Implement:
- SVG graph rendering
- node rendering
- edge rendering
- labels
- basic styling

Requirements:
- scalable DOM structure
- stable element identifiers
- renderer isolation

---

### Viewport Runtime

Implement:
- zoom
- pan
- fit-to-screen
- viewport transforms

---

## Blazor Integration

Implement:
- Blazor host component
- JS interop bridge
- initial graph handoff
- lifecycle integration

Requirements:
- browser runtime owns rendering
- Blazor remains orchestration layer

---

## Samples

Implement:
- minimal viewer sample
- static graph sample
- semantic projection sample

---

## Tests

Implement:
- projection serialization tests
- renderer bootstrap tests
- viewport behavior tests

---

# Exit Criteria

- semantic graph can be projected from .NET
- graph can be rendered in browser
- viewport navigation works
- architecture boundaries are established
- renderer remains browser-owned

---

# Milestone 2 — Incremental Graph Synchronization

## Goal

Introduce diff-based graph synchronization and reconciliation.

This milestone establishes the core runtime architecture for:
- evolving graphs
- stable interaction state
- efficient updates

This is one of the most important architectural milestones.

---

# Scope

## .NET

### Graph Diffing

Implement:
- node add/remove/update diffs
- edge add/remove/update diffs
- grouping diffs
- metadata diffs

Requirements:
- deterministic diff generation
- stable identifiers
- minimal update sets

---

### Incremental Projection Updates

Implement:
- projection reconciliation support
- projection snapshot versioning
- change tracking support

---

## TypeScript Runtime

### Reconciliation Engine

Implement:
- graph patch application
- node reconciliation
- edge reconciliation
- grouping reconciliation

Requirements:
- stable DOM preservation
- minimal rerendering
- deterministic update ordering

---

### Selection Persistence

Implement:
- stable selection tracking
- selection reconciliation
- graceful removal handling

---

### Viewport Preservation

Implement:
- viewport persistence across updates
- focus retention
- incremental viewport stabilization

---

### Animated Updates

Implement:
- node transitions
- edge transitions
- insert/remove animations

Requirements:
- optional animation support
- deterministic animation state

---

## Interaction Runtime

Implement:
- node selection
- hover state
- focus state
- topology highlighting

---

## Samples

Implement:
- live incremental update sample
- streaming topology sample
- graph mutation sample

---

## Tests

Implement:
- reconciliation tests
- diff application tests
- selection persistence tests
- viewport persistence tests

---

# Exit Criteria

- graphs update incrementally
- full rerenders are avoided
- selection survives updates
- viewport survives updates
- reconciliation behavior is deterministic

---

# Milestone 3 — Automatic Layout Integration

## Goal

Introduce automatic layout orchestration and topology-aware visualization.

This milestone transforms the renderer into a semantic topology explorer rather than a static graph viewer.

---

# Scope

## Layout Engine Integration

### ELK.js Integration

Implement:
- layered layouts
- hierarchical layouts
- directional layouts

Requirements:
- pluggable layout abstraction
- renderer/layout separation

---

### Layout Pipeline

Implement:
- layout orchestration
- layout caching
- layout invalidation
- incremental stabilization

---

### Incremental Layout Stabilization

Implement:
- partial relayout support
- anchor preservation
- layout continuity

Requirements:
- existing graph regions remain visually stable when possible

---

## TypeScript Runtime

### Layout Runtime

Implement:
- asynchronous layout execution
- layout transition support
- viewport-aware layout updates

---

### Grouping and Clustering

Implement:
- visual groups
- collapsible groups
- topology clusters

---

### Topology Exploration

Implement:
- upstream highlighting
- downstream highlighting
- dependency tracing
- path exploration

---

## Samples

Implement:
- large graph sample
- layered dataflow sample
- topology exploration sample

---

## Tests

Implement:
- layout integration tests
- layout stability tests
- cluster reconciliation tests

---

# Exit Criteria

- automatic layouts function reliably
- layouts remain stable during updates
- grouping works
- topology exploration works
- renderer scales to larger graphs

---

# Potential Extensions

The following extensions align with the project's goals and architectural direction.

These are intentionally separated from the core milestones.

---

# Extension — Semantic Overlays

## Goals

Add semantic overlays and runtime metadata visualization.

Possible features:
- throughput visualization
- latency overlays
- ownership overlays
- deployment/environment overlays
- health indicators
- error highlighting

---

# Extension — Advanced Topology Exploration

## Goals

Improve graph comprehension capabilities.

Possible features:
- path analysis
- cycle detection
- orphan detection
- impact analysis
- dependency depth visualization

---

# Extension — Large Graph Optimization

## Goals

Improve scalability for very large graphs.

Possible features:
- viewport culling
- virtualization
- spatial indexing
- progressive rendering
- renderer batching

---

# Extension — Renderer Abstraction

## Goals

Support alternative rendering backends.

Possible targets:
- Canvas renderer
- WebGL renderer

Requirements:
- rendering/runtime separation remains intact

---

# Extension — Temporal Graph Visualization

## Goals

Visualize graph evolution over time.

Possible features:
- historical graph snapshots
- timeline navigation
- topology diff visualization
- playback mode

---

# Extension — Advanced Layout Strategies

## Goals

Expand layout flexibility.

Possible features:
- force-directed layouts
- radial layouts
- domain-specific layouts
- custom layout plugins

---

# Extension — Search and Filtering

## Goals

Improve graph navigation and exploration.

Possible features:
- indexed search
- semantic filtering
- topology filtering
- dynamic highlighting
- saved views

---

# Extension — Semantic Plugin Model

## Goals

Allow consumers to extend projection behavior.

Possible features:
- projection hooks
- semantic enrichers
- metadata providers
- overlay providers

---

# Extension — Multi-View Synchronization

## Goals

Allow multiple coordinated graph views.

Possible features:
- synchronized viewports
- overview/minimap views
- detail/context split views

---

# Explicit Non-Goals

The following areas are intentionally outside the current project direction.

These should not influence milestone planning unless the project direction changes explicitly.

---

# Generic Diagram Authoring

Not a target:
- freeform diagram editing
- arbitrary drag/drop authoring
- Visio-style tooling

---

# BPMN Compliance

Not a target:
- BPMN specification compliance
- BPMN execution engines
- BPMN serialization support

---

# Whiteboard Features

Not a target:
- free drawing
- sticky notes
- collaborative sketching
- canvas whiteboarding

---

# Heavy Client-Side Domain Ownership

Not a target:
- browser-authoritative semantic state
- domain mutation inside renderer
- rendering-driven domain logic

---

# Fine-Grained Blazor Rendering

Not a target:
- large Razor component trees
- Blazor-driven rendering loops
- server-side DOM orchestration

---

# Architectural Constraints

The following constraints should remain valid throughout milestone progression.

---

# Semantic Model Separation

Semantic models and visualization projections must remain separate.

---

# Stable Identifiers

All graph elements must use stable deterministic identifiers.

---

# Browser-Owned Rendering

Rendering and interaction remain browser runtime responsibilities.

---

# Incremental Synchronization

The architecture should prefer incremental updates over full rerendering.

---

# Layout as Infrastructure

Layout systems should remain pluggable and renderer-independent.

---

# Framework Independence

The TypeScript runtime should remain as framework-independent as practical.

Avoid:
- React lock-in
- Vue lock-in
- framework-specific rendering assumptions

---

# Long-Term Direction

BlazorFlowGraph aims to evolve into a semantic topology visualization platform for dynamic .NET systems.

The long-term focus is:
- topology comprehension
- evolving graph visualization
- scalable semantic exploration
- automatic layouts
- stable incremental synchronization

rather than generic diagram authoring.
