# Workflows

Workflow intent is documented independently from GitHub Actions implementation.

This document is an index only. Detailed triggers, inputs, outputs, failure conditions, and synchronization rules live in the workflow documents under `docs/workflows/`.

| Workflow Spec | GitHub Actions File(s) | Purpose |
|---|---|---|
| [`workflows/build.md`](workflows/build.md) | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) | Defines build intent and canonical `eng/` command routing for CI |
| [`workflows/test-short.md`](workflows/test-short.md) | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) | Defines default short-running test validation in CI |
| [`workflows/test-long.md`](workflows/test-long.md) | _none (explicit/manual only)_ | Defines long-running test intent outside default CI path |
| [`workflows/package.md`](workflows/package.md) | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml), [`.github/workflows/nuget-publish.yml`](../.github/workflows/nuget-publish.yml) | Defines package generation intent and explicit packaging boundaries |
| [`workflows/public-docs.md`](workflows/public-docs.md) | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml), [`.github/workflows/nuget-publish.yml`](../.github/workflows/nuget-publish.yml) | Defines public documentation validation intent |
| [`workflows/release-check.md`](workflows/release-check.md) | [`.github/workflows/nuget-publish.yml`](../.github/workflows/nuget-publish.yml) | Defines non-publishing release-readiness validation intent |
| [`workflows/release.md`](workflows/release.md) | [`.github/workflows/nuget-publish.yml`](../.github/workflows/nuget-publish.yml) | Defines release validation + publish intent with explicit credential gating |

## Notes

- GitHub Pages is not an active module in this repository. If that changes, add and index `docs/workflows/pages.md` with the corresponding workflow implementation.

# Authority

This document is authoritative for the workflow index and the rule that workflow intent is documented separately from workflow implementation.

# Document Contract

Update this document when a workflow intent document or workflow YAML file is added, renamed, removed, or remapped. Keep it synchronized with `.github/workflows/` and repository entry points such as [`../README.md`](../README.md).
