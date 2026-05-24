# Purpose

Define the repeatable process for creating a milestone sequencing document.

# Preconditions

- a new phase of work needs explicit sequencing, scope, dependencies, or exit criteria
- durable behavior has already been routed to specs, architecture, or decisions as needed

# Required Reading

- [`../MILESTONES.md`](../MILESTONES.md)
- [`../SPECS.md`](../SPECS.md)
- [`../DECISIONS.md`](../DECISIONS.md)

# Execution Steps

1. Confirm the milestone is for sequencing work, not defining permanent behavior.
2. Create the milestone document under `docs/milestones/` using the documented template.
3. Link the specs and decisions the milestone depends on.
4. Record scope, non-goals, dependencies, deliverables, validation, and exit criteria.
5. Update milestone indexes or roadmap references if discoverability changes.

# Validation

- the milestone references related specs and decisions
- behavioral truth is routed out to authoritative docs
- sequencing and exit criteria are explicit

# Common Failures

- placing permanent feature semantics inside a milestone
- omitting dependencies on specs or decisions
- creating a milestone without clarifying non-goals

# Synchronization Requirements

- keep milestone docs aligned with [`../MILESTONES.md`](../MILESTONES.md)
- keep roadmap references aligned when milestone structure changes

# Related Documents

- [`start-milestone.md`](start-milestone.md)
- [`finish-milestone.md`](finish-milestone.md)

# Authority

This TBP is authoritative for creating milestone documents.

# Document Contract

Update this document when the milestone creation process changes. Keep it synchronized with [`../MILESTONES.md`](../MILESTONES.md) and milestone-related issue forms.
