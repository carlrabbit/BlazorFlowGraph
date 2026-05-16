# Purpose

Define the repeatable process for managing canonical repository terminology.

# Preconditions

- a new durable term is being introduced, renamed, narrowed, or retired

# Required Reading

- [`../TERMINOLOGY.md`](../TERMINOLOGY.md)
- [`../SPECS.md`](../SPECS.md)
- [`documentation-review.md`](documentation-review.md)

# Execution Steps

1. Decide whether the term needs durable repository-wide meaning.
2. Update [`../TERMINOLOGY.md`](../TERMINOLOGY.md) before or alongside dependent docs.
3. Propagate the canonical term to specs, architecture docs, workflows, and TBPs.
4. Remove conflicting aliases or note them as legacy terms if necessary.
5. Re-check issue forms and routing docs when terminology changes affect contributor entry points.

# Validation

- the term has one clear canonical definition
- dependent docs use the canonical term consistently
- stale or conflicting wording is removed or redirected

# Common Failures

- adding new terms only inside specs or milestones
- redefining an existing term with a different meaning
- leaving issue forms or routing docs on old wording

# Synchronization Requirements

- keep terminology synchronized with specs, architecture docs, and contributor routing files

# Related Documents

- [`create-spec.md`](create-spec.md)
- [`documentation-review.md`](documentation-review.md)

# Authority

This TBP is authoritative for terminology management process.

# Document Contract

Update this document when terminology management expectations change. Keep it synchronized with [`../TERMINOLOGY.md`](../TERMINOLOGY.md) and affected issue forms.
