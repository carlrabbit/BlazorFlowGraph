# AGENTS

Read first:
- README.md
- docs/TERMINOLOGY.md
- docs/SPECS.md
- docs/WORKFLOWS.md
- docs/TBPS.md
- docs/ENGINEERING.md
- docs/engineering/command-contract.md
- docs/agent-context/project-context.md

## Required workflow

Before completing implementation work, run:

```sh
./eng/check.sh
```

If this command fails, fix the failure or document exactly why it could not be fixed.

## Repository rules

- Use `eng/` scripts instead of inventing raw `dotnet`, `bun`, or script commands.
- Do not add README files outside the root `README.md`.
- Do not add new root-level folders without updating documentation.
- Do not add package versions directly to project files. Use `Directory.Packages.props`.
- Do not use pnpm or npm. Use Bun for JavaScript/TypeScript tooling.
- Do not add ESLint or Prettier. Use Biome unless explicitly instructed otherwise.
- Do not introduce Vite or Vitest. Use `bun build` for bundling and `bun test` for testing.
- Do not add slow tests to the default test path (`eng/test.sh`).
- Do not run benchmarks during normal validation.
- Do not introduce Playwright unless the Playwright building block is applied.
- Prefer small, vertical changes over broad rewrites.
- Preserve the command contract under `eng/`.
- Package and publish are never part of `eng/check.sh`.

## Routing rules

- terminology changes → `docs/TERMINOLOGY.md`
- behavior changes → `docs/SPECS.md` and `docs/specs/`
- structure changes → `docs/architecture/`
- rationale changes → `docs/decisions/`
- process changes → `docs/TBPS.md` and `docs/tbps/`
- workflow intent changes → `docs/workflows/`
- workflow implementation changes → `.github/workflows/`
- engineering substrate changes → `docs/ENGINEERING.md` and `docs/engineering/`

When changing architecture or runtime boundaries:
- update docs/architecture first
- update docs/decisions when the change is durable and architectural
- keep docs/ai synchronized when AI-facing constraints change, but do not use AI-facing docs as replacements for specs, architecture, or decisions

When changing workflows:
- update docs/workflows first
- keep .github/workflows synchronized

When introducing terminology:
- update docs/TERMINOLOGY.md

When introducing recurring execution patterns:
- add or update docs/tbps

When working from project context docs:
- treat `docs/agent-context/` and `docs/ai/` as routing/context layers
- route durable behavior, structure, rationale, workflow intent, and process guidance back to specs, architecture, decisions, workflows, and TBPs

Avoid:
- duplicating architecture guidance across files
- putting workflow rationale inside workflow YAML
- redefining existing terms with new meanings
