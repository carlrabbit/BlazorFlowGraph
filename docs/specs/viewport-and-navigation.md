# Viewport and Navigation

## Status

Active.

## Purpose

Define viewport state, semantic navigation, and viewport transitions.

## Viewport ownership

Viewport state is browser-owned runtime state.
It MUST NOT be overwritten by graph projection updates unless an explicit semantic command requests it.

## Viewport state

Viewport state SHOULD include:

- pan X/Y
- scale
- screen width/height
- graph-space visible bounds
- optional navigation history

## Semantic navigation commands

The runtime SHOULD support semantic commands such as:

- `FitGraph`
- `FitSelection`
- `FocusNode`
- `FocusGroup`
- `RevealElement`
- `NavigateBack`
- `NavigateForward`

Commands MUST operate on semantic targets, not raw DOM elements.

## Transition behavior

Viewport transitions SHOULD preserve user orientation. Animated transitions MAY be used when reduced-motion preferences allow them.

## Hidden target behavior

If a command targets a hidden or culled element, the runtime SHOULD either:

- adjust filters/visibility to reveal the target
- report that the target cannot currently be revealed
- navigate to the nearest visible containing group or topology scope

## Authority

This document is authoritative for viewport ownership, navigation commands, and transition behavior.

## Document Contract

Update this spec when viewport state, semantic navigation commands, or reveal behavior changes.
