# Purpose

Define the repeatable process for updating consumer-facing public documentation.

# Preconditions

- public-facing behavior/package/API/diagnostics/release change is identified
- internal authority docs (`docs/specs/`, `docs/ENGINEERING.md`, workflows) are known

# Required Reading

- [`../PUBLIC-DOCS.md`](../PUBLIC-DOCS.md)
- [`../ENGINEERING.md`](../ENGINEERING.md)
- [`../WORKFLOWS.md`](../WORKFLOWS.md)
- [`documentation-changes.md`](documentation-changes.md)

# Execution Steps

1. Confirm the internal source-of-truth change in specs/engineering/workflows.
2. Update affected `public-docs/` sources for consumers.
3. Update `README.md` links and user-first guidance when needed.
4. Run `./eng/public-docs.sh`.
5. For release work, run `./eng/release-check.sh <version>`.

# Validation

- required public documentation files and folders exist
- package README source (`public-docs/nuget/package-readme.md`) stays synchronized
- public docs updates do not replace internal specs as authority

# Common Failures

- updating internal docs without updating `public-docs/`
- writing implementation mechanics instead of consumer contracts
- drifting README links from public docs sources

# Synchronization Requirements

- synchronize `README.md`, `docs/PUBLIC-DOCS.md`, `docs/ENGINEERING.md`, and `docs/workflows/public-docs.md`
- keep release-facing public docs aligned with `docs/workflows/release-check.md` and `public-docs/release-notes.md`

# Authority

This TBP is authoritative for repeatable public documentation update process expectations.

# Document Contract

Update this document when public documentation process expectations change.
