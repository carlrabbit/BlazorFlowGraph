#!/usr/bin/env sh
set -eu

# This repository uses TUnit with Microsoft Testing Platform.
# TUnit test projects are executed with 'dotnet run' rather than 'dotnet test'.
# Equivalent to TestCategory!=Slow&TestCategory!=E2E via --filter is not supported
# with dotnet run; slow and e2e tests are excluded by convention through separate
# test projects (tests/unit/ vs tests/integration/ vs tests/e2e/).

for project in tests/DotNet/BlazorFlowGraph.Protocol.Tests \
               tests/DotNet/BlazorFlowGraph.Diffing.Tests \
               tests/DotNet/BlazorFlowGraph.Projection.Tests \
               tests/DotNet/BlazorFlowGraph.Semantics.Tests; do
  if [ -d "$project" ]; then
    dotnet run --no-build --configuration Release --project "$project"
  fi
done
