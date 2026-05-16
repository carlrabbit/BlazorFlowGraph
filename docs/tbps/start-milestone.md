# Purpose

Define the repeatable process for starting milestone execution.

# Preconditions

- the milestone document exists and has clear scope, dependencies, and exit criteria
- related specs and decisions are available or explicitly tracked as prerequisites

# Required Reading

- the target milestone document under `docs/milestones/`
- [`../SPECS.md`](../SPECS.md)
- [`feature-implementation.md`](feature-implementation.md)

# Execution Steps

1. Review the milestone scope, non-goals, dependencies, and exit criteria.
2. Break milestone work into issues or work items that reference the milestone.
3. Confirm prerequisite specs, decisions, and workflow changes are present or planned.
4. Start implementation work through the relevant feature, bug, or refactor TBPs.
5. Track any authority gaps as follow-up spec, terminology, or decision work.

# Validation

- milestone dependencies are acknowledged before work starts
- implementation tasks route through the correct authoritative docs
- gaps in specs or decisions are made explicit

# Common Failures

- starting implementation before prerequisites are documented
- treating the milestone as the only source of behavior truth
- skipping validation or rollout planning

# Synchronization Requirements

- keep milestone execution aligned with current specs, decisions, and workflows

# Related Documents

- [`create-milestone.md`](create-milestone.md)
- [`finish-milestone.md`](finish-milestone.md)

# Authority

This TBP is authoritative for starting milestone execution.

# Document Contract

Update this document when the milestone start process changes. Keep it synchronized with milestone issue forms and related implementation TBPs.
