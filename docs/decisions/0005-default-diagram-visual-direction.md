# ADR 0005 — Default Diagram Visual Direction

**Status:** Accepted

# Context

Milestone 009 introduces the first interactive tool for iterating on the default BlazorFlowGraph visual identity.

Before this decision, the repository had renderer style tokens for node kinds but no explicit rationale for the broader visual direction, token vocabulary, or why the project should avoid more decorative graph aesthetics.

# Decision

Adopt a calm technical dataflow direction as the default visual identity draft.

This means the default draft should:

- read like interactive technical documentation;
- keep nodes and labels more visually prominent than edges;
- reserve bright accents for semantic state, diagnostics, and interaction cues;
- prefer explicit tokens and state hints over ad-hoc hard-coded styling;
- support light, dark, and high-contrast draft comparison without redefining the underlying semantic roles.

The repository does not treat this milestone draft as the final public theming API. It is an experimental iteration tool used to converge on durable behavior that later specs may formalize.

# Consequences

- milestone 009 can centralize visual identity work around one draft token model;
- sample scenarios can compare readability, density, diagnostics, and change-state emphasis empirically;
- future work must justify decorative styling changes against this calm technical baseline;
- durable public theming commitments remain deferred until the draft stabilizes.

# Alternatives Considered

- adopting a decorative graph aesthetic with gradients, particles, or dashboard chrome;
- following a generic node-editor visual language with heavy affordance styling;
- delaying visual identity work until a later public theming API exists.

# Related Documents

- [`../milestones/milestone-009-visual-identity-iteration-tool.md`](../milestones/milestone-009-visual-identity-iteration-tool.md)
- [`../specs/default-visual-identity.md`](../specs/default-visual-identity.md)
- [`0001-svg-first.md`](0001-svg-first.md)
- [`0004-renderer-backend.md`](0004-renderer-backend.md)
