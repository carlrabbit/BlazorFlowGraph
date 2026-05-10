import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { join, dirname } from "node:path";
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
      "GITHUB_SHA is required in GitHub Actions so the release workflow can verify that the selected commit is reachable from origin/main."
    );
  }

  execFileSync("git", ["fetch", "--no-tags", "origin", "main:refs/remotes/origin/main"], {
    cwd: repositoryRoot,
    stdio: "inherit",
  });

  try {
    execFileSync("git", ["merge-base", "--is-ancestor", gitSha, "refs/remotes/origin/main"], {
      cwd: repositoryRoot,
      stdio: "ignore",
    });
  } catch {
    throw new Error(
      `Release commit '${gitSha}' is not reachable from origin/main. Publish only from main-tagged commits or manual runs on main.`
    );
  }
}

function updatePackageJsonVersions(relativeDirectory, version) {
  const directory = join(repositoryRoot, relativeDirectory);
  if (!existsSync(directory)) {
    return;
  }

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const packageJsonPath = join(directory, entry.name, "package.json");
    if (!existsSync(packageJsonPath)) {
      continue;
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    if (typeof packageJson.version !== "string" || packageJson.version.length === 0) {
      throw new Error(`Package version is missing or invalid in ${relativeDirectory}/${entry.name}/package.json.`);
    }

    const previousVersion = packageJson.version;
    packageJson.version = version;
    writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
    console.log(
      `Updated ${relativeDirectory}/${entry.name}/package.json ${previousVersion} -> ${version}`
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
updatePackageJsonVersions("src/TypeScript/packages", releaseVersion);
updatePackageJsonVersions("tests/TypeScript", releaseVersion);

writeOutputs({
  release_tag: releaseTag,
  release_version: releaseVersion,
});

console.log(`Prepared release ${releaseTag} (${releaseVersion}).`);
