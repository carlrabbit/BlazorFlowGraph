# Purpose

Keep repository entry points, authoritative references, and synchronization rules aligned when documentation changes land.

# Preconditions

- the change affects repository documentation, routing files, workflow intent, or durable engineering guidance
- the author has identified which document is authoritative for the updated subject

# Required Reading

- [`../../README.md`](../../README.md)
- [`../TERMINOLOGY.md`](../TERMINOLOGY.md)
- [`../WORKFLOWS.md`](../WORKFLOWS.md)
- [`../TBPS.md`](../TBPS.md)
- [`../../AGENTS.md`](../../AGENTS.md)

# Execution Steps

1. Identify the authoritative document for the subject being changed.
2. Update terminology first when a canonical term changes or a new term is introduced.
3. Update workflow intent before workflow implementation when operational behavior changes.
4. Update architecture or decision records when runtime boundaries or durable design choices change.
5. Update repository entry points and indexes so readers can discover the new or changed documentation.
6. Remove or redirect stale references to replaced documents.

# Validation

- links from `README.md`, `AGENTS.md`, and index documents resolve to current files
- duplicated explanations are replaced by references to the authoritative document
- synchronization rules remain explicit for the changed area

# Common Failures

- adding new guidance without updating indexes or routing files
- duplicating the same explanation across README, workflow docs, and AI-facing docs
- changing terminology in one file without updating `docs/TERMINOLOGY.md`

# Synchronization Requirements

- workflow changes must stay synchronized with `docs/workflows/` and `.github/workflows/`
- recurring process guidance must be reflected in `docs/tbps/`
- AI-facing repository constraints in `docs/ai/` must stay aligned with authoritative architecture and protocol docs

# Related Documents

- [`../WORKFLOWS.md`](../WORKFLOWS.md)
- [`../TBPS.md`](../TBPS.md)
- [`workflow-changes.md`](workflow-changes.md)
