# Workflows Directory

This directory stores workflow intent documents. GitHub Actions YAML stays in `.github/workflows/`, while workflow rationale, triggers, inputs, outputs, and failure conditions live here.

This repository uses project-specific workflow documents instead of generic `build.md`, `test.md`, and `release.md` files:

- [`ci-build.md`](ci-build.md) covers the repository's combined build and test validation workflow.
- [`publish-nuget.md`](publish-nuget.md) covers the repository's release and package publication workflow.

# Authority

This document is authoritative for workflow-document routing within `docs/workflows/`.

# Document Contract

Update this file when workflow intent documents are added, renamed, consolidated, or retired. Keep it synchronized with [`../WORKFLOWS.md`](../WORKFLOWS.md) and `.github/workflows/`.
