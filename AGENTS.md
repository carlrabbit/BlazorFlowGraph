# AGENTS

Read first:
- README.md
- docs/TERMINOLOGY.md
- docs/WORKFLOWS.md
- docs/TBPS.md
- docs/agent-context/project-context.md

When changing architecture or runtime boundaries:
- update docs/architecture first
- update docs/decisions when the change is durable and architectural
- keep docs/ai synchronized when AI-facing constraints change

When changing workflows:
- update docs/workflows first
- keep .github/workflows synchronized

When introducing terminology:
- update docs/TERMINOLOGY.md

When introducing recurring execution patterns:
- add or update docs/tbps

Avoid:
- duplicating architecture guidance across files
- putting workflow rationale inside workflow YAML
- redefining existing terms with new meanings
