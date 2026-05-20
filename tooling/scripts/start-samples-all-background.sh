#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
launcher="$repo_root/tooling/scripts/run-samples-all.sh"
log_file="/tmp/blazor-flow-graph-samples.log"

if [[ ! -x "$launcher" ]]; then
  echo "Sample launcher script is missing or not executable: $launcher" >&2
  exit 1
fi

exec "$launcher" --detach --log-file "$log_file"
