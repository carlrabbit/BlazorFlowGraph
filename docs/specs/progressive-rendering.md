# Progressive Rendering

## Status

Active.

## Purpose

Define how the renderer may progressively render graph content without changing semantic graph state.

## Rendering budget

The runtime MAY impose render budgets based on:

- maximum nodes per frame
- maximum edges per frame
- time budget per frame
- priority of focused/selected elements

## Priority rules

Progressive rendering SHOULD prioritize:

1. focused element and immediate topology context
2. selected elements
3. visible viewport center
4. search results
5. overlays with high severity
6. remaining visible graph elements

## User-visible behavior

Progressive rendering MUST avoid pretending that missing elements were semantically removed. Diagnostics or devtools SHOULD expose when rendering is budget-limited.

## Interaction behavior

Hit testing MUST only target rendered or indexed elements. Navigation commands MAY target non-rendered elements if they exist in runtime graph state.

## Authority

This document is authoritative for progressive rendering semantics, priority rules, and diagnostics expectations.

## Document Contract

Update this spec when render budget behavior, priority rules, or interaction semantics change.
