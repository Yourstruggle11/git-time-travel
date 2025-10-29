import { execa } from "execa";
import chalk from "chalk";

/**
 * Check if git-filter-repo is installed
 * @returns {Promise<boolean>}
 */
export async function isGitFilterRepoAvailable() {
  try {
    await execa("git", ["filter-repo", "--version"]);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if git-filter-repo is available, show installation instructions if not
 * @param {boolean} required - If true, exit if not available
 */
export async function checkGitFilterRepo(required = false) {
  const available = await isGitFilterRepoAvailable();

  if (!available) {
    console.log(chalk.yellow.bold("\n⚠️  git-filter-repo is not installed"));
    console.log(chalk.yellow("\ngit-filter-repo is the modern, recommended tool for rewriting Git history."));
    console.log(chalk.yellow("It's 10-100x faster than git filter-branch (deprecated since 2019).\n"));

    console.log(chalk.cyan("Installation instructions:\n"));
    console.log(chalk.white("macOS (Homebrew):"));
    console.log(chalk.gray("  brew install git-filter-repo\n"));

    console.log(chalk.white("Ubuntu/Debian:"));
    console.log(chalk.gray("  apt-get install git-filter-repo\n"));

    console.log(chalk.white("Fedora:"));
    console.log(chalk.gray("  dnf install git-filter-repo\n"));

    console.log(chalk.white("Windows (via pip):"));
    console.log(chalk.gray("  pip install git-filter-repo\n"));

    console.log(chalk.white("Manual installation:"));
    console.log(chalk.gray("  wget https://raw.githubusercontent.com/newren/git-filter-repo/main/git-filter-repo"));
    console.log(chalk.gray("  chmod +x git-filter-repo"));
    console.log(chalk.gray("  mv git-filter-repo /usr/local/bin/\n"));

    console.log(chalk.cyan("More info: https://github.com/newren/git-filter-repo\n"));

    if (required) {
      console.log(chalk.red.bold("git-filter-repo is required for v2.0.0+"));
      console.log(chalk.yellow("To use the legacy git filter-branch, downgrade to v1.x:"));
      console.log(chalk.gray("  npm install -g git-time-travel@1.2.0\n"));
      process.exit(1);
    } else {
      console.log(chalk.yellow("Falling back to git filter-branch (deprecated)..."));
      console.log(chalk.yellow("Warning: This is slower and may be removed in future versions.\n"));
    }
  }

  return available;
}

/**
 * Use git filter-repo to rewrite commit dates
 * @param {Array} commits - Array of {hash, date} objects
 * @param {Object} options - Options like authorOnly, committerOnly
 */
export async function filterRepoRewriteDates(commits, options = {}) {
  const { authorOnly = false, committerOnly = false, spinner } = options;

  // Create a callback script for git-filter-repo
  const callbackScript = generateCallbackScript(commits, { authorOnly, committerOnly });

  // Write the callback script to a temp file
  const { writeFileSync, unlinkSync } = await import("fs");
  const tempfile = await import("tempfile");
  const scriptPath = tempfile.default("filter-repo-");

  writeFileSync(scriptPath, callbackScript, { mode: 0o755 });

  try {
    if (spinner) {
      spinner.text = "Rewriting commit dates with git-filter-repo...";
    }

    await execa("git", ["filter-repo", "--force", "--commit-callback", scriptPath], {
      stdio: "inherit",
    });

    if (spinner) {
      spinner.succeed("Commit dates rewritten successfully");
    }

    // Cleanup
    unlinkSync(scriptPath);
  } catch (error) {
    if (spinner) {
      spinner.fail("Failed to rewrite commit dates");
    }
    throw error;
  }
}

/**
 * Generate Python callback script for git-filter-repo
 */
function generateCallbackScript(commits, options = {}) {
  const { authorOnly, committerOnly } = options;

  // Build commit map
  const commitMap = commits.reduce((acc, commit) => {
    acc[commit.hash] = commit.date;
    return acc;
  }, {});

  const commitMapStr = JSON.stringify(commitMap);

  return `#!/usr/bin/env python3
import json
from datetime import datetime

# Commit date mapping
commit_map = ${commitMapStr}

def convert_to_timestamp(date_str):
    """Convert various date formats to Unix timestamp"""
    # Try ISO 8601
    try:
        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return int(dt.timestamp())
    except:
        pass

    # Try Git default format
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S %z")
        return int(dt.timestamp())
    except:
        pass

    # Try Unix timestamp
    try:
        return int(date_str)
    except:
        pass

    return None

# Callback for each commit
commit_hash = commit.original_id.decode('utf-8')

if commit_hash in commit_map:
    new_date = commit_map[commit_hash]
    timestamp = convert_to_timestamp(new_date)

    if timestamp:
        ${!committerOnly ? "commit.author_date = str(timestamp).encode('utf-8')" : ""}
        ${!authorOnly ? "commit.committer_date = str(timestamp).encode('utf-8')" : ""}
`;
}

/**
 * Use legacy git filter-branch (deprecated)
 */
export async function legacyFilterBranchRewriteDates(commits, limitChunks, options = {}) {
  console.log(chalk.yellow.bold("\n⚠️  Using deprecated git filter-branch"));
  console.log(chalk.yellow("Consider installing git-filter-repo for 10-100x faster performance\n"));

  const { authorOnly = false, committerOnly = false } = options;

  // Use the existing filter-branch logic from v1.2.0
  // This is kept for backward compatibility
  return null; // Will use existing implementation
}
