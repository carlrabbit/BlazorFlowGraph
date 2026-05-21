#!/usr/bin/env bash
# NOTE: Run this script after making any changes to it or to samples/SAMPLES.json
# to verify that the validation logic is working correctly.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
registry_path="$repo_root/samples/SAMPLES.json"

errors=()

if [[ ! -f "$registry_path" ]]; then
  echo "Sample registry not found: $registry_path" >&2
  exit 1
fi

if ! jq empty "$registry_path" 2>/dev/null; then
  echo "Failed to parse sample registry: $registry_path" >&2
  exit 1
fi

if ! jq -e '(.samples | type) == "array" and (.samples | length) > 0' "$registry_path" > /dev/null; then
  echo "samples/SAMPLES.json must contain a non-empty 'samples' array." >&2
  exit 1
fi

declare -A seen_ids
declare -A seen_ports
missing_entries=()
extra_entries=()

sample_count=$(jq '.samples | length' "$registry_path")

for (( i = 0; i < sample_count; i++ )); do
  index=$((i + 1))

  missing_fields=()
  for field in id name description projectPath port path; do
    if ! jq -e --arg f "$field" ".samples[$i] | has(\$f)" "$registry_path" > /dev/null; then
      missing_fields+=("$field")
    fi
  done

  if [[ ${#missing_fields[@]} -gt 0 ]]; then
    errors+=("Entry $index is missing required fields: $(IFS=', '; echo "${missing_fields[*]}")")
    continue
  fi

  sample_id=$(jq -r ".samples[$i].id" "$registry_path")
  project_path=$(jq -r ".samples[$i].projectPath" "$registry_path")
  port=$(jq -r ".samples[$i].port" "$registry_path")
  path_value=$(jq -r ".samples[$i].path" "$registry_path")

  if [[ -z "${sample_id// }" ]]; then
    errors+=("Entry $index has invalid id: $sample_id")
  else
    seen_ids["$sample_id"]=$(( ${seen_ids["$sample_id"]:-0} + 1 ))
  fi

  if [[ -z "${project_path// }" ]]; then
    errors+=("Entry $index has invalid projectPath: $project_path")
  elif [[ ! -f "$repo_root/$project_path" ]]; then
    errors+=("Entry $index projectPath does not exist: $project_path")
  fi

  if ! [[ "$port" =~ ^[0-9]+$ ]]; then
    errors+=("Entry $index port must be an integer: $port")
  else
    if (( port < 5100 || port > 5199 )); then
      errors+=("Entry $index port $port is outside reserved range 5100-5199.")
    fi
    if [[ -n "${seen_ports[$port]+_}" ]]; then
      errors+=("Duplicate port $port: '${seen_ports[$port]}' and '$sample_id'.")
    else
      seen_ports[$port]=$sample_id
    fi
  fi

  if [[ -z "${path_value// }" ]]; then
    errors+=("Entry $index has invalid path value: $path_value")
  elif [[ "$path_value" != /* ]]; then
    errors+=("Entry $index path must start with '/': $path_value")
  fi
done

for sample_id in "${!seen_ids[@]}"; do
  count=${seen_ids["$sample_id"]}
  if (( count > 1 )); then
    errors+=("Duplicate sample id '$sample_id' appears $count times.")
  fi
done

mapfile -t fs_projects < <(
  find "$repo_root/samples" -maxdepth 2 -name "*.csproj" \
    | sort \
    | sed "s|^$repo_root/||"
)

mapfile -t registry_projects < <(
  jq -r '[.samples[].projectPath] | sort[]' "$registry_path"
)

for proj in "${fs_projects[@]}"; do
  found=0
  for reg_proj in "${registry_projects[@]}"; do
    [[ "$proj" == "$reg_proj" ]] && { found=1; break; }
  done
  (( found )) || missing_entries+=("$proj")
done

for reg_proj in "${registry_projects[@]}"; do
  found=0
  for proj in "${fs_projects[@]}"; do
    [[ "$proj" == "$reg_proj" ]] && { found=1; break; }
  done
  (( found )) || extra_entries+=("$reg_proj")
done

if [[ ${#missing_entries[@]} -gt 0 ]]; then
  errors+=("Sample projects missing from registry: $(IFS=', '; echo "${missing_entries[*]}")")
fi

if [[ ${#extra_entries[@]} -gt 0 ]]; then
  errors+=("Registry entries pointing to missing projects: $(IFS=', '; echo "${extra_entries[*]}")")
fi

if ! jq -e '[.samples[] | select(.id == "sample-index")] | length > 0' "$registry_path" > /dev/null; then
  errors+=("Registry must include id='sample-index'.")
else
  sample_index_port=$(jq -r '.samples[] | select(.id == "sample-index") | .port' "$registry_path")
  if [[ "$sample_index_port" != "5100" ]]; then
    errors+=("SampleIndex must be assigned to port 5100.")
  fi
fi

if [[ ${#errors[@]} -gt 0 ]]; then
  echo "Sample registry validation failed:" >&2
  for error in "${errors[@]}"; do
    echo "- $error" >&2
  done
  exit 1
fi

echo "Sample registry validation passed."
