# Purpose

Define the repeatable review process for repository documentation changes.

# Preconditions

- a change affects durable docs, indexes, routing files, issue forms, or related process guidance

# Required Reading

- [`documentation-changes.md`](documentation-changes.md)
- [`../TERMINOLOGY.md`](../TERMINOLOGY.md)
- [`../SPECS.md`](../SPECS.md)
- [`../WORKFLOWS.md`](../WORKFLOWS.md)
- [`../TBPS.md`](../TBPS.md)

# Execution Steps

1. Confirm the authoritative document for each changed topic.
2. Check that indexes, README entry points, and issue forms route to the authoritative layer.
3. Check for duplicated guidance that should be replaced by references.
4. Verify authority and document contract sections remain accurate.
5. Review links and file references after edits land.

# Validation

- routing files point to existing authoritative documents
- duplicated durable guidance is minimized
- authority and document contracts are consistent across changed docs

# Common Failures

- changing docs without updating indexes or issue forms
- leaving stale paths after adding or renaming docs
- mixing research, milestone, and spec authority

# Synchronization Requirements

- keep core indexes, directory READMEs, and issue forms aligned with authoritative docs

# Related Documents

- [`documentation-changes.md`](documentation-changes.md)
- [`add-tbp.md`](add-tbp.md)

# Authority

This TBP is authoritative for documentation review expectations.

# Document Contract

Update this document when documentation review expectations change. Keep it synchronized with documentation-related issue forms and [`documentation-changes.md`](documentation-changes.md).
