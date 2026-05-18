#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
registry_path="$repo_root/samples/SAMPLES.json"
validate_script="$repo_root/tooling/scripts/validate-samples-registry.sh"

if [[ ! -x "$validate_script" ]]; then
  echo "Validation script is missing or not executable: $validate_script" >&2
  exit 1
fi

"$validate_script"

mapfile -t sample_entries < <(
  python3 - "$registry_path" <<'PY'
import json
import sys
from pathlib import Path

registry_path = Path(sys.argv[1])
payload = json.loads(registry_path.read_text(encoding="utf-8"))
for sample in payload["samples"]:
    print("\t".join([
        sample["id"],
        sample["name"],
        sample["projectPath"],
        str(sample["port"]),
        sample["path"],
    ]))
PY
)

if [[ ${#sample_entries[@]} -eq 0 ]]; then
  echo "No sample entries found in $registry_path" >&2
  exit 1
fi

is_port_available() {
  local port="$1"
  python3 - "$port" <<'PY'
import socket
import sys

port = int(sys.argv[1])
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        sock.bind(("0.0.0.0", port))
    except OSError:
        raise SystemExit(1)
PY
}

for entry in "${sample_entries[@]}"; do
  IFS=$'\t' read -r _id name _project_path port _path <<< "$entry"
  if ! is_port_available "$port"; then
    echo "Port conflict: $name requires port $port, but it is already in use." >&2
    exit 1
  fi
done

echo "Building sample projects..."
for entry in "${sample_entries[@]}"; do
  IFS=$'\t' read -r _id name project_path _port _path <<< "$entry"
  echo "- Restoring $name ($project_path)"
  dotnet restore "$repo_root/$project_path"
  echo "- Building $name ($project_path)"
  dotnet build "$repo_root/$project_path" --no-restore --configuration Release
 done

pids=()
cleanup() {
  if [[ ${#pids[@]} -eq 0 ]]; then
    return
  fi

  echo "Stopping sample processes..."
  for pid in "${pids[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done

  for pid in "${pids[@]}"; do
    wait "$pid" 2>/dev/null || true
  done
}

trap cleanup EXIT INT TERM

echo "Launching samples:"
for entry in "${sample_entries[@]}"; do
  IFS=$'\t' read -r _id name project_path port path <<< "$entry"
  url="http://0.0.0.0:${port}${path}"
  echo "- $name => $url"
  dotnet run --project "$repo_root/$project_path" --no-launch-profile --no-build --configuration Release --urls "$url" &
  pids+=("$!")
 done

echo "All samples started. Press Ctrl+C to stop all sample processes."

if ! wait -n "${pids[@]}"; then
  echo "A sample process exited with a non-zero status." >&2
  exit 1
fi

echo "A sample process exited. Shutting down remaining samples."
