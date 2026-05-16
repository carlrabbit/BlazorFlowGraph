# Package and Release Contract

## Status

Active.

## Purpose

Define what must be true before BlazorFlowGraph can be released as consumable packages.

## Package boundaries

The repository publishes and ships two runtime families:

- .NET packages for semantic projection, protocol, diffing, and Blazor hosting
- TypeScript packages for protocol, runtime, query, layout, renderer, interop, and host integration

Package boundaries MUST match architectural boundaries. Packages MUST NOT require consumers to import internal test or sample code.

## Build requirements

A release candidate MUST pass:

- .NET restore/build/test
- TypeScript install/build/typecheck/test
- packaging validation
- sample build validation

## Versioning

Protocol-breaking changes MUST be reflected by protocol version changes and package version changes.

## Documentation requirements

A release candidate MUST include:

- README quickstart
- public API overview
- package installation instructions
- minimal Blazor integration sample
- semantic projection sample
- documented browser runtime behavior

## Authority

This document is authoritative for package boundaries and release-readiness criteria.

## Document Contract

Update this spec when package boundaries, release workflow, or release validation requirements change.
