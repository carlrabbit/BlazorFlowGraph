#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=eng/common.sh
. "$(cd "$(dirname "$0")" && pwd)/common.sh"

require_command dotnet

# TUnit uses Microsoft Testing Platform (MTP) and runs via dotnet run.
# TestCategory filter: no slow or e2e tests in the default path.
dotnet run --no-build --project tests/DotNet/BlazorFlowGraph.Protocol.Tests --configuration Release
dotnet run --no-build --project tests/DotNet/BlazorFlowGraph.Diffing.Tests --configuration Release
dotnet run --no-build --project tests/DotNet/BlazorFlowGraph.Projection.Tests --configuration Release
dotnet run --no-build --project tests/DotNet/BlazorFlowGraph.Semantics.Tests --configuration Release

if [ -f package.json ]; then
  require_command bun

  # Run TypeScript tests in all src and test packages.
  for pkg in src/TypeScript/packages/* tests/TypeScript/*; do
    if [ -f "$pkg/package.json" ]; then
      bun run --cwd "$pkg" test
    fi
  done
fi
