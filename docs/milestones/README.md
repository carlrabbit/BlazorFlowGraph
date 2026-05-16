# Milestones

This directory is reserved for milestone-specific planning documents that sequence work without becoming the permanent source of behavior truth.

The current capability roadmap remains in [`../../Milestones.md`](../../Milestones.md) as a high-level roadmap. Durable behavior belongs in specs, structure belongs in architecture docs, and rationale belongs in decisions.

When milestone planning becomes document-specific, prefer files named like:

- `milestone-01-foundation.md`
- `milestone-02-runtime.md`

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

Milestones should reference the specs and decisions they depend on. If a milestone discovers durable behavior that is not yet documented, create or update the governing spec before treating the milestone as complete.

# Authority

This document is authoritative for milestone document structure and the rule that milestone docs sequence work rather than define permanent behavioral truth.

# Document Contract

Update this document when the milestone template or milestone directory conventions change. Keep it synchronized with [`../../Milestones.md`](../../Milestones.md), milestone-related TBPs, and milestone issue forms.
