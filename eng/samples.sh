#!/usr/bin/env bash
set -euo pipefail

# Delegate to the samples orchestrator.
# Passes all arguments through, so --dry-run and --detach work as expected.
exec "$(cd "$(dirname "$0")/.." && pwd)/tooling/scripts/run-samples-all.sh" "$@"
