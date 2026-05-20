# GitHub Codespace Guide

This document describes the GitHub Codespace setup for BlazorFlowGraph, explains what is configured automatically by the prebuild, and lists any steps that require manual action from a repository administrator.

---

## Overview

GitHub Codespaces provides a cloud-hosted development environment pre-configured for this project. The default devcontainer definition in `.devcontainer/dev/devcontainer.json` installs all required tooling and restores dependencies so that contributors can start working immediately after opening a Codespace.

There are two devcontainer variants:

| Variant | Definition | Ports forwarded | Auto-starts samples |
|---------|-----------|-----------------|---------------------|
| **Default (development)** | `.devcontainer/dev/devcontainer.json` | `5000`, `5001` | No |
| **Samples** | `.devcontainer/samples/devcontainer.json` | `5100`–`5105` | Yes |

Use the default devcontainer for day-to-day development. Use the samples devcontainer when you want all sample apps to launch automatically on Codespace startup.

---

## Quick Start

1. Navigate to the repository on GitHub.
2. Click **Code → Codespaces → Create codespace on main** (or your branch).
3. Wait for the environment to be ready. If a prebuild is available, startup typically takes under one minute.
4. VS Code opens in the browser (or connects via the VS Code desktop app) with all tools installed and dependencies restored.

---

## What the Devcontainer Configures Automatically

### Toolchain

| Tool | Version | How Installed |
|------|---------|--------------|
| .NET SDK | 10 (latest minor) | devcontainer feature `ghcr.io/devcontainers/features/dotnet:2` |
| Node.js | 22 LTS | devcontainer feature `ghcr.io/devcontainers/features/node:1` |
| pnpm | 10.11.0 | Corepack (activated in `onCreateCommand`) |

### Lifecycle Commands

The devcontainer runs the following commands automatically:

| Stage | Command | Runs during prebuild? |
|-------|---------|----------------------|
| `onCreateCommand` | `corepack enable && corepack prepare pnpm@10.11.0 --activate` | Yes |
| `updateContentCommand` | `pnpm install --frozen-lockfile && dotnet restore BlazorFlowGraph.slnx` | Yes |

Because `updateContentCommand` runs during each prebuild, the Codespace cache already contains restored packages when you open the environment. Full build validation is reserved for CI rather than devcontainer startup, so a single warning or SDK mismatch does not break container creation.

### VS Code Extensions

The following extensions are installed automatically:

| Extension | Purpose |
|-----------|---------|
| `ms-dotnettools.csdevkit` | C# Dev Kit — IntelliSense, refactoring, test explorer |
| `ms-dotnettools.vscode-dotnet-runtime` | .NET runtime acquisition used by C# tooling |
| `dbaeumer.vscode-eslint` | ESLint integration for TypeScript packages |
| `esbenp.prettier-vscode` | Prettier formatter |
| `EditorConfig.EditorConfig` | Respects the project `.editorconfig` file |

### Port Forwarding

The following ports are forwarded automatically and surfaced in the **Ports** panel:

| Port | Service |
|------|---------|
| 5000 | Blazor development server (HTTP) |
| 5001 | Blazor development server (HTTPS) |

Forwarded ports are automatically available via a generated `*.app.github.dev` URL when running a sample application.

---

## Development Workflow Inside a Codespace

### Running a Sample

```bash
dotnet run --project samples/MinimalViewer/MinimalViewer.csproj --launch-profile Sample
```

The app becomes available at the forwarded `localhost:5101` URL shown in the **Ports** panel.

### Running All Samples

```bash
./tooling/scripts/run-samples-all.sh
```

Then open the sample index on forwarded port `5100`.

Use `.devcontainer/samples/devcontainer.json` when you want a Codespace variant dedicated to launching all samples automatically.
That devcontainer runs `bash tooling/scripts/run-samples-all.sh --detach --log-file /tmp/blazor-flow-graph-samples.log`.
The older `tooling/scripts/start-samples-all-background.sh` wrapper remains only so existing callers do not break; using `--detach` mode directly is the supported approach.

Detached startup is repeatable: if the full sample set is already running, the command exits successfully without starting duplicates.
Detached sample PID files are stored under `/tmp/blazor-flow-graph-samples`, and partial detached state fails with cleanup guidance instead of launching a second inconsistent set.

Run this after editing the launcher to inspect the planned restore/build/run commands without starting anything:

```bash
bash tooling/scripts/run-samples-all.sh --dry-run
```

By default, the launcher binds sample ports to `0.0.0.0` so forwarded Codespaces/devcontainer ports work reliably.
Set `SAMPLES_BIND_HOST=127.0.0.1` when you want loopback-only local runs.

### Building

```bash
# .NET
dotnet build BlazorFlowGraph.slnx --configuration Release

# TypeScript
pnpm build
```

### Testing

```bash
# TypeScript unit tests
pnpm test

# .NET tests (TUnit projects run as executables)
dotnet run --no-build --project tests/DotNet/BlazorFlowGraph.Protocol.Tests --configuration Release
dotnet run --no-build --project tests/DotNet/BlazorFlowGraph.Diffing.Tests --configuration Release
dotnet run --no-build --project tests/DotNet/BlazorFlowGraph.Projection.Tests --configuration Release
dotnet run --no-build --project tests/DotNet/BlazorFlowGraph.Semantics.Tests --configuration Release
```

### TypeScript Typecheck

```bash
pnpm typecheck
```

---

## Best Practices

### Use Prebuilds for Fast Startup

Prebuilds cache the container image together with the output of `onCreateCommand` and `updateContentCommand`. This means restored packages are already in place when the Codespace starts. Enable prebuilds (see [Manual Steps](#manual-steps-required) below) so contributors never wait for a cold restore.

### Commit `pnpm-lock.yaml` and Restore with `--frozen-lockfile`

The devcontainer installs pnpm dependencies with `--frozen-lockfile`. Keep `pnpm-lock.yaml` committed and up to date to ensure reproducible installs in Codespaces, CI, and local environments.

### Keep the Devcontainer Lean

The devcontainer uses a minimal Ubuntu base with targeted features for .NET and Node.js. Avoid adding heavy global tools that are not required by the project; prefer project-local tooling.

### Use Port Attributes for Discoverability

Ports `5000` and `5001` are declared with descriptive labels and `onAutoForward: "notify"`. This surfaces them in the **Ports** panel without opening a browser tab automatically, which is the appropriate behavior for a server-side Blazor application that requires an explicit start command.

### Align Tool Versions with CI

The devcontainer installs .NET 10 and Node.js 22 to match the versions used by the CI workflow. If the CI workflow is updated to a newer SDK or Node.js version, update the devcontainer features accordingly.

### Keep Secrets Out of the Devcontainer

Do not commit secrets, API keys, or connection strings to `devcontainer.json`. Use **Codespace secrets** (configured per-repository or per-user in GitHub settings) to inject sensitive values as environment variables at runtime.

---

## Manual Steps Required

The following actions cannot be performed automatically and require a repository administrator to complete them once.

### 1. Enable Codespace Prebuilds

Prebuilds are not enabled by default. To activate them:

1. Go to **Repository Settings → Codespaces**.
2. Under **Prebuild configuration**, click **Set up prebuild**.
3. Select the branch to prebuild (typically `main`).
4. Choose the region(s) where contributors are located.
5. Set the trigger to **On every push** or a suitable schedule.
6. Save the configuration.

GitHub will then build and cache the Codespace image whenever the selected branch is updated, so contributors start with a warm environment.

### 2. Set a Spending Limit for Codespaces

By default, Codespaces usage is limited to free-tier hours. To allow contributors to use Codespaces beyond the free quota:

1. Go to **Organization or User Settings → Billing → Spending limits**.
2. Set an appropriate spending limit for Codespaces.

### 3. Configure Repository Access Permissions for Codespaces

To allow contributors to create Codespaces for this repository:

1. Go to **Repository Settings → Codespaces → Codespace access**.
2. Choose the appropriate access level (repository members, organization members, or selected users).

### 4. Review Devcontainer Feature Versions Periodically

The default devcontainer pins Node.js to version `22` and .NET to version `10`. When a new LTS Node.js version or a new .NET SDK version becomes the project standard, update `.devcontainer/dev/devcontainer.json` and re-enable the prebuild to refresh the cached image.

---

## Connecting from VS Code Desktop

Instead of working in the browser, you can connect the VS Code desktop application to a Codespace:

1. Install the **GitHub Codespaces** extension in your local VS Code.
2. Open the Command Palette and run **Codespaces: Connect to Codespace**.
3. Select the Codespace to connect.

Port forwarding works the same way — forwarded ports appear in the **Ports** panel and are accessible at `localhost`.

---

## Troubleshooting

| Symptom | Resolution |
|---------|-----------|
| `pnpm: command not found` | Run `corepack enable && corepack prepare pnpm@10.11.0 --activate` in the terminal. |
| `dotnet: command not found` | The .NET feature may have failed during image build. Rebuild the Codespace via **Codespaces: Rebuild Container**. |
| Samples did not auto-start in sample devcontainer | Check `/tmp/<repository-name>/run-samples-all.log` for startup errors and verify the launcher process with `[[ -f /tmp/<repository-name>/run-samples-all.pid ]] && kill -0 $(cat /tmp/<repository-name>/run-samples-all.pid)`. |
| Samples are not running and no active launcher PID exists | Run `bash tooling/scripts/start-samples-all-background.sh` to start sample auto-launch manually. |
| Sample port returns `502 Bad Gateway` | Samples build before starting and may not be ready yet. Open a terminal and run `ss -ltnp` to see which sample ports are listening. Inspect the log: `cat /tmp/blazorflowgraph/run-samples-all.log`. |
| Port 5000 not forwarded | Start the Blazor application with `dotnet run`; VS Code detects the listening port and adds it to the **Ports** panel automatically. |
| Build fails after a merge | Run `pnpm install --frozen-lockfile && dotnet restore BlazorFlowGraph.slnx` to update dependencies after pulling changes that modify lock files. |
| C# IntelliSense not working | Wait for C# Dev Kit to finish indexing (progress shown in the status bar), or run **Developer: Reload Window** from the Command Palette. |
