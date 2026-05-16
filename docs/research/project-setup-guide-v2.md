# Project Setup Guide V2 Research Note

## Status

Research and setup rationale only. This document is not the authoritative source for current repository behavior.

## Purpose

Capture why the repository aligned its documentation structure with Project Setup Guide V2 without turning the guide itself into permanent authority.

## Summary

Project Setup Guide V2 introduced a clearer authority model:

- terminology belongs in [`../TERMINOLOGY.md`](../TERMINOLOGY.md)
- behavior belongs in [`../SPECS.md`](../SPECS.md) and `docs/specs/`
- structure belongs in `docs/architecture/`
- rationale belongs in `docs/decisions/`
- process belongs in [`../TBPS.md`](../TBPS.md) and `docs/tbps/`
- workflow intent belongs in [`../WORKFLOWS.md`](../WORKFLOWS.md) and `docs/workflows/`
- milestone sequencing belongs in `docs/milestones/`

## Repository Alignment Outcomes

- added the missing specs index and specs directory entry points
- clarified TBPs as methodology instead of implementation semantics
- added durable authority and document contract sections to core docs
- added lightweight issue forms that route contributors to the right documentation layer
- preserved project-specific agent and AI context docs as routing aids rather than durable behavioral authority

## Durable Authority

Use the repository's terminology, specs, architecture, decisions, workflow, milestone, and TBP documents for ongoing maintenance. Treat this file as historical rationale for why the structure exists.
