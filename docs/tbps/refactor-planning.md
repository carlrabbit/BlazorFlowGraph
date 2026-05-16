# Purpose

Define the repeatable process for planning refactors that should preserve external behavior.

# Preconditions

- the work primarily changes structure, maintainability, or internal organization
- intended external behavior is expected to remain the same unless separately documented

# Required Reading

- relevant specs under `docs/specs/`
- relevant architecture docs under `docs/architecture/`
- related ADRs and workflow docs as needed

# Execution Steps

1. Identify the behavior that must remain unchanged.
2. Confirm the architecture boundaries and constraints the refactor must preserve.
3. Break the refactor into small, reviewable steps.
4. Update architecture or process docs only if the refactor changes durable structure or workflow.
5. Validate that existing behavior still matches its governing specs.

# Validation

- preserved behavior is identified up front
- architecture boundaries remain intact
- any durable structural changes are documented

# Common Failures

- using refactor scope to smuggle in undocumented behavior changes
- skipping validation because behavior is "supposed" to be unchanged
- changing architecture without updating architecture docs or ADRs

# Synchronization Requirements

- keep refactor plans aligned with specs, architecture docs, and decisions they depend on

# Related Documents

- [`feature-implementation.md`](feature-implementation.md)
- [`bug-investigation.md`](bug-investigation.md)

# Authority

This TBP is authoritative for refactor planning process.

# Document Contract

Update this document when refactor planning expectations change. Keep it synchronized with related implementation TBPs.
