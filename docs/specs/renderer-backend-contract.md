# Renderer Backend Contract

## Status

Active.

## Purpose

Define the public contract implemented by renderer backends such as SVG and future Canvas/WebGL renderers.

## Renderer identity

A renderer backend is responsible only for rendering prepared render frames and applying viewport transforms. It MUST NOT own semantic graph state.

## Required interface

A renderer backend MUST provide equivalent behavior to:

- `initialize(container, width, height)`
- `renderFrame(frame)`
- `updateViewport(panX, panY, scale)`
- `resize(width, height)`
- `dispose()`

## RenderFrame input

Backends consume `RenderFrame`, not raw runtime graph state.

A `RenderFrame` contains only visible, positioned, render-ready elements:

- nodes
- edges
- groups
- overlays
- canvas dimensions

## Backend constraints

Backends MUST:

- avoid mutating runtime state
- tolerate empty frames
- support repeated `renderFrame` calls
- support viewport updates independent from full re-render
- dispose all owned DOM/resources

Backends SHOULD:

- minimize DOM/canvas mutations
- expose diagnostics hooks or timing integration
- preserve accessibility behavior when applicable

## SVG backend requirements

The SVG backend MUST:

- render nodes, edges, groups, and overlays from RenderFrame
- escape user-provided string content
- expose stable data attributes for node and group IDs
- support ARIA labels where applicable

## Authority

This document is authoritative for renderer backend behavior and RenderFrame/backend separation.

## Document Contract

Update this spec when backend lifecycle, RenderFrame structure, or renderer ownership changes.
