# Overlay Provider Contract

## Status

Active.

## Purpose

Define the extension point that produces semantic overlays without allowing arbitrary runtime mutation.

## Provider role

An overlay provider computes overlay values from graph data, runtime state, or external semantic inputs. Providers do not render directly and do not mutate graph topology.

## Required behavior

An overlay provider MUST:

- declare the overlay kind it provides
- provide registry metadata for that kind
- compute overlays deterministically for a given input state
- return overlays in the protocol/runtime overlay model
- avoid mutating runtime graph state

A provider MAY:

- depend on metadata emitted by the .NET projection layer
- use browser runtime state such as search/focus/selection
- compute topology-aware overlays using the query engine

## Provider input

Provider input SHOULD include:

- current graph data state
- topology indexes/query engine
- runtime state snapshot
- optional provider-specific configuration

## Provider output

Provider output SHOULD include:

- node overlays
- edge overlays
- optional group overlays
- optional legend metadata
- optional diagnostics

## Provider lifecycle

Providers SHOULD support:

- registration
- unregistration
- recomputation after snapshot/diff application
- recomputation after relevant runtime state changes

## Failure behavior

Provider failure MUST NOT corrupt runtime state or block graph rendering. Provider failures SHOULD be reported through diagnostics and the overlay kind SHOULD be disabled or skipped for that frame.

## Authority

This document is authoritative for overlay provider behavior and extension boundaries.

## Document Contract

Update this spec when provider lifecycle, input/output models, or failure behavior changes.
