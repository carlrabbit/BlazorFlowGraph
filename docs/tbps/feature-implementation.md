# Purpose

Define the repeatable process for feature implementation work.

# Preconditions

- the feature request identifies the desired behavior or the gap in current behavior
- the authoritative docs for the feature area are known or tracked for follow-up

# Required Reading

- relevant specs under `docs/specs/`
- relevant architecture docs under `docs/architecture/`
- related ADRs under `docs/decisions/`
- relevant workflow or TBP docs when process changes are involved

# Execution Steps

1. Confirm the expected behavior from specs; if no spec exists, determine whether one is needed.
2. Confirm structural constraints from architecture docs and durable rationale from decisions.
3. Implement the smallest change that satisfies the feature.
4. Update specs, architecture docs, workflows, or TBPs when the feature changes durable guidance.
5. Validate behavior and synchronization requirements before completion.

# Validation

- feature behavior matches the governing spec or explicitly updates it
- architecture boundaries remain intact
- related docs are updated when durable behavior or process changes

# Common Failures

- implementing behavior without identifying the authoritative spec
- placing durable behavior only in milestone or issue text
- changing runtime boundaries without updating architecture docs

# Synchronization Requirements

- keep feature work synchronized with specs, architecture docs, decisions, workflows, and TBPs that it changes

# Related Documents

- [`create-spec.md`](create-spec.md)
- [`refactor-planning.md`](refactor-planning.md)
- [`bug-investigation.md`](bug-investigation.md)

# Authority

This TBP is authoritative for feature implementation process.

# Document Contract

Update this document when the repository's feature implementation process changes. Keep it synchronized with contributor issue forms and related TBPs.
