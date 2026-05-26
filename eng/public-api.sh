#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# shellcheck source=eng/common.sh
. "$SCRIPT_DIR/common.sh"

require_command dotnet

BASELINE_DIR="$REPO_ROOT/tests/package-smoke/public-api"
if [ ! -d "$BASELINE_DIR" ]; then
  echo "Missing baseline directory: tests/package-smoke/public-api" >&2
  exit 1
fi

# Selected strategy (explicit stub):
# - maintain one baseline declaration file per packable project under tests/package-smoke/public-api/
# - file name: <PackageId>.txt
# - release-check validates that every packable project has an intentional baseline declaration

mapfile -t projects < <(find "$REPO_ROOT/src/DotNet" -name "*.csproj" -type f | sort)

missing=0
for project in "${projects[@]}"; do
  is_packable="$(dotnet msbuild "$project" -nologo -property:Configuration=Release -getProperty:IsPackable)"
  if [ "$is_packable" != "true" ]; then
    continue
  fi

  package_id="$(dotnet msbuild "$project" -nologo -property:Configuration=Release -getProperty:PackageId | tail -n 1)"
  baseline_file="$BASELINE_DIR/$package_id.txt"

  if [ ! -f "$baseline_file" ]; then
    echo "Missing public API baseline declaration: tests/package-smoke/public-api/$package_id.txt" >&2
    missing=1
    continue
  fi

  if ! grep -q "^PackageId: $package_id$" "$baseline_file"; then
    echo "Baseline declaration must include exact package id header: PackageId: $package_id" >&2
    echo "File: $baseline_file" >&2
    missing=1
  fi
done

if [ "$missing" -ne 0 ]; then
  echo "Public API validation failed. Add/update baseline declaration files in tests/package-smoke/public-api/." >&2
  exit 1
fi

echo "Public API baseline declaration validation passed."
