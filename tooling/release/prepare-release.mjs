import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const releaseVersionPattern = /^v\d+\.\d+\.\d+\.\d+$/;
const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function isValidReleaseTag(value) {
  return releaseVersionPattern.test(value);
}

export function normalizeReleaseVersion(value) {
  if (!isValidReleaseTag(value)) {
    throw new Error(`Release version '${value}' is invalid. Expected format: vX.X.X.X`);
  }

  return value.slice(1);
}

function resolveReleaseTag() {
  const eventName = process.env.GITHUB_EVENT_NAME;
  if (eventName === "workflow_dispatch") {
    return process.env.INPUT_RELEASE_VERSION ?? "";
  }

  return process.env.GITHUB_REF_NAME ?? "";
}

function ensureCommitIsOnMain() {
  const gitSha = process.env.GITHUB_SHA;
  if (!gitSha) {
    throw new Error(
      "GITHUB_SHA is required in GitHub Actions so the release workflow can verify that the selected commit is reachable from origin/main.",
    );
  }

  try {
    execFileSync("git", ["fetch", "--no-tags", "origin", "main:refs/remotes/origin/main"], {
      cwd: repositoryRoot,
      stdio: "inherit",
    });
  } catch {
    throw new Error(
      "Failed to fetch origin/main, which is required to validate that the release commit comes from main.",
    );
  }

  try {
    execFileSync("git", ["merge-base", "--is-ancestor", gitSha, "refs/remotes/origin/main"], {
      cwd: repositoryRoot,
      stdio: "ignore",
    });
  } catch {
    throw new Error(
      `Release commit '${gitSha}' is not reachable from origin/main. Publish only from main-tagged commits or manual runs on main.`,
    );
  }
}

function writeOutputs(outputs) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) {
    return;
  }

  for (const [key, value] of Object.entries(outputs)) {
    appendFileSync(outputPath, `${key}=${value}\n`);
  }
}

const releaseTag = resolveReleaseTag();
const releaseVersion = normalizeReleaseVersion(releaseTag);

ensureCommitIsOnMain();

writeOutputs({
  release_tag: releaseTag,
  release_version: releaseVersion,
});

console.log(`Prepared release ${releaseTag} (${releaseVersion}).`);
