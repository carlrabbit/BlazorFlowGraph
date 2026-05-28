# Milestones

## Purpose

Milestone documents sequence implementation work without becoming the permanent source of behavioral truth.

Milestone documents are authoritative for:
- implementation scope and sequencing;
- exit criteria and validation expectations for a phase of work.

Milestone documents are not authoritative for:
- durable behavior (see `docs/SPECS.md`);
- architectural structure (see `docs/ARCHITECTURE.md`);
- design rationale (see `docs/DECISIONS.md`).

The current capability roadmap is in [`Milestones.md`](../Milestones.md).

## Available Milestone Documents

| Milestone | Purpose |
|---|---|
| [`milestones/milestone-08-workspace-sample-launch.md`](milestones/milestone-08-workspace-sample-launch.md) | Workspace sample launch and registry-backed sample index |
| [`milestones/milestone-009-visual-identity-iteration-tool.md`](milestones/milestone-009-visual-identity-iteration-tool.md) | Default visual identity iteration tool and theme-draft workflow |
| [`milestones/0010-layout-quality-and-path-highlighting.md`](milestones/0010-layout-quality-and-path-highlighting.md) | Layout strategy/direction quality improvements and path highlighting traversal model |

## Milestone Template

Each milestone document should include:

- Goal
- Scope
- Non-Goals
- Dependencies
- Deliverables
- Validation
- Exit Criteria
- Related Specs
- Related Decisions
- Authority
- Document Contract

Milestones should reference the specs and decisions they depend on. If a milestone discovers durable behavior that is not yet documented, create or update the governing spec before treating the milestone as complete. Milestone tracking issues should stay lightweight and point to the milestone document; detailed implementation guidance and sequencing belong in the milestone document itself.

## Authority

This document is authoritative for milestone document structure and the rule that milestone docs sequence work rather than define permanent behavioral truth.

## Document Contract

Update this document when a milestone document is added, renamed, or completed. Keep it synchronized with [`../Milestones.md`](../Milestones.md), milestone-related TBPs under `docs/tbps/`, and milestone issue forms.
