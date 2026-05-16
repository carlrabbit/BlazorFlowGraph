# Purpose

Define the repeatable process for investigating bugs.

# Preconditions

- an observed behavior differs from the expected behavior, or expected behavior is unclear and needs confirmation

# Required Reading

- relevant specs under `docs/specs/`
- relevant architecture docs or workflow docs for the affected area
- related ADRs when rationale matters

# Execution Steps

1. Identify the authoritative source of expected behavior.
2. Reproduce the issue and capture the mismatch between observed and expected behavior.
3. Determine whether the problem is a behavior bug, documentation gap, or missing spec.
4. Fix the bug or open follow-up work for missing authority documents.
5. Add or update validation that would detect the regression.

# Validation

- expected behavior is anchored to an authoritative document
- the fix or follow-up closes the identified authority gap
- validation covers the regression path when practical

# Common Failures

- debugging from assumptions instead of authoritative behavior docs
- fixing symptoms without documenting the missing behavior source
- closing the bug without regression validation

# Synchronization Requirements

- keep bug fixes aligned with specs, architecture docs, and validation expectations

# Related Documents

- [`feature-implementation.md`](feature-implementation.md)
- [`documentation-review.md`](documentation-review.md)

# Authority

This TBP is authoritative for bug investigation process.

# Document Contract

Update this document when the repository's bug investigation process changes. Keep it synchronized with the bug issue form and related validation guidance.
