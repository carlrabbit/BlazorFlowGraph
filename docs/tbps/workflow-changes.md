# Purpose

Define the standard process for changing repository automation without losing the workflow's documented intent.

# Preconditions

- the change affects a file under `.github/workflows/`
- the author understands the workflow's current goal, inputs, outputs, and failure conditions

# Required Reading

- [`../WORKFLOWS.md`](../WORKFLOWS.md)
- [`../workflows/ci-build.md`](../workflows/ci-build.md)
- [`../workflows/publish-nuget.md`](../workflows/publish-nuget.md)
- [`../../AGENTS.md`](../../AGENTS.md)

# Execution Steps

1. Update or create the authoritative document under `docs/workflows/` first.
2. Make the workflow YAML change needed to match the documented intent.
3. Keep YAML implementation-focused and remove narrative rationale that belongs in docs.
4. Re-check repository commands, paths, triggers, artifacts, and secrets references for drift.
5. Update related index documents if the workflow set changes.

# Validation

- each changed workflow YAML has a matching document in `docs/workflows/`
- trigger conditions, inputs, outputs, and failure conditions match the implementation
- references in `README.md`, `docs/WORKFLOWS.md`, and release documentation remain correct

# Common Failures

- editing workflow YAML without updating the workflow document first
- leaving outdated commands in `README.md` or release documentation
- mixing workflow rationale into YAML comments instead of the workflow document

# Synchronization Requirements

- keep `.github/workflows/` synchronized with `docs/workflows/`
- promote recurring release or validation procedures into TBPs when they extend beyond a single workflow

# Related Documents

- [`../workflows/ci-build.md`](../workflows/ci-build.md)
- [`../workflows/publish-nuget.md`](../workflows/publish-nuget.md)
- [`documentation-changes.md`](documentation-changes.md)

# Authority

This TBP is authoritative for workflow change process in this repository.

# Document Contract

Update this document when workflow change expectations change. Keep it synchronized with [`../WORKFLOWS.md`](../WORKFLOWS.md) and workflow-related issue forms.
