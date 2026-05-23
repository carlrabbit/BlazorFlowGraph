#!/usr/bin/env bash
set -euo pipefail

# Publish all .nupkg files from artifacts/nuget to NuGet.org.
# Requires eng/package.sh to have already run and produced packages.
# Package and publish are intentionally separate and never part of eng/check.sh.
#
# Required environment variables:
#   NUGET_API_KEY   - NuGet API key with push permissions

: "${NUGET_API_KEY:?NUGET_API_KEY must be set}"

shopt -s nullglob
packages=(artifacts/nuget/*.nupkg)
if [ ${#packages[@]} -eq 0 ]; then
  echo "No .nupkg files found in artifacts/nuget. Run ./eng/package.sh first." >&2
  exit 1
fi

for package in "${packages[@]}"; do
  dotnet nuget push "$package" \
    --source https://api.nuget.org/v3/index.json \
    --api-key "$NUGET_API_KEY" \
    --skip-duplicate
done
