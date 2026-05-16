# Runtime Diagnostics

## Status

Active.

## Purpose

Define diagnostics data collected by the browser runtime and how diagnostics support large-graph development.

## Required diagnostics

The runtime SHOULD collect:

- graph element counts
- visible element counts
- culled element counts
- diff application count
- failed diff count
- layout duration
- render-frame build duration
- renderer duration
- spatial-index build duration
- hit-test duration when useful

## Diagnostics ownership

Diagnostics are browser runtime state. They MUST NOT affect semantic graph correctness.

## Devtools integration

Diagnostics SHOULD be available to samples and future devtools views.
Diagnostics MAY be exposed to Blazor callbacks for application-level telemetry.

## Privacy and data volume

Diagnostics SHOULD avoid storing full graph payloads by default. Timing samples and aggregate counts are preferred.

## Authority

This document is authoritative for runtime diagnostics semantics and expected metrics.

## Document Contract

Update this spec when diagnostics metrics, retention, or exposure behavior changes.
