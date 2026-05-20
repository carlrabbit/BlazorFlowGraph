#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
registry_path="$repo_root/samples/SAMPLES.json"
validate_script="$repo_root/tooling/scripts/validate-samples-registry.sh"
bind_host="${SAMPLES_BIND_HOST:-0.0.0.0}"
state_dir="/tmp/blazor-flow-graph-samples"
default_log_file="$state_dir/samples.log"
detach_mode=0
dry_run=0
log_file=""

sample_entries=()
pids=()

usage() {
  cat <<'EOF'
Usage: tooling/scripts/run-samples-all.sh [--detach] [--dry-run] [--log-file PATH]

  --detach         Start sample processes in the background and exit.
  --dry-run        Print restore/build/run commands without executing them.
                   Run this after changing the launcher.
  --log-file PATH  Append detached sample output to PATH.

Environment:
  SAMPLES_BIND_HOST  Host interface for sample URLs. Defaults to 0.0.0.0 so
                     forwarded ports work in dev containers and Codespaces.
                     Set to 127.0.0.1 for loopback-only local runs.
EOF
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --detach)
        detach_mode=1
        shift
        ;;
      --dry-run)
        dry_run=1
        shift
        ;;
      --log-file)
        if [[ $# -lt 2 ]]; then
          echo "Missing value for --log-file" >&2
          usage >&2
          exit 1
        fi

        log_file="$2"
        shift 2
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        echo "Unknown argument: $1" >&2
        usage >&2
        exit 1
        ;;
    esac
  done
}

sample_pid_file() {
  local sample_id="$1"
  local safe_id
  safe_id="$(printf '%s' "$sample_id" | tr -c 'a-zA-Z0-9_.-' '-')"
  echo "$state_dir/$safe_id.pid"
}

print_dry_run_command() {
  printf '[dry-run]'
  printf ' %q' "$@"
  printf '\n'
}

run_command() {
  if (( dry_run )); then
    print_dry_run_command "$@"
    return
  fi

  "$@"
}

read_sample_entries() {
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
}

is_port_available() {
  local host="$1"
  local port="$2"

  python3 - "$host" "$port" <<'PY'
import socket
import sys

host = sys.argv[1]
port = int(sys.argv[2])
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        sock.bind((host, port))
    except OSError:
        raise SystemExit(1)
PY
}

read_pid_file() {
  local pid_file="$1"
  if [[ -f "$pid_file" ]]; then
    local pid
    pid="$(head -n 1 "$pid_file" | tr -d '[:space:]')"
    if [[ "$pid" =~ ^[0-9]+$ ]]; then
      printf '%s\n' "$pid"
    fi
  fi
}

is_pid_running() {
  local pid="$1"
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
}

clear_stale_pid_file() {
  local pid_file="$1"
  local pid
  pid="$(read_pid_file "$pid_file")"

  if [[ -z "$pid" ]] || ! is_pid_running "$pid"; then
    rm -f "$pid_file"
  fi
}

prepare_detached_state() {
  mkdir -p "$state_dir"

  for entry in "${sample_entries[@]}"; do
    IFS=$'\t' read -r sample_id _name _project_path _port _path <<< "$entry"
    clear_stale_pid_file "$(sample_pid_file "$sample_id")"
  done
}

should_skip_detached_launch() {
  local running_count=0
  local total_count="${#sample_entries[@]}"
  local running_samples=()

  for entry in "${sample_entries[@]}"; do
    IFS=$'\t' read -r sample_id name _project_path _port _path <<< "$entry"
    local pid_file pid
    pid_file="$(sample_pid_file "$sample_id")"
    pid="$(read_pid_file "$pid_file")"

    if is_pid_running "$pid"; then
      running_count=$((running_count + 1))
      running_samples+=("$name ($sample_id, pid $pid, $pid_file)")
    fi
  done

  if (( running_count == total_count )); then
    echo "Detached sample set is already running. Nothing to do."
    echo "Sample index URL: http://localhost:5100"
    if [[ -n "$log_file" ]]; then
      echo "Log file: $log_file"
    fi
    return 0
  fi

  if (( running_count > 0 )); then
    echo "Partial detached sample state detected in $state_dir." >&2
    echo "Running sample processes:" >&2
    for sample in "${running_samples[@]}"; do
      echo "  - $sample" >&2
    done
    echo "Clean up the remaining sample processes and PID files before retrying:" >&2
    echo "  1. Stop the remaining sample processes listed above, for example: kill <pid>" >&2
    echo "  2. Remove the detached PID files: rm -f \"$state_dir\"/*.pid" >&2
    exit 1
  fi

  return 1
}

verify_required_ports() {
  for entry in "${sample_entries[@]}"; do
    IFS=$'\t' read -r _sample_id name _project_path port _path <<< "$entry"
    if ! is_port_available "$bind_host" "$port"; then
      echo "Port conflict: $name requires port $port on $bind_host, but it is already in use." >&2
      exit 1
    fi
  done
}

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

start_process() {
  local pid_file="$1"
  shift
  local sample_command=("$@")

  if (( dry_run )); then
    print_dry_run_command "${sample_command[@]}"
    return
  fi

  if (( detach_mode )); then
    nohup "${sample_command[@]}" >>"$log_file" 2>&1 &
    echo "$!" > "$pid_file"
    return
  fi

  "${sample_command[@]}" &
  pids+=("$!")
}

start_samples() {
  echo "Launching samples:"
  for entry in "${sample_entries[@]}"; do
    IFS=$'\t' read -r sample_id name project_path port path <<< "$entry"
    local pid_file url
    pid_file="$(sample_pid_file "$sample_id")"
    url="http://$bind_host:${port}${path}"
    echo "- $name => $url"
    start_process \
      "$pid_file" \
      dotnet run --project "$repo_root/$project_path" --no-launch-profile --no-build --configuration Release --urls "$url"
  done
}

verify_detached_samples_started() {
  local failed_samples=()

  # Briefly verify that detached dotnet hosts stay alive before reporting success.
  sleep 1

  for entry in "${sample_entries[@]}"; do
    IFS=$'\t' read -r sample_id name _project_path _port _path <<< "$entry"
    local pid_file pid
    pid_file="$(sample_pid_file "$sample_id")"
    pid="$(read_pid_file "$pid_file")"

    if ! is_pid_running "$pid"; then
      clear_stale_pid_file "$pid_file"
      failed_samples+=("$name")
    fi
  done

  if (( ${#failed_samples[@]} > 0 )); then
    echo "Detached startup failed for: ${failed_samples[*]}" >&2
    echo "See log file: $log_file" >&2
    exit 1
  fi
}

parse_args "$@"

if [[ ! -x "$validate_script" ]]; then
  echo "Validation script is missing or not executable: $validate_script" >&2
  exit 1
fi

"$validate_script"
read_sample_entries

if (( detach_mode )); then
  if [[ -z "$log_file" ]]; then
    log_file="$default_log_file"
  fi

  if (( ! dry_run )); then
    prepare_detached_state
    if should_skip_detached_launch; then
      exit 0
    fi

    mkdir -p "$(dirname "$log_file")"
    touch "$log_file"
  fi
fi

if (( ! dry_run )); then
  verify_required_ports
fi

echo "Sample ports:"
for entry in "${sample_entries[@]}"; do
  IFS=$'\t' read -r _sample_id name _project_path port path <<< "$entry"
  echo "  $port  $name ($path)"
done
echo

if (( dry_run )); then
  echo "Dry run: restore/build/run commands are printed only."
  echo
fi

echo "Building sample projects..."
for entry in "${sample_entries[@]}"; do
  IFS=$'\t' read -r _sample_id name project_path _port _path <<< "$entry"
  echo "- Restoring $name ($project_path)"
  run_command dotnet restore "$repo_root/$project_path"
  echo "- Building $name ($project_path)"
  run_command dotnet build "$repo_root/$project_path" --no-restore --configuration Release
done

start_samples

echo
echo "Sample index URL: http://localhost:5100"

if (( dry_run )); then
  if (( detach_mode )); then
    echo "Dry run log file: $log_file"
  fi
  echo "Dry run complete. Run this after changing tooling/scripts/run-samples-all.sh."
  exit 0
fi

if (( detach_mode )); then
  verify_detached_samples_started
  echo "Detached sample processes are running."
  echo "State directory: $state_dir"
  echo "Log file: $log_file"
  exit 0
fi

trap cleanup EXIT INT TERM

echo "All samples started. Press Ctrl+C to stop all sample processes."

if ! wait -n "${pids[@]}"; then
  echo "A sample process exited with a non-zero status." >&2
  exit 1
fi

echo "A sample process exited. Shutting down remaining samples."
