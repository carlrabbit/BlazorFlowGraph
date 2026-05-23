# TypeScript Tools

This document describes the TypeScript and JavaScript tooling stack used in BlazorFlowGraph and documents the migration from pnpm to Bun + Biome.

## Current stack

| Tool | Purpose | Config |
|---|---|---|
| [Bun](https://bun.sh) | Runtime, package manager, workspace orchestration | `package.json`, `bunfig.toml` |
| [Biome](https://biomejs.dev) | Linter and formatter for TypeScript/JavaScript/JSON | `biome.json` |
| [Vite](https://vite.dev) | Bundler for library packages | per-package `vite.config.ts` |
| [TypeScript](https://www.typescriptlang.org) | Type checking and declaration emit | per-package `tsconfig.json`, root `tsconfig.base.json` |
| [Vitest](https://vitest.dev) | Unit testing | per-package `vitest.config.ts` or inline |

## Workspace layout

```text
package.json              root workspace, Bun scripts
bunfig.toml               Bun config: hoisted linker for tsc resolution
biome.json                Biome config: linting and formatting
tsconfig.base.json        shared TypeScript compiler options
src/TypeScript/packages/  library workspace packages
tests/TypeScript/         TypeScript test packages
```

## Canonical commands

```sh
bun install --frozen-lockfile          # install dependencies (via eng/restore.sh)
bun run check                          # Biome lint + format check
bun run format                         # Biome format (write)
bun run --cwd <package-path> build     # build a single package
bun run --cwd <package-path> test      # test a single package
bun run --cwd <package-path> typecheck # typecheck a single package
```

The `eng/` scripts orchestrate the full workspace:
- `./eng/restore.sh` calls `bun install --frozen-lockfile`
- `./eng/build.sh` calls `bun run --cwd <pkg> build` for each package in topological order
- `./eng/test.sh` calls `bun run --cwd <pkg> test` for each package
- `./eng/check.sh` calls `bun run check` (Biome) then `bun run --cwd <pkg> typecheck` for each source package
- `./eng/format.sh` calls `bun run format`

## Biome configuration

Biome handles linting and formatting for TypeScript, JavaScript, and JSON files.

Key settings (`biome.json`):
- Formatter: 2-space indent, 100-character line width
- Linter: recommended rules, with `noNonNullAssertion` disabled (intentional pattern in this codebase)
- Organize imports: enabled
- Ignore: `dist/`, `node_modules/`, `artifacts/`, `.NET` build outputs, generated `wwwroot/js/`

Run `bun run format` to apply formatting. Run `bun run check` to verify without changes.

## bunfig.toml: hoisted linker

`bunfig.toml` sets `linker = "hoisted"`, which makes Bun use a flat `node_modules` structure similar to npm/pnpm. This is required so TypeScript's compiler can resolve workspace package types through standard `node_modules` lookups.

Without the hoisted linker, workspace package symlinks may not be visible to `tsc` when running in individual package directories.

## Migration history: pnpm → Bun + Biome

This repository previously used pnpm for JavaScript/TypeScript tooling. The migration was performed to align with Engineering Guide V3.

**Removed:**
- `pnpm-lock.yaml` → replaced by `bun.lock`
- `pnpm-workspace.yaml` → replaced by `workspaces` in `package.json`
- `.npmrc` → Bun uses `bunfig.toml` for runtime configuration
- pnpm scripts (`pnpm -r build`) → replaced by Bun workspace filter scripts

**Added:**
- `bun.lock` — Bun lockfile (committed)
- `bunfig.toml` — Bun runtime config
- `biome.json` — Biome linter/formatter config
- `@biomejs/biome` dev dependency in root `package.json`

**No change to individual packages:**
All `src/TypeScript/packages/*/package.json` and `tests/TypeScript/*/package.json` files retain their Vite/Vitest/TypeScript scripts. Workspace protocol `workspace:*` is supported by Bun.

## Bun workspace scripts

Bun supports workspace scripts via `bun run --filter <pattern> <script>` and `bun run --workspaces <script>`. In Bun 1.3.x, these workspace filter features require scripts to be stored in the lockfile (`bun.lock`). Since Bun 1.3.x does not write `scripts` entries to the lockfile, the filter flags produce "No packages matched the filter" or "No workspace packages have script" errors.

**Workaround used in this repository:** `eng/build.sh`, `eng/test.sh`, and `eng/check.sh` call `bun run --cwd <package-path> <script>` for each workspace package instead of using the broken filter flags.

If Bun is upgraded to a version that writes scripts to the lockfile and workspace filter works correctly, the eng scripts can be simplified to use `bun run --filter '*' build` etc.

The root `package.json` only defines `check` and `format` scripts (Biome operations that do not need workspace orchestration). Build, test, and typecheck are orchestrated exclusively through the `eng/` scripts.
