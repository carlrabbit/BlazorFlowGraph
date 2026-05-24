#!/usr/bin/env bash
set -euo pipefail

# Benchmarks are marked expensive and are never run as part of the default
# validation path. Run explicitly only when measuring performance.
#
# No benchmark projects are currently configured in this repository.
# When benchmarks are added under benchmarks/, update this script to:
#
#   dotnet run --configuration Release --project benchmarks/BlazorFlowGraph.Benchmarks
#
echo "No benchmark projects configured. See docs/engineering/command-contract.md." >&2
exit 1
