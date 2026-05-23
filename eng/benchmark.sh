#!/usr/bin/env sh
set -eu

# Replace PROJECT_NAME with the actual benchmark project name.
# Example: dotnet run --configuration Release --project benchmarks/BlazorFlowGraph.Benchmarks
echo "No benchmark project configured. Add a BenchmarkDotNet project under benchmarks/ and update this script." >&2
exit 1
