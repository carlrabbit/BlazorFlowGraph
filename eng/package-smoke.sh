#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# shellcheck source=eng/common.sh
. "$SCRIPT_DIR/common.sh"

require_command dotnet
require_command python3

VERSION="${1:-${RELEASE_VERSION:-}}"
if [ -z "$VERSION" ]; then
  echo "Usage: ./eng/package-smoke.sh <version>" >&2
  echo "Example: ./eng/package-smoke.sh 0.0.0-local" >&2
  exit 1
fi

PACKAGE_DIR="$REPO_ROOT/artifacts/nuget"
if [ ! -d "$PACKAGE_DIR" ]; then
  echo "Missing artifacts/nuget. Run ./eng/package.sh <version> first." >&2
  exit 1
fi

required_packages=(
  "BlazorFlowGraph.Blazor"
  "BlazorFlowGraph.Protocol"
  "BlazorFlowGraph.Semantics"
  "BlazorFlowGraph.Projection"
  "BlazorFlowGraph.Diffing"
)

for pkg in "${required_packages[@]}"; do
  if [ ! -f "$PACKAGE_DIR/$pkg.$VERSION.nupkg" ]; then
    echo "Missing package artifact: artifacts/nuget/$pkg.$VERSION.nupkg" >&2
    echo "Run ./eng/package.sh $VERSION and ensure package version matches." >&2
    exit 1
  fi
done

TEMP_DIR="$(mktemp -d /tmp/blazor-flow-graph-package-smoke-XXXXXX)"
trap 'rm -rf "$TEMP_DIR"' EXIT

PROJECT_DIR="$TEMP_DIR/Consumer"

dotnet new console --output "$PROJECT_DIR" --framework net10.0

cat > "$PROJECT_DIR/NuGet.Config" <<NUGET
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <clear />
    <add key="local" value="$PACKAGE_DIR" />
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
  </packageSources>
</configuration>
NUGET

dotnet add "$PROJECT_DIR/Consumer.csproj" package BlazorFlowGraph.Blazor --version "$VERSION" --source "$PACKAGE_DIR"

cp "$REPO_ROOT/tests/package-smoke/consumer-program.cs" "$PROJECT_DIR/Program.cs"

dotnet restore "$PROJECT_DIR/Consumer.csproj" --configfile "$PROJECT_DIR/NuGet.Config"
dotnet build "$PROJECT_DIR/Consumer.csproj" --no-restore --configuration Release

python3 - "$PACKAGE_DIR/BlazorFlowGraph.Blazor.$VERSION.nupkg" <<'PY'
import sys
import zipfile

package_path = sys.argv[1]
expected_paths = {
    "staticwebassets/js/dataflow-visualizer.js",
    "staticwebassets/_content/BlazorFlowGraph.Blazor/js/dataflow-visualizer.js",
}
with zipfile.ZipFile(package_path, "r") as zf:
    names = set(zf.namelist())
if not expected_paths.intersection(names):
    raise SystemExit(
        "Missing static web asset in package. "
        f"Expected one of: {sorted(expected_paths)}"
    )
print("Static web asset validation passed.")
PY

echo "Package smoke validation passed for version $VERSION."
