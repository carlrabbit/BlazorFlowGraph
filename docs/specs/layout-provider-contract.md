# Layout Provider Contract

## Status

Active.

## Purpose

Define the contract for pluggable browser-side layout providers.

## Layout ownership

Layout executes in the browser runtime. The .NET backend may provide semantic hints, grouping information, and layout policy, but does not perform frame-rate-sensitive layout operations.

## Required interface

A layout provider MUST expose an async operation equivalent to:

- `computeLayout(graph, options?) -> Promise<LayoutResult>`

The interface is async to support ELK, WASM-based engines, workers, or future remote layout execution.

## Input model

Layout providers consume `LayoutGraph`, not raw runtime graph state.

`LayoutGraph` contains:

- layout nodes
- layout edges
- layout groups

It is intentionally separate from semantic graph snapshots and render frames.

## Output model

`LayoutResult` MUST include:

- positioned nodes
- edge route sections
- canvas width
- canvas height

A provider MAY omit edge sections when the renderer can use fallback routing.

## Layout policies

Supported policies include:

- `Never`
- `Incremental`
- `Full`
- `GroupLocal`
- `Manual`
- `Local`
- `Frozen`

The runtime MUST define when each policy triggers layout recomputation.

## Failure behavior

A provider failure MUST NOT corrupt runtime graph state. The runtime SHOULD fall back to the previous valid layout or a simple grid layout.

## Authority

This document is authoritative for layout provider behavior, input/output separation, and layout failure semantics.

## Document Contract

Update this spec when layout provider interface, layout graph shape, layout policies, or fallback behavior changes.
