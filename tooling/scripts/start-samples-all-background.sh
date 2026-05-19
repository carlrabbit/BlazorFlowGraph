#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
launcher="$repo_root/tooling/scripts/run-samples-all.sh"
repo_name="$(basename "$repo_root" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9._-' '-')"
tmp_dir="/tmp/$repo_name"
pid_file="$tmp_dir/run-samples-all.pid"
log_file="$tmp_dir/run-samples-all.log"

if [[ ! -x "$launcher" ]]; then
  echo "Sample launcher script is missing or not executable: $launcher" >&2
  exit 1
fi

mkdir -p "$tmp_dir"

if [[ -f "$pid_file" ]]; then
  existing_pid="$(cat "$pid_file")"
  if [[ -n "$existing_pid" ]] && kill -0 "$existing_pid" 2>/dev/null; then
    echo "Sample launcher is already running (pid: $existing_pid)."
    echo "Log file: $log_file"
    exit 0
  fi

  rm -f "$pid_file"
fi

nohup "$launcher" > "$log_file" 2>&1 &
pid="$!"
echo "$pid" > "$pid_file"

sleep 1
if ! kill -0 "$pid" 2>/dev/null; then
  rm -f "$pid_file"
  echo "Sample launcher failed to stay running. See log file: $log_file" >&2
  exit 1
fi

echo "Started sample launcher in background (pid: $pid)."
echo "Log file: $log_file"
echo ""
echo "Samples are starting. Build and launch may take a minute."
echo "To check readiness:"
echo "  ss -ltnp | grep -E '5100|5101|5102|5103|5104|5105'"
echo "  curl -sv http://localhost:5100"
echo "  curl -sv http://localhost:5101"
echo "If samples do not come up, inspect the log:"
echo "  cat $log_file"
exit 0
