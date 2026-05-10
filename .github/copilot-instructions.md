# Copilot Instructions — BlazorFlowGraph

## Project Overview

BlazorFlowGraph is a semantic dataflow visualization framework built with:

- .NET 10
- Blazor Server interactive components
- TypeScript
- SVG-based browser rendering
- incremental graph synchronization

The project visualizes semantic systems and evolving dataflow topologies.

This is NOT a general-purpose diagram editor.

---

# Core Architecture

The system is intentionally split into separate runtimes.

## .NET Responsibilities

The .NET side is authoritative for:

- semantic models
- semantic annotations
- graph projection generation
- graph diff generation
- validation
- orchestration
- persistence

## Browser Runtime Responsibilities

The TypeScript runtime is responsible for:

- rendering
- viewport management
- selection state
- search/filter/grouping
- layout execution
- graph reconciliation
- animation
- interaction handling

## Blazor Responsibilities

Blazor is primarily:

- a hosting layer
- an integration layer
- a bridge between .NET and TypeScript

Blazor components should NOT contain:
- graph layout logic
- reconciliation logic
- rendering logic
- interaction state machines

---

# Architectural Principles

## Semantic Model vs Projection Model

The semantic model is the source of truth.

The visualization graph is a generated projection and must remain disposable and reproducible.

Never tightly couple semantic domain models to visualization DTOs.

---

## Incremental Updates

Prefer graph diffs over full graph replacement whenever possible.

The runtime is optimized for:
- incremental reconciliation
- stable viewport state
- stable selection state
- layout preservation

Avoid implementations that recreate the entire graph for small changes.

---

## Stable IDs

All graph entities must use stable deterministic identifiers.

This is required for:
- reconciliation
- layout persistence
- animation continuity
- selection preservation

Avoid transient GUID generation during projection.

---

## Runtime Separation

Do not mix:
- semantic concerns
- rendering concerns
- browser interaction concerns

Keep boundaries explicit.

---

# TypeScript Guidelines

## General

Use:
- strict TypeScript
- explicit interfaces
- discriminated unions
- immutable-style update patterns where practical

Avoid:
- overly dynamic object structures
- implicit `any`
- excessive inheritance
- framework-specific assumptions

---

## Rendering

The renderer is SVG-first.

Prefer:
- composable rendering primitives
- viewport-aware rendering
- incremental updates

Avoid:
- full rerenders
- unnecessary DOM churn
- large component hierarchies

---

## Interaction

Interaction state belongs in the browser runtime.

Do not send high-frequency pointer events through SignalR.

Prefer:
- semantic commands
- throttled synchronization
- browser-local interaction state

---

## Layout

Automatic layout is a primary feature.

Layout implementations should:
- preserve stability where possible
- minimize unnecessary node movement
- support incremental graph evolution

Prefer adapter-based integrations for layout engines.

The repository currently includes a placeholder grid layout, with ELK-based layout documented as the planned direction.

---

# .NET Guidelines

## Projection Layer

Projection generation should:
- be deterministic
- be testable
- avoid UI assumptions
- produce stable graph structures

Projection logic should remain independent from Blazor.

---

## Diffing

Diff generation is a core subsystem.

Prefer:
- explicit patch operations
- deterministic ordering
- minimal mutation sets

---

## Blazor

Blazor components should remain thin.

Avoid placing:
- graph algorithms
- layout calculations
- reconciliation logic
inside Razor components.

---

# Testing Strategy

## Prefer Unit Tests For

- projection generation
- diff generation
- reconciliation
- layout stabilization
- viewport calculations

## Use E2E Tests For

- rendering correctness
- browser interactions
- viewport behavior
- integration flows

Avoid excessive E2E usage for pure graph logic.

---

# Repository Structure

## TypeScript

```text
src/TypeScript/packages/
  protocol/
  runtime/
  renderer-svg/
  layout/
  interop/
  host/
```

## .NET

```text
src/DotNet/
  BlazorFlowGraph.Semantics/
  BlazorFlowGraph.Projection/
  BlazorFlowGraph.Protocol/
  BlazorFlowGraph.Diffing/
  BlazorFlowGraph.Blazor/
  BlazorFlowGraph.Blazor.Server/
```

---

# Preferred Patterns

## Good

- explicit runtime boundaries
- deterministic transformations
- immutable-style graph updates
- stable graph contracts
- protocol-first design

## Avoid

- implicit shared mutable state
- UI-driven domain logic
- tightly coupled JS interop
- runtime-specific business logic
- direct DOM manipulation from Blazor

---

# Performance Considerations

The runtime must scale to large graphs.

Prioritize:
- incremental rendering
- viewport culling
- diff-based synchronization
- stable layout updates

Avoid:
- full graph rerenders
- unnecessary allocations
- excessive SignalR chatter
- deep Blazor render trees

---

# Documentation

Consult the AI-oriented reference docs in `docs/ai/` when they are relevant to the task.

If a task introduces a new architectural area, protocol rule, rendering constraint, or other durable AI-facing guidance that is not already covered, extend the appropriate document in `docs/ai/` or add a new focused AI spec when necessary.

When introducing major architectural changes:

- update ADRs
- update relevant `docs/ai/*.md` guidance when AI-facing implementation constraints have changed
- document runtime boundaries
- document protocol changes
- explain reconciliation implications

Architecture consistency is more important than short-term implementation convenience.
