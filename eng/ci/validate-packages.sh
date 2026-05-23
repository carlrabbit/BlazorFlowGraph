#!/usr/bin/env sh
set -eu

# Packs all IsPackable src/DotNet projects as a release-readiness check.
mkdir -p artifacts/ci-pack

find src/DotNet -name "*.csproj" -type f | sort | while IFS= read -r project; do
  is_packable="$(dotnet msbuild "$project" -nologo -getProperty:IsPackable)"
  if [ "$is_packable" != "true" ]; then
    echo "Skipping non-packable project: $project"
    continue
  fi

  echo "Packing project: $project"
  dotnet pack "$project" --no-build --configuration Release --output artifacts/ci-pack
done
