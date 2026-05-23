# AGENTS

Read first:
- README.md
- docs/TERMINOLOGY.md
- docs/SPECS.md
- docs/WORKFLOWS.md
- docs/TBPS.md
- docs/ENGINEERING.md
- docs/GUARDRAILS.md
- docs/agent-context/project-context.md

Engineering commands:
- `./eng/restore.sh` — restore dependencies
- `./eng/build.sh` — build all projects
- `./eng/test.sh` — run all tests
- `./eng/format.sh` — format source code
- `./eng/check.sh` — full validation (restore → build → test → format check)

**Agents must run `./eng/check.sh` before declaring implementation work complete.**

Routing rules:
- terminology changes -> `docs/TERMINOLOGY.md`
- behavior changes -> `docs/SPECS.md` and `docs/specs/`
- structure changes -> `docs/architecture/`
- rationale changes -> `docs/decisions/`
- process changes -> `docs/TBPS.md` and `docs/tbps/`
- workflow intent changes -> `docs/workflows/`
- workflow implementation changes -> `.github/workflows/`
- engineering commands/scripts -> `docs/engineering/command-contract.md`
- test guardrails -> `docs/guardrails/testing.md`

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
