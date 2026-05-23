#!/usr/bin/env sh
set -eu

# Validates that all sample .csproj files restore and build successfully.
find samples -name "*.csproj" -type f | sort | while IFS= read -r sample; do
  echo "Restoring sample: $sample"
  dotnet restore "$sample"
  echo "Building sample: $sample"
  dotnet build "$sample" --no-restore --configuration Release
done
