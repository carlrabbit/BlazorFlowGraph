#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=eng/common.sh
. "$(cd "$(dirname "$0")" && pwd)/common.sh"

require_command dotnet

dotnet format BlazorFlowGraph.slnx

if [ -f biome.json ]; then
  require_command bun
  bun run format
fi
