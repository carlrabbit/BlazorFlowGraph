#!/usr/bin/env bash
set -euo pipefail

# Pack all IsPackable projects from src/DotNet into artifacts/nuget.
# Requires a prior build. Version properties are read from environment variables.
#
# Required environment variables:
#   RELEASE_VERSION   - dotted numeric version, e.g. 1.0.0.0
#   RELEASE_TAG       - full tag string, e.g. v1.0.0.0 (defaults to RELEASE_VERSION)
#
# Usage (from the repository root):
#   RELEASE_VERSION=1.0.0.0 RELEASE_TAG=v1.0.0.0 ./eng/package.sh

: "${RELEASE_VERSION:?RELEASE_VERSION must be set (e.g. RELEASE_VERSION=1.0.0.0)}"
: "${RELEASE_TAG:=${RELEASE_VERSION}}"

mkdir -p artifacts/nuget

while IFS= read -r project; do
  is_packable="$(dotnet msbuild "$project" -nologo -getProperty:IsPackable)"
  if [ "$is_packable" != "true" ]; then
    echo "Skipping non-packable project: $project"
    continue
  fi

  echo "Packing project: $project"
  if ! dotnet pack "$project" --no-build --configuration Release --output artifacts/nuget \
    /p:Version="${RELEASE_VERSION}" \
    /p:PackageVersion="${RELEASE_VERSION}" \
    /p:AssemblyVersion="${RELEASE_VERSION}" \
    /p:FileVersion="${RELEASE_VERSION}" \
    /p:InformationalVersion="${RELEASE_TAG}"; then
    echo "Failed to pack project: $project" >&2
    exit 1
  fi
done < <(find src/DotNet -name "*.csproj" -type f | sort)
