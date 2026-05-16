# Inspection Workflows

## Status

Active.

## Purpose

Define semantic graph inspection workflows that let users understand graph elements and topology without editing the graph.

## Inspection identity

Inspection is browser-side interaction state plus optional application callbacks. Inspection does not mutate the semantic graph.

## Inspectable targets

The runtime SHOULD support inspection of:

- node
- edge
- group
- selected set
- focused topology scope
- search result
- upstream/downstream path

## Inspection payload

An inspection payload SHOULD include:

- target type
- target IDs
- label/kind
- metadata summary
- active overlays for the target
- topology context when available

## Runtime events

Inspection SHOULD use semantic runtime events, for example:

- `NodeInspected`
- `EdgeInspected`
- `GroupInspected`
- `SelectionInspected`
- `OverlayInspected`

Events MUST NOT expose raw DOM events as the public API.

## Blazor integration

The Blazor host MAY expose callbacks for inspection events so application code can open dialogs, side panels, detail pages, or external tooling.

The library MUST NOT prescribe a specific dialog implementation.

## Inspection and selection

Inspection and selection are related but distinct:

- selection is persistent interaction state
- inspection is a request for detail/context

A user MAY inspect without changing selection.

## Authority

This document is authoritative for inspection targets, payloads, runtime events, and Blazor callback semantics.

## Document Contract

Update this spec when inspection events, payloads, or host integration behavior changes.
