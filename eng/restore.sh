#!/usr/bin/env sh
set -eu

dotnet restore

if [ -f package.json ]; then
  if command -v pnpm >/dev/null 2>&1; then
    pnpm install --frozen-lockfile
  elif command -v bun >/dev/null 2>&1; then
    bun install --frozen-lockfile
  fi
fi
