#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VERSION="${1:-}"

if [ -z "$VERSION" ]; then
  echo "Usage: ./eng/release-check.sh <version>" >&2
  echo "Example: ./eng/release-check.sh 0.0.0-local" >&2
  exit 1
fi

"$SCRIPT_DIR/check.sh"
"$SCRIPT_DIR/build.sh"
"$SCRIPT_DIR/package.sh" "$VERSION"
"$SCRIPT_DIR/package-smoke.sh" "$VERSION"
"$SCRIPT_DIR/samples.sh" --dry-run
"$SCRIPT_DIR/public-api.sh"
"$SCRIPT_DIR/public-docs.sh"
