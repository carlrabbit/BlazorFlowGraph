#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
launcher="$repo_root/tooling/scripts/run-samples-all.sh"
pid_file="/tmp/blazorflowgraph-run-samples-all.pid"
log_file="/tmp/blazorflowgraph-run-samples-all.log"

if [[ ! -x "$launcher" ]]; then
  echo "Sample launcher script is missing or not executable: $launcher" >&2
  exit 1
fi

if [[ -f "$pid_file" ]]; then
  existing_pid="$(cat "$pid_file")"
  if [[ -n "${existing_pid:-}" ]] && kill -0 "$existing_pid" 2>/dev/null; then
    echo "Sample launcher is already running (pid: $existing_pid)."
    echo "Log file: $log_file"
    exit 0
  fi

  rm -f "$pid_file"
fi

nohup bash "$launcher" > "$log_file" 2>&1 &
pid="$!"
echo "$pid" > "$pid_file"

echo "Started sample launcher in background (pid: $pid)."
echo "Log file: $log_file"
