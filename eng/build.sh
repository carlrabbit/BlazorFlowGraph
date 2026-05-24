#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=eng/common.sh
. "$(cd "$(dirname "$0")" && pwd)/common.sh"

require_command dotnet

dotnet build BlazorFlowGraph.slnx --no-restore --configuration Release

if [ -f package.json ]; then
  require_command bun

  # Build TypeScript packages in topological dependency order.
  # Each package's build script uses bun build for bundling and tsc --emitDeclarationOnly
  # for TypeScript declarations.
  bun run --cwd src/TypeScript/packages/protocol build
  bun run --cwd src/TypeScript/packages/runtime build
  bun run --cwd src/TypeScript/packages/layout build
  bun run --cwd src/TypeScript/packages/interop build
  bun run --cwd src/TypeScript/packages/renderer-svg build
  bun run --cwd src/TypeScript/packages/query build
  bun run --cwd src/TypeScript/packages/host build
fi
