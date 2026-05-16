# Purpose

Define the repeatable process for adding a new Task Best Practice to this repository.

# Preconditions

- a recurring pattern has appeared often enough to justify durable process guidance
- the pattern is repository-specific rather than a one-off task note

# Required Reading

- [`../TBPS.md`](../TBPS.md)
- [`../../README.md`](../../README.md)
- [`documentation-review.md`](documentation-review.md)

# Execution Steps

1. Confirm the pattern belongs in a TBP rather than a spec, architecture document, or milestone.
2. Create the TBP file in `docs/tbps/` using the repository TBP structure.
3. Add the TBP to [`../TBPS.md`](../TBPS.md) with the correct layer and purpose.
4. Link the TBP from any issue form or workflow doc that depends on it.
5. Remove or redirect duplicate ad hoc process notes.

# Validation

- the new TBP describes reusable methodology
- `docs/TBPS.md` indexes the new TBP correctly
- related issue forms and routing docs reference the TBP where needed

# Common Failures

- encoding feature semantics inside a TBP
- creating a TBP for a one-time task
- adding a TBP without updating the TBP index

# Synchronization Requirements

- keep [`../TBPS.md`](../TBPS.md) synchronized with `docs/tbps/`
- keep issue forms aligned with TBPs they reference

# Related Documents

- [`documentation-review.md`](documentation-review.md)
- [`documentation-changes.md`](documentation-changes.md)

# Authority

This TBP is authoritative for the process of adding new TBPs.

# Document Contract

Update this document when the TBP creation process changes. Keep it synchronized with [`../TBPS.md`](../TBPS.md) and issue forms that request TBP additions.
