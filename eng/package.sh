#!/usr/bin/env bash
set -euo pipefail

# Pack all IsPackable projects from src/DotNet into artifacts/nuget.
# Requires a prior build.
#
# Usage (from the repository root):
#   ./eng/package.sh 1.2.3
#   ./eng/package.sh 1.2.3-local
#   RELEASE_VERSION=1.2.3 RELEASE_TAG=v1.2.3 ./eng/package.sh

VERSION="${1:-${RELEASE_VERSION:-}}"
if [ -z "$VERSION" ]; then
  echo "Usage: ./eng/package.sh <version> (or set RELEASE_VERSION)" >&2
  exit 1
fi

RELEASE_TAG="${RELEASE_TAG:-$VERSION}"

version_core="${VERSION%%[-+]*}"
IFS='.' read -r major minor patch revision _ <<<"$version_core"
if [[ -z "${major:-}" || -z "${minor:-}" || -z "${patch:-}" ]]; then
  echo "Version must use semver-like format, e.g. 1.2.3 or 1.2.3-local." >&2
  exit 1
fi

assembly_version="${major}.${minor}.${patch}.${revision:-0}"

mkdir -p artifacts/nuget

while IFS= read -r project; do
  is_packable="$(dotnet msbuild "$project" -nologo -getProperty:IsPackable)"
  if [ "$is_packable" != "true" ]; then
    echo "Skipping non-packable project: $project"
    continue
  fi

  echo "Packing project: $project"
  if ! dotnet pack "$project" --no-build --configuration Release --output artifacts/nuget \
    /p:Version="${VERSION}" \
    /p:PackageVersion="${VERSION}" \
    /p:AssemblyVersion="${assembly_version}" \
    /p:FileVersion="${assembly_version}" \
    /p:InformationalVersion="${RELEASE_TAG}"; then
    echo "Failed to pack project: $project" >&2
    exit 1
  fi
done < <(find src/DotNet -name "*.csproj" -type f | sort)
