#!/usr/bin/env sh
set -eu

# This repository uses TUnit with Microsoft Testing Platform.
# TUnit test projects are executed with 'dotnet run' rather than 'dotnet test'.
# Slow and e2e tests are excluded by convention through separate test projects.
#
# Test projects are located under tests/DotNet/:
#   BlazorFlowGraph.Protocol.Tests
#   BlazorFlowGraph.Diffing.Tests
#   BlazorFlowGraph.Projection.Tests
#   BlazorFlowGraph.Semantics.Tests
#
# Note: the guide convention (tests/unit/, tests/integration/) applies to new
# repositories. This repository uses tests/DotNet/ as its test root.

for project in tests/DotNet/BlazorFlowGraph.Protocol.Tests \
               tests/DotNet/BlazorFlowGraph.Diffing.Tests \
               tests/DotNet/BlazorFlowGraph.Projection.Tests \
               tests/DotNet/BlazorFlowGraph.Semantics.Tests; do
  if [ -d "$project" ]; then
    dotnet run --no-build --configuration Release --project "$project"
  fi
done
