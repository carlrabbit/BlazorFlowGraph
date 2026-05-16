# Purpose

Define the repeatable process for adding a new behavioral specification.

# Preconditions

- the repository needs durable behavioral truth for a named area
- the behavior cannot be adequately owned by terminology, architecture, decisions, workflows, or milestones alone

# Required Reading

- [`../SPECS.md`](../SPECS.md)
- [`../specs/README.md`](../specs/README.md)
- [`../TERMINOLOGY.md`](../TERMINOLOGY.md)

# Execution Steps

1. Name the behavior area and confirm it needs durable authority.
2. Reuse existing terminology or add missing terms before drafting the spec.
3. Create the spec in `docs/specs/` using the standard template.
4. Add the spec to [`../SPECS.md`](../SPECS.md) and any relevant indexes.
5. Link related architecture docs, decisions, milestones, and validation expectations.

# Validation

- the spec includes the standard sections from `docs/specs/README.md`
- authority boundaries are explicit
- indexes and routing files point to the new spec

# Common Failures

- using milestones or ADRs as behavioral authority instead of creating a spec
- omitting invariants or failure semantics
- adding a spec without indexing it

# Synchronization Requirements

- keep [`../SPECS.md`](../SPECS.md) synchronized with `docs/specs/`
- keep terminology, architecture, and milestone references aligned with the new spec

# Related Documents

- [`../specs/README.md`](../specs/README.md)
- [`terminology-management.md`](terminology-management.md)

# Authority

This TBP is authoritative for the process of creating new specs.

# Document Contract

Update this document when the spec creation workflow or template expectations change. Keep it synchronized with [`../SPECS.md`](../SPECS.md), [`../specs/README.md`](../specs/README.md), and the create-spec issue form.
