#!/usr/bin/env bash
set -euo pipefail

required_files=(
  "README.md"
  "docs/PUBLIC-DOCS.md"
  "public-docs/getting-started.md"
  "public-docs/installation.md"
  "public-docs/concepts.md"
  "public-docs/packages.md"
  "public-docs/samples.md"
  "public-docs/diagnostics.md"
  "public-docs/versioning.md"
  "public-docs/release-notes.md"
  "public-docs/nuget/package-readme.md"
)

required_dirs=(
  "public-docs/api"
  "public-docs/diagnostics"
  "public-docs/guides"
  "public-docs/nuget"
  "public-docs/samples"
  "public-docs/website"
)

missing=0

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "Missing required public documentation file: $file" >&2
    missing=1
  fi
done

for dir in "${required_dirs[@]}"; do
  if [ ! -d "$dir" ]; then
    echo "Missing required public documentation directory: $dir" >&2
    missing=1
  fi
done

if [ -f public-docs/README.md ]; then
  echo "public-docs/README.md is not allowed. Use docs/PUBLIC-DOCS.md and named source files instead." >&2
  missing=1
fi

if [ "$missing" -ne 0 ]; then
  echo "Public documentation validation failed. See errors above and update docs/PUBLIC-DOCS.md + public-docs/." >&2
  exit 1
fi

echo "Public documentation validation passed."
