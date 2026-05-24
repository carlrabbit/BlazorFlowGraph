# TypeScript Tools

This document describes the TypeScript and JavaScript tooling stack used in BlazorFlowGraph.

## Current stack

| Tool | Purpose | Config |
|---|---|---|
| [Bun](https://bun.sh) | Runtime, package manager, bundler, test runner, workspace orchestration | `package.json`, `bunfig.toml` |
| [Biome](https://biomejs.dev) | Linter and formatter for TypeScript/JavaScript/JSON | `biome.json` |
| [TypeScript](https://www.typescriptlang.org) | Type checking and declaration emit | per-package `tsconfig.json`, root `tsconfig.base.json` |

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

## Bundler: bun build

Each source package uses `bun build` for bundling:

```sh
# Library package (ESM)
bun build src/index.ts --outdir dist --target browser --format esm --sourcemap=external \
  -e @dataflow-visualizer/protocol

# IIFE browser bundle (host package)
bun build src/browser.ts --outdir dist --entry-naming 'browser.iife.[ext]' \
  --target browser --format iife --sourcemap=external
```

TypeScript declarations are emitted separately using `tsc --emitDeclarationOnly` after bundling. Each package's build script handles both steps.

## Test runner: bun test

Each test package uses `bun test` directly:

```sh
bun test src/       # run all tests in src/ directory
bun test --watch    # watch mode
```

Test files import from `bun:test`:

```ts
import { describe, expect, it, mock, spyOn } from "bun:test";

const fn = mock();  // equivalent to vi.fn() / jest.fn()
```

Source packages that co-locate test files alongside source code (e.g., `src/index.test.ts`) add `/// <reference types="bun-types" />` to the test file for TypeScript to resolve `bun:test` declarations.

## Biome configuration

Biome handles linting and formatting for TypeScript, JavaScript, and JSON files.

Key settings (`biome.json`):
- Formatter: 2-space indent, 100-character line width
- Linter: recommended rules, with `noNonNullAssertion` and `noDelete` disabled (intentional patterns with `exactOptionalPropertyTypes: true`)
- Organize imports: enabled
- Ignore: `dist/`, `node_modules/`, `artifacts/`, `.NET` build outputs, generated `wwwroot/js/`

Run `bun run format` to apply formatting. Run `bun run check` to verify without changes.

## bunfig.toml: hoisted linker

`bunfig.toml` sets `linker = "hoisted"`, which makes Bun use a flat `node_modules` structure similar to npm/pnpm. This is required so TypeScript's compiler can resolve workspace package types through standard `node_modules` lookups.

Without the hoisted linker, workspace package symlinks may not be visible to `tsc` when running in individual package directories.

## Migration history

### pnpm → Bun + Biome

This repository previously used pnpm for JavaScript/TypeScript tooling. The migration was performed to align with Engineering Guide V3.

**Removed:** `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc` → replaced by `bun.lock`, `bunfig.toml`, `biome.json`.

### Vite + Vitest → bun build + bun test

Following the pnpm migration, Vite and Vitest were replaced with Bun-native bundling and testing:

**Removed:**
- `vite` and `vitest` dev dependencies from all packages
- All `vite.config.ts` / `vite.browser.config.ts` per-package configs

**Added/changed:**
- Each package's `build` script now uses `bun build` directly
- Each package's `test` script now uses `bun test`
- Test files import from `bun:test` instead of `vitest`
- `mock()` replaces `vi.fn()`, `spyOn()` replaces `vi.spyOn()`, `toHaveBeenCalledTimes(1)` replaces `toHaveBeenCalledOnce()`
- `bun-types` dev dependency added to the root workspace for `bun:test` type declarations

## Bun workspace scripts

Bun 1.3.x workspace filter (`bun run --filter <pattern>`) requires scripts to be stored in the lockfile, which this version does not support. The `eng/` scripts use `bun run --cwd <path> <script>` per-package instead.

The root `package.json` only defines `check` and `format` scripts (Biome operations). Build, test, and typecheck are orchestrated exclusively through the `eng/` scripts.
