# NuGet Packaging and Publishing

This repository publishes the reusable .NET libraries as NuGet packages:

- `BlazorFlowGraph.Protocol`
- `BlazorFlowGraph.Semantics`
- `BlazorFlowGraph.Projection`
- `BlazorFlowGraph.Diffing`
- `BlazorFlowGraph.Blazor`

`Diagram.Blazor.Server` is intentionally not packaged because it is a `Microsoft.NET.Sdk.Web` host-oriented project.

## Best Practices Used in This Repository

1. **Pack only reusable libraries**  
   Keep application/host projects out of NuGet output.
2. **Keep package metadata centralized**  
   Shared metadata (license, repository URL, tags, readme, symbols) is configured in `Directory.Build.props`.
3. **Ship symbols**  
   `.snupkg` symbol packages are enabled for debugging and source navigation.
4. **Publish only from release tags**  
   The publish workflow only runs for tags matching `vX.X.X.X` that point at `main`, or by manual dispatch with a required `vX.X.X.X` input.
   The resolved release version is applied to the packed .NET assemblies/packages and to the generated TypeScript browser bundle before packing.
   NuGet pack/publish validation is release-triggered and is no longer part of the default `CI` workflow.
   Use the local packing commands below before tagging to validate package output early.
5. **Include package readme**  
   This file is embedded into packages as `PackageReadmeFile`.

## Local Packing

```bash
dotnet restore BlazorFlowGraph.slnx
dotnet build BlazorFlowGraph.slnx --configuration Release
dotnet pack src/DotNet/Diagram.Protocol/Diagram.Protocol.csproj --no-build --configuration Release --output artifacts/nuget
dotnet pack src/DotNet/Diagram.Semantics/Diagram.Semantics.csproj --no-build --configuration Release --output artifacts/nuget
dotnet pack src/DotNet/Diagram.Projection/Diagram.Projection.csproj --no-build --configuration Release --output artifacts/nuget
dotnet pack src/DotNet/Diagram.Diffing/Diagram.Diffing.csproj --no-build --configuration Release --output artifacts/nuget
dotnet pack src/DotNet/Diagram.Blazor/Diagram.Blazor.csproj --no-build --configuration Release --output artifacts/nuget
```

## Publishing Example

```bash
git tag v1.0.0.0
git push origin v1.0.0.0
```

The `NuGet Publish` workflow handles pack + push using `NUGET_API_KEY`.
You can also trigger it manually from GitHub Actions by supplying a `release_version` value like `v1.0.0.0`.

## Manual Setup Required (cannot be fully automated in this PR)

1. Create/verify package owners on NuGet.org for each package ID.
2. Create a NuGet.org API key with push scope for these package IDs.
3. Store the key as a GitHub Actions secret (for example `NUGET_API_KEY`).
4. Decide and document the release versioning policy (tags, prerelease suffixes, stable cadence).
5. Create and push release tags using the required format (`vX.X.X.X`) to trigger publishing.
