# AI Spec How-To

Use the `docs/ai/` folder for AI-readable, implementation-oriented reference documents.

These specs should help an AI assistant make changes that stay aligned with the repository's current architecture, boundaries, and planned direction.

## Purpose

Each AI spec should:

- describe the current repository reality first
- separate current behavior from planned behavior
- reinforce runtime boundaries
- use repository terms consistently
- point back to the canonical human-facing docs when needed

## Folder Structure

Place focused topic documents in `docs/ai/`.

Current seed documents:

- `docs/ai/architecture.md`
- `docs/ai/protocol.md`
- `docs/ai/rendering.md`

Add new documents only when a topic has enough design weight to justify its own spec.

## Recommended Document Shape

Prefer this structure:

1. **Title**
2. **Scope** — what the document covers
3. **Current State** — what exists in the repository today
4. **Responsibilities / Boundaries** — what belongs where
5. **Key Data or Control Flow** — how the subsystem works
6. **Constraints** — rules an implementation should preserve
7. **Planned Direction** — clearly marked future intent
8. **Related Docs** — links to canonical docs or ADRs

## Writing Rules

- Be explicit about whether something is current, planned, or intentionally out of scope.
- Prefer repository-specific guidance over generic framework advice.
- Use the existing package and project names exactly as they appear in the repository.
- Keep statements deterministic and actionable.
- Do not describe BlazorFlowGraph as a general-purpose diagram editor.
- Do not move rendering, reconciliation, or layout responsibilities into Blazor components.
- Do not present planned ELK-based layout as if it is already the production implementation.

## Consistency Checklist

Before adding or updating an AI spec, verify consistency with:

- `README.md`
- `docs/architecture/system-overview.md`
- `docs/protocol/contracts.md`
- `docs/rendering/model.md`
- relevant ADRs under `docs/decisions/`

## Good Spec Characteristics

- short enough to scan quickly
- precise enough to constrain implementation choices
- aligned with stable IDs, diff-based updates, and runtime separation
- clear about authoritative sources of truth

## When to Create a New AI Spec

Create a new `docs/ai/*.md` document when:

- a subsystem has important architectural boundaries
- the topic is referenced repeatedly in issue work
- an AI assistant could otherwise confuse current behavior with future plans

If a topic is small, expand an existing AI spec instead of creating a fragmented new file.
