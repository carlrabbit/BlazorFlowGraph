# .NET Guardrails

## Purpose

.NET guardrails define language-specific constraints for implementation and dependency management.

## Constraints

- Keep canonical .NET execution routed through `eng/` scripts and `docs/engineering/command-contract.md`.
- Do not use `dotnet test` for repository test projects that run through Microsoft Testing Platform command hosts; follow the documented `eng/test.sh` path.
- Keep central NuGet package version management in `Directory.Packages.props`.
- Do not hardcode NuGet package versions in individual `.csproj` files.
- Keep XML/public API docs consumer-oriented: intent, contract, constraints, and failure behavior.
- Public API changes must be intentional and validated by `./eng/public-api.sh` before release.

## Authority

This document is authoritative for .NET-specific guardrails in this repository.

## Document Contract

Update this document when .NET execution paths, API documentation expectations, or package-management constraints change. Keep it synchronized with [`../../GUARDRAILS.md`](../../GUARDRAILS.md), [`../../ENGINEERING.md`](../../ENGINEERING.md), [`../../PUBLIC-DOCS.md`](../../PUBLIC-DOCS.md), [`../../../AGENTS.md`](../../../AGENTS.md), and [`../../engineering/command-contract.md`](../../engineering/command-contract.md).
