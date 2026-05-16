# Workflows

Workflow intent is documented independently from GitHub Actions implementation.

This document is an index only. Detailed triggers, inputs, outputs, failure conditions, and synchronization rules live in the workflow documents under `docs/workflows/`.

| Workflow | GitHub Actions File | Purpose |
|---|---|---|
| [`ci-build.md`](workflows/ci-build.md) | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) | Restore, build, typecheck, and test the repository on pushes and pull requests |
| [`publish-nuget.md`](workflows/publish-nuget.md) | [`.github/workflows/nuget-publish.yml`](../.github/workflows/nuget-publish.yml) | Build, pack, and publish versioned NuGet packages from validated releases |

# Authority

This document is authoritative for the workflow index and the rule that workflow intent is documented separately from workflow implementation.

# Document Contract

Update this document when a workflow intent document or workflow YAML file is added, renamed, removed, or remapped. Keep it synchronized with [`workflows/README.md`](workflows/README.md), `.github/workflows/`, and repository entry points such as [`../README.md`](../README.md).
