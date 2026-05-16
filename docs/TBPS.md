# Task Best Practices

TBPs define reusable methodology for recurring engineering work in this repository.

TBPs define:
- repository process
- synchronization expectations
- validation expectations
- required reading patterns
- repeatable execution steps for recurring work

TBPs do **not** define:
- feature semantics
- concrete implementation details
- architecture decisions
- one-off tasks

## TBP Layers

- **Foundational TBPs** establish how the repository creates and maintains its durable documentation and planning layers.
- **Governance TBPs** keep routing, indexing, and documentation authority synchronized.
- **Implementation TBPs** describe repeatable methods for feature work, bug work, and refactor work.
- **Operational TBPs** describe repeatable workflow and automation processes.

| Layer | TBP | Purpose |
|---|---|---|
| Foundational | [`add-tbp.md`](tbps/add-tbp.md) | Add new reusable process guidance without blurring authority boundaries |
| Foundational | [`create-spec.md`](tbps/create-spec.md) | Create a new behavioral specification and index it correctly |
| Foundational | [`create-milestone.md`](tbps/create-milestone.md) | Create a milestone sequencing document that references specs and decisions |
| Foundational | [`start-milestone.md`](tbps/start-milestone.md) | Start milestone execution from existing specs, decisions, and constraints |
| Foundational | [`finish-milestone.md`](tbps/finish-milestone.md) | Close a milestone and promote durable outcomes into the right authority layer |
| Foundational | [`documentation-review.md`](tbps/documentation-review.md) | Review documentation authority, routing, links, and synchronization |
| Foundational | [`terminology-management.md`](tbps/terminology-management.md) | Manage canonical repository terms across durable docs |
| Governance | [`documentation-changes.md`](tbps/documentation-changes.md) | Keep authoritative documentation, indexes, and routing documents synchronized |
| Implementation | [`feature-implementation.md`](tbps/feature-implementation.md) | Route feature work through specs, architecture, decisions, workflows, and TBPs |
| Implementation | [`bug-investigation.md`](tbps/bug-investigation.md) | Investigate bugs against authoritative expected behavior |
| Implementation | [`refactor-planning.md`](tbps/refactor-planning.md) | Plan structural changes while preserving documented behavior |
| Operational | [`workflow-changes.md`](tbps/workflow-changes.md) | Update workflow intent before changing GitHub Actions implementation |

# Authority

This document is authoritative for the repository TBP layer, TBP scope rules, TBP layer definitions, and the index of active TBPs.

# Document Contract

Update this document when a TBP is added, renamed, retired, or re-layered. Keep it synchronized with [`tbps/README.md`](tbps/README.md), issue forms under `.github/ISSUE_TEMPLATE/`, and any workflow or routing document that references TBPs.
