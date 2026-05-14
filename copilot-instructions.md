# Copilot Instructions

Primary repository documentation:
- docs/TERMINOLOGY.md
- docs/architecture/system-overview.md
- docs/architecture/backend-semantics.md
- docs/architecture/browser-runtime.md
- docs/architecture/blazor-hosting.md
- docs/decisions/
- docs/workflows/
- docs/tbps/

Repository conventions:
- Preserve semantic-model authority on the .NET side.
- Keep rendering, reconciliation, layout, and interaction logic in the browser runtime.
- Keep Blazor components thin and integration-focused.
- Preserve deterministic identifiers, deterministic projections, and incremental synchronization.

Workflow synchronization rules:
- Workflow intent is defined in docs/workflows.
- GitHub workflow YAML must remain synchronized with workflow docs.
- New recurring execution patterns should become TBPs instead of ad hoc notes.
