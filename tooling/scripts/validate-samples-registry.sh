#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
registry_path="$repo_root/samples/SAMPLES.json"

python3 - "$registry_path" "$repo_root" <<'PY'
from __future__ import annotations

import json
import sys
from pathlib import Path

registry_path = Path(sys.argv[1])
repo_root = Path(sys.argv[2])
errors: list[str] = []

if not registry_path.exists():
    print(f"Sample registry not found: {registry_path}", file=sys.stderr)
    raise SystemExit(1)

try:
    payload = json.loads(registry_path.read_text(encoding="utf-8"))
except json.JSONDecodeError as ex:
    print(f"Failed to parse sample registry: {ex}", file=sys.stderr)
    raise SystemExit(1)

samples = payload.get("samples")
if not isinstance(samples, list) or not samples:
    print("samples/SAMPLES.json must contain a non-empty 'samples' array.", file=sys.stderr)
    raise SystemExit(1)

required_fields = ("id", "name", "description", "projectPath", "port", "path")
seen_ids: dict[str, int] = {}
seen_ports: dict[int, str] = {}

for index, sample in enumerate(samples, start=1):
    if not isinstance(sample, dict):
        errors.append(f"Entry {index} must be an object.")
        continue

    missing = [field for field in required_fields if field not in sample]
    if missing:
        errors.append(f"Entry {index} is missing required fields: {', '.join(missing)}")
        continue

    sample_id = sample.get("id")
    project_path = sample.get("projectPath")
    port = sample.get("port")
    path_value = sample.get("path")

    if not isinstance(sample_id, str) or sample_id.strip() == "":
        errors.append(f"Entry {index} has invalid id: {sample_id!r}")
    else:
        seen_ids[sample_id] = seen_ids.get(sample_id, 0) + 1

    if not isinstance(project_path, str) or project_path.strip() == "":
        errors.append(f"Entry {index} has invalid projectPath: {project_path!r}")
    else:
        project_file = repo_root / project_path
        if not project_file.exists():
            errors.append(f"Entry {index} projectPath does not exist: {project_path}")

    if not isinstance(port, int):
        errors.append(f"Entry {index} port must be an integer: {port!r}")
    else:
        if port < 5100 or port > 5199:
            errors.append(f"Entry {index} port {port} is outside reserved range 5100-5199.")
        if port in seen_ports:
            errors.append(
                f"Duplicate port {port}: '{seen_ports[port]}' and '{sample_id}'."
            )
        else:
            seen_ports[port] = str(sample_id)

    if not isinstance(path_value, str) or path_value.strip() == "":
        errors.append(f"Entry {index} has invalid path value: {path_value!r}")
    elif not path_value.startswith("/"):
        errors.append(f"Entry {index} path must start with '/': {path_value!r}")

for sample_id, count in seen_ids.items():
    if count > 1:
        errors.append(f"Duplicate sample id '{sample_id}' appears {count} times.")

sample_projects = sorted(
    path.relative_to(repo_root).as_posix()
    for path in (repo_root / "samples").glob("*/*.csproj")
)
registry_projects = sorted(
    sample["projectPath"]
    for sample in samples
    if isinstance(sample, dict) and isinstance(sample.get("projectPath"), str)
)

missing_entries = sorted(set(sample_projects) - set(registry_projects))
extra_entries = sorted(set(registry_projects) - set(sample_projects))

if missing_entries:
    errors.append(
        "Sample projects missing from registry: " + ", ".join(missing_entries)
    )

if extra_entries:
    errors.append(
        "Registry entries pointing to missing projects: " + ", ".join(extra_entries)
    )

sample_index = next(
    (sample for sample in samples if isinstance(sample, dict) and sample.get("id") == "sample-index"),
    None,
)

if sample_index is None:
    errors.append("Registry must include id='sample-index'.")
elif sample_index.get("port") != 5100:
    errors.append("SampleIndex must be assigned to port 5100.")

if errors:
    print("Sample registry validation failed:", file=sys.stderr)
    for error in errors:
        print(f"- {error}", file=sys.stderr)
    raise SystemExit(1)

print("Sample registry validation passed.")
PY
