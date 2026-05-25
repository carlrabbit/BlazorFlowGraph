#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=eng/common.sh
. "$(cd "$(dirname "$0")" && pwd)/common.sh"

require_command dotnet

build_args=(dotnet build BlazorFlowGraph.slnx --no-restore --configuration Release)

if [ -n "${RELEASE_VERSION:-}" ]; then
  if [[ ! "$RELEASE_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "RELEASE_VERSION must use 4-segment dotted numeric format (e.g. 1.0.0.0)." >&2
    exit 1
  fi

  RELEASE_TAG="${RELEASE_TAG:-$RELEASE_VERSION}"
  build_args+=(
    /p:Version="$RELEASE_VERSION"
    /p:PackageVersion="$RELEASE_VERSION"
    /p:AssemblyVersion="$RELEASE_VERSION"
    /p:FileVersion="$RELEASE_VERSION"
    /p:InformationalVersion="$RELEASE_TAG"
  )
fi

"${build_args[@]}"

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

if [ "${REFRESH_PACKAGED_BROWSER_BUNDLE:-0}" = "1" ]; then
  cp src/TypeScript/packages/host/dist/browser.iife.js src/DotNet/BlazorFlowGraph.Blazor/wwwroot/js/dataflow-visualizer.js
fi
