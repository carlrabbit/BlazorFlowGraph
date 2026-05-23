#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=eng/common.sh
. "$(cd "$(dirname "$0")" && pwd)/common.sh"

require_command dotnet

dotnet restore BlazorFlowGraph.slnx

if [ -f package.json ]; then
  require_command bun
  bun install --frozen-lockfile
fi
