# Goal

Define the repository validation workflow that restores dependencies, builds the codebase, runs automated tests, validates sample builds, and verifies package generation for pull requests and mainline changes.

# Constraints

- the workflow must validate both the .NET and TypeScript stacks
- the workflow must validate release-critical sample and package paths
- workflow implementation must stay aligned with documented repository commands
- workflow YAML should stay implementation-focused and defer rationale to this document
- test execution must reflect the repository's current test runner choices

# Non-Goals

- packaging or publishing release artifacts
- documenting every implementation detail of GitHub Actions syntax
- duplicating architecture or TBP content that already exists elsewhere

# Relevant Other Workflows

- [`publish-nuget.md`](publish-nuget.md)

# Inputs

- repository contents on `main`
- pull request branches targeting `main`
- repository toolchain definitions such as `global.json` and `bun.lock`

# Outputs

- build success or failure status for .NET and TypeScript
- automated test results for .NET executable test projects and TypeScript Vitest suites
- sample build validation status for all maintained sample apps
- package generation validation status for packable .NET library projects
- uploaded .NET test result artifacts when supported by workflow implementation

# Trigger Conditions

- push to `main`
- pull request targeting `main`

# Failure Conditions

- dependency restore fails
- .NET build fails
- TypeScript build or typecheck fails
- any .NET or TypeScript test suite fails
- any sample app fails to restore/build
- packable library projects fail to pack
- workflow implementation drifts from the documented commands or repository structure

# Synchronization Rules

- update this document before changing `.github/workflows/ci.yml`
- keep documented commands aligned with `README.md`, workflow YAML, and repository scripts
- if validation scope changes repeatedly, capture the process in a TBP
