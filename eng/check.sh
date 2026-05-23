#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

"$SCRIPT_DIR/restore.sh"
"$SCRIPT_DIR/build.sh"
"$SCRIPT_DIR/test.sh"

dotnet format BlazorFlowGraph.slnx --verify-no-changes

if [ -f biome.json ]; then
  # Biome lint and format check.
  bun run check

  # TypeScript typecheck for all source packages.
  # Workspace filter (bun run --filter) requires scripts in the lockfile (Bun 1.3 limitation).
  # See docs/engineering/typescript-tools.md for context.
  for pkg in src/TypeScript/packages/*; do
    if [ -f "$pkg/package.json" ]; then
      bun run --cwd "$pkg" typecheck
    fi
  done
fi
