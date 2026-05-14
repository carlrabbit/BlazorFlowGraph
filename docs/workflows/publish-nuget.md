# Goal

Define the release workflow that builds versioned NuGet packages and publishes them from validated repository releases.

# Constraints

- publishing must use an explicit release version in `vX.X.X.X` form
- packaging must rebuild the browser bundle that is shipped with `BlazorFlowGraph.Blazor`
- publishing must only operate on packable .NET projects
- workflow YAML should remain implementation-focused and rely on this document for intent

# Non-Goals

- replacing local development packaging guidance
- documenting every shell command in prose outside the workflow implementation
- publishing unversioned or ad hoc artifacts

# Relevant Other Workflows

- [`ci-build.md`](ci-build.md)

# Inputs

- a release tag matching `v*.*.*.*` or an explicit manually provided release version
- repository source at the tagged commit
- NuGet publishing credentials configured in repository secrets

# Outputs

- versioned `.nupkg` and `.snupkg` artifacts
- published NuGet packages for packable projects
- uploaded packaged artifacts for release inspection

# Trigger Conditions

- push of a release tag matching `v*.*.*.*`
- manual workflow dispatch with a valid release version input

# Failure Conditions

- release version validation fails
- TypeScript build or browser bundle refresh fails
- .NET restore, build, or pack fails
- no packable artifacts are produced
- NuGet credentials are missing or package publication fails

# Synchronization Rules

- update this document before changing `.github/workflows/nuget-publish.yml`
- keep packaging commands aligned with `Nuget.md`, workflow YAML, and the packaged browser bundle path
- if release preparation steps become a recurring engineering process outside the workflow, capture them in a TBP
