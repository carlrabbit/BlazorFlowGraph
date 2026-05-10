# NuGet Packaging and Publishing

This repository publishes the reusable .NET libraries as NuGet packages:

- `Diagram.Protocol`
- `Diagram.Semantics`
- `Diagram.Projection`
- `Diagram.Diffing`
- `Diagram.Blazor`

`Diagram.Blazor.Server` is intentionally not packaged because it is a `Microsoft.NET.Sdk.Web` host-oriented project.

## Best Practices Used in This Repository

1. **Pack only reusable libraries**  
   Keep application/host projects out of NuGet output.
2. **Keep package metadata centralized**  
   Shared metadata (license, repository URL, tags, readme, symbols) is configured in `Directory.Build.props`.
3. **Ship symbols**  
   `.snupkg` symbol packages are enabled for debugging and source navigation.
4. **Validate packaging in CI**  
   `dotnet pack` is run in CI so package regressions are caught early.
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
dotnet nuget push "artifacts/nuget/*.nupkg" \
  --source https://api.nuget.org/v3/index.json \
  --api-key "$NUGET_API_KEY" \
  --skip-duplicate
```

## Manual Setup Required (cannot be fully automated in this PR)

1. Create/verify package owners on NuGet.org for each package ID.
2. Create a NuGet.org API key with push scope for these package IDs.
3. Store the key as a GitHub Actions secret (for example `NUGET_API_KEY`).
4. Decide and document the release versioning policy (tags, prerelease suffixes, stable cadence).
5. Add/enable a publish workflow trigger policy (for example tag-based release-only publish) after maintainers confirm ownership and secret setup.
