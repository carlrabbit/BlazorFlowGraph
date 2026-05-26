# GitHub Copilot Instructions

Read:

- ../AGENTS.md
- ../docs/TERMINOLOGY.md
- ../docs/GUARDRAILS.md
- ../docs/ENGINEERING.md
- ../docs/TBPS.md
- ../docs/PUBLIC-DOCS.md when public-facing behavior may change
- relevant specs
- relevant architecture documents
- relevant decisions documents
- relevant workflows, guardrails, and engineering documents

Rules:

- Keep changes scoped.
- Prefer documented behavior over inferred behavior.
- Use canonical engineering commands from `../docs/ENGINEERING.md`.
- Use `eng/` scripts; do not invent build, test, format, benchmark, package, publish, or release command paths.
- Use short-running tests by default.
- Use `./eng/check.sh` to complete implementation validation.
- Use `./eng/release-check.sh <version>` for release work.
- Do not run package smoke tests or release checks unless explicitly requested.
- Do not run long-running tests, e2e tests, benchmarks, package, publish, or release commands unless explicitly requested.
- Do not add README files outside the repository root `README.md`.
- Keep NuGet package versions centralized in `Directory.Packages.props`.
- Use Bun + Biome for JS/TS tooling in this repository.
- Keep workflow intent in `docs/workflows/` synchronized with `.github/workflows/`.
- Update `public-docs/` when public behavior, packages, diagnostics, samples, release behavior, or public API changes.
