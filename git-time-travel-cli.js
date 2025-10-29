#!/usr/bin/env node

import { Command } from "commander";
import { execa } from "execa";
import { promises as fs } from "fs";
import chalk from "chalk";
import tempfile from "tempfile";
import inquirer from "inquirer";
import ora from "ora";
import { isGitRepo } from "./utils/isGitRepo.js";
import { showSignature } from "./utils/signature.js";
import { getEditor } from "./utils/getEditor.js";
import { sanitizeDate, isValidCommitHash } from "./utils/validateDate.js";
import { checkGitFilterRepo, isGitFilterRepoAvailable } from "./utils/gitFilterRepo.js";
import { saveOperationHistory, rollbackLastOperation, listOperationHistory } from "./utils/rollback.js";
import { loadBatchOperations, generateExampleBatchFile } from "./utils/batchOperations.js";
import { parseCommitRange, isValidCommitRange, getCommitsByAuthor, getCommitsByMessage, showCommitRangePreview } from "./utils/commitRange.js";

/**
 * Main CLI application for v2.0.0
 */
async function main() {
  // Check if we're in a git repository
  isGitRepo();

  // Show signature
  showSignature();

  // Setup CLI with v2.0.0 options
  const program = new Command();

  program
    .name("git-time-travel")
    .description("Manipulate the date and time of Git commits (v2.0.0)")
    .version("2.0.0")
    .option("-c, --commits <number>", "Number of commits to modify", "5")
    .option("-l, --limit <number>", "Number of chunks to split commits into", "20")
    .option("-e, --editor <editor>", "Specify the editor to use")
    .option("-d, --debug", "Enable debug mode")
    .option("-a, --all", "Change date for all available commits")
    .option("-i, --interactive", "Interactive mode with commit selection")
    .option("-b, --backup", "Create a backup branch before making changes")
    .option("--dry-run", "Preview changes without modifying git history")
    .option("-r, --range <range>", "Specify commit range (e.g., HEAD~5..HEAD~2)")
    .option("--author <name>", "Filter commits by author")
    .option("--grep <pattern>", "Filter commits by message pattern")
    .option("--batch <file>", "Load operations from JSON/YAML file")
    .option("--export <file>", "Export current selection to batch file")
    .option("--generate-example [format]", "Generate example batch file (json|yaml)")
    .option("--author-date-only", "Only modify author date (not committer date)")
    .option("--committer-date-only", "Only modify committer date (not author date)")
    .option("--rollback", "Rollback last operation")
    .option("--history", "Show operation history")
    .option("--use-filter-repo", "Force use of git-filter-repo (faster)")
    .option("--use-filter-branch", "Force use of git filter-branch (legacy)")
    .parse(process.argv);

  const options = program.opts();

  try {
    // Handle special commands
    if (options.rollback) {
      await rollbackLastOperation();
      process.exit(0);
    }

    if (options.history) {
      await listOperationHistory();
      process.exit(0);
    }

    if (options.generateExample) {
      const format = options.generateExample === true ? "json" : options.generateExample;
      const filename = `git-time-travel-example.${format}`;
      await generateExampleBatchFile(format, filename);
      process.exit(0);
    }

    // Check for conflicting options
    if (options.authorDateOnly && options.committerDateOnly) {
      console.error(chalk.red.bold("Error: Cannot use both --author-date-only and --committer-date-only"));
      process.exit(1);
    }

    // Validate numeric options
    const commits = parseInt(options.commits, 10);
    if (isNaN(commits) || commits < 1) {
      console.error(chalk.red.bold(`Error: Invalid commit count "${options.commits}". Must be a positive number.`));
      process.exit(1);
    }

    const limitChunks = parseInt(options.limit, 10);
    if (isNaN(limitChunks) || limitChunks < 1) {
      console.error(chalk.red.bold(`Error: Invalid limit "${options.limit}". Must be a positive number.`));
      process.exit(1);
    }

    // Check git-filter-repo availability
    const useFilterRepo = options.useFilterRepo || (!options.useFilterBranch && await isGitFilterRepoAvailable());

    if (!useFilterRepo) {
      await checkGitFilterRepo(false);
    }

    // Save current ref for rollback
    const { stdout: currentRef } = await execa("git", ["rev-parse", "HEAD"]);
    const { stdout: currentBranch } = await execa("git", ["rev-parse", "--abbrev-ref", "HEAD"]);

    // Create backup if requested
    let backupBranch = null;
    if (options.backup) {
      backupBranch = await createBackupBranch();
    }

    // Get commit list based on options
    let commitList;

    if (options.batch) {
      // Load from batch file
      commitList = await loadBatchOperations(options.batch);
    } else if (options.range) {
      // Use commit range
      if (!isValidCommitRange(options.range)) {
        throw new Error(`Invalid commit range: ${options.range}`);
      }
      commitList = await parseCommitRange(options.range);
    } else if (options.author) {
      // Filter by author
      commitList = await getCommitsByAuthor(options.author, options.all ? null : commits);
    } else if (options.grep) {
      // Filter by message
      commitList = await getCommitsByMessage(options.grep, options.all ? null : commits);
    } else {
      // Standard: get last N commits
      commitList = await getCommitList(options.all ? null : commits);
    }

    // Dry run mode
    if (options.dryRun) {
      showDryRun(commitList, options);
      process.exit(0);
    }

    // Interactive mode
    if (options.interactive) {
      commitList = await interactiveCommitSelection(commitList);
      if (commitList.length === 0) {
        console.log(chalk.yellow("No commits selected. Exiting."));
        process.exit(0);
      }
    }

    // Export mode
    if (options.export) {
      const { exportToBatchFile } = await import("./utils/batchOperations.js");
      const ext = options.export.split(".").pop().toLowerCase();
      const format = ext === "yaml" || ext === "yml" ? "yaml" : "json";
      await exportToBatchFile(commitList, format, options.export);
      process.exit(0);
    }

    // Process commits with editor (if not from batch file)
    if (!options.batch) {
      commitList = await processCommitsWithEditor(commitList, options);
    }

    // Final confirmation before rewriting history
    const confirmed = await confirmRewrite(commitList, options);
    if (!confirmed) {
      console.log(chalk.yellow("\nOperation cancelled."));
      process.exit(0);
    }

    // Apply changes
    console.log(
      `\nPlease wait while we adjust the dates of your commits and enjoy the ${chalk.red.bold("TIME TRAVEL...")}\n`
    );

    const operationOptions = {
      authorOnly: options.authorDateOnly,
      committerOnly: options.committerDateOnly,
      debug: options.debug,
      useFilterRepo,
    };

    await applyCommitChanges(commitList, operationOptions);

    // Save operation history for rollback
    await saveOperationHistory({
      type: "date-rewrite",
      branch: currentBranch,
      originalRef: currentRef,
      backupBranch,
      commitCount: commitList.length,
    });

    // Success message
    console.log(chalk.green.bold("\n✅ Git commit dates have been adjusted successfully!"));

    if (backupBranch) {
      console.log(chalk.cyan(`\n💾 Backup branch created: ${backupBranch}`));
      console.log(chalk.yellow("To rollback, run: ") + chalk.white("git-time-travel --rollback"));
    }

    console.log(
      chalk.yellow("\nTo push your changes, use: ") +
      chalk.cyan.bold(`git push -f origin ${currentBranch}`)
    );

    console.log(chalk.red.bold("\n⚠️  Warning: Force pushing rewrites history. Coordinate with your team!"));

  } catch (error) {
    console.error(chalk.red.bold(`\n❌ Error: ${error.message}`));
    if (options.debug) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Create a backup branch
 */
async function createBackupBranch() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").replace(/T/, "_").substring(0, 19);
  const branchName = `git-time-travel-backup-${timestamp}`;

  const spinner = ora(`Creating backup branch: ${branchName}`).start();

  try {
    await execa("git", ["branch", branchName]);
    spinner.succeed(chalk.green(`Backup branch created: ${branchName}`));
    return branchName;
  } catch (error) {
    spinner.fail(chalk.red("Failed to create backup branch"));
    throw error;
  }
}

/**
 * Get list of commits
 */
async function getCommitList(limit) {
  let datefmt = "%cI";

  // Test which date format is supported
  try {
    const test = await execa("git", ["log", "-n1", `--pretty=format:${datefmt}`]);
    if (test.stdout === datefmt) {
      datefmt = "%ci";
    }
  } catch (error) {
    // Use default format
  }

  const args = limit
    ? ["log", `-n${limit}`, `--pretty=format:${datefmt} | %H | %s`]
    : ["log", `--pretty=format:${datefmt} | %H | %s`];

  const { stdout } = await execa("git", args);

  return stdout.split("\n").filter(line => line.trim()).map(line => {
    const [date, hash, ...messageParts] = line.split("|");
    return {
      date: date.trim(),
      hash: hash.trim(),
      message: messageParts.join("|").trim(),
    };
  });
}

/**
 * Interactive commit selection
 */
async function interactiveCommitSelection(commitList) {
  const choices = commitList.map(commit => ({
    name: `${commit.date} - ${commit.hash.substring(0, 7)} - ${commit.message}`,
    value: commit,
    checked: false,
  }));

  const { selectedCommits } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedCommits",
      message: "Select commits to modify (use space to select, enter to confirm):",
      choices,
      pageSize: 15,
    },
  ]);

  return selectedCommits;
}

/**
 * Show dry run preview
 */
function showDryRun(commitList, options) {
  console.log(chalk.yellow.bold("\n🔍 DRY RUN MODE - No changes will be made\n"));
  console.log(chalk.cyan("Commits that would be modified:\n"));

  commitList.forEach((commit, index) => {
    console.log(`${index + 1}. ${commit.date} | ${commit.hash.substring(0, 7)} | ${commit.message}`);
  });

  console.log(chalk.cyan(`\nTotal: ${commitList.length} commits`));

  if (options.authorDateOnly) {
    console.log(chalk.yellow("\n📝 Only author dates would be modified"));
  } else if (options.committerDateOnly) {
    console.log(chalk.yellow("\n📝 Only committer dates would be modified"));
  } else {
    console.log(chalk.yellow("\n📝 Both author and committer dates would be modified"));
  }

  console.log(chalk.yellow("\nTo make actual changes, run without --dry-run flag\n"));
}

/**
 * Process commits with editor
 */
async function processCommitsWithEditor(commitList, options) {
  const tmpfile = tempfile("gitblah-");
  const content = commitList.map(c => `${c.date} | ${c.hash} | ${c.message}`).join("\n");

  await fs.writeFile(tmpfile, content);

  const editor = getEditor(options.editor);

  console.log(chalk.cyan(`\nOpening editor: ${editor}`));
  console.log(chalk.yellow("Edit the commit dates, then save and close the editor...\n"));

  try {
    await execa(editor, [tmpfile], { shell: true });
  } catch (error) {
    console.error(chalk.red.bold(`Error opening editor: ${error.message}`));
    console.error(chalk.yellow(`\nTip: Set your preferred editor using --editor flag or EDITOR environment variable`));
    console.error(chalk.yellow(`Example: git-time-travel --editor nano`));
    throw error;
  }

  const updatedContent = await fs.readFile(tmpfile, "utf-8");
  return parseEditedCommits(updatedContent);
}

/**
 * Parse edited commits from file
 */
function parseEditedCommits(content) {
  const lines = content.split("\n").filter(line => line.trim());
  const commits = [];
  const validationErrors = [];

  lines.forEach((line, index) => {
    const [date, hash, ...messageParts] = line.split("|");

    if (!date || !hash) {
      validationErrors.push(`Line ${index + 1}: Missing date or hash`);
      return;
    }

    const trimmedDate = date.trim();
    const trimmedHash = hash.trim();

    // Validate commit hash
    if (!isValidCommitHash(trimmedHash)) {
      validationErrors.push(`Line ${index + 1}: Invalid commit hash "${trimmedHash}"`);
      return;
    }

    // Validate and sanitize date
    try {
      const sanitizedDate = sanitizeDate(trimmedDate);
      commits.push({
        date: sanitizedDate,
        hash: trimmedHash,
        message: messageParts.join("|").trim(),
      });
    } catch (err) {
      validationErrors.push(`Line ${index + 1}: ${err.message}`);
    }
  });

  if (validationErrors.length > 0) {
    console.error(chalk.red.bold("\n❌ Validation Errors Found:\n"));
    validationErrors.forEach(err => console.error(chalk.red(`  • ${err}`)));
    console.error(chalk.yellow("\n💡 Supported date formats:"));
    console.error(chalk.gray("  - ISO 8601: 2023-02-20T15:30:00+05:30"));
    console.error(chalk.gray("  - Git default: 2023-02-20 15:30:00 +0530"));
    console.error(chalk.gray("  - RFC 2822: Mon, 20 Feb 2023 15:30:00 +0530"));
    console.error(chalk.gray("  - Unix timestamp: 1234567890\n"));
    throw new Error("Validation failed");
  }

  if (commits.length === 0) {
    throw new Error("No valid commits found to process");
  }

  return commits;
}

/**
 * Confirm before rewriting history
 */
async function confirmRewrite(commitList, options) {
  console.log(chalk.cyan.bold("\n📋 Summary of changes:\n"));
  console.log(chalk.white(`  Commits to modify: ${commitList.length}`));

  if (options.authorDateOnly) {
    console.log(chalk.white("  Scope: Author dates only"));
  } else if (options.committerDateOnly) {
    console.log(chalk.white("  Scope: Committer dates only"));
  } else {
    console.log(chalk.white("  Scope: Both author and committer dates"));
  }

  if (options.backup) {
    console.log(chalk.green("  Backup: Enabled ✓"));
  } else {
    console.log(chalk.yellow("  Backup: Disabled (consider using --backup)"));
  }

  console.log();

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: chalk.red.bold("⚠️  This will rewrite Git history. Continue?"),
      default: false,
    },
  ]);

  return confirm;
}

/**
 * Apply commit changes
 */
async function applyCommitChanges(commits, options) {
  const { authorOnly, committerOnly, debug, useFilterRepo } = options;

  if (useFilterRepo) {
    // Use git-filter-repo (fast path)
    console.log(chalk.green("✨ Using git-filter-repo (fast mode)\n"));
    await applyWithFilterRepo(commits, { authorOnly, committerOnly });
  } else {
    // Use git filter-branch (legacy path)
    console.log(chalk.yellow("⚠️  Using git filter-branch (legacy mode)\n"));
    await applyWithFilterBranch(commits, { authorOnly, committerOnly, debug });
  }
}

/**
 * Apply changes with git-filter-repo
 */
async function applyWithFilterRepo(commits, options) {
  const { authorOnly, committerOnly } = options;

  // Create Python script for filter-repo
  const script = generateFilterRepoScript(commits, { authorOnly, committerOnly });
  const scriptPath = tempfile("filter-repo-") + ".py";

  await fs.writeFile(scriptPath, script, { mode: 0o755 });

  const spinner = ora("Rewriting commit history...").start();

  try {
    await execa("git", ["filter-repo", "--force", "--commit-callback", scriptPath], {
      stdio: "pipe",
    });

    spinner.succeed(chalk.green("Commit history rewritten successfully"));

    // Cleanup
    await fs.unlink(scriptPath);
  } catch (error) {
    spinner.fail(chalk.red("Failed to rewrite commit history"));
    await fs.unlink(scriptPath).catch(() => {});
    throw error;
  }
}

/**
 * Generate Python script for git-filter-repo
 */
function generateFilterRepoScript(commits, options) {
  const { authorOnly, committerOnly } = options;

  const commitMap = {};
  commits.forEach(commit => {
    commitMap[commit.hash] = commit.date;
  });

  const commitMapJSON = JSON.stringify(commitMap, null, 2);

  return `#!/usr/bin/env python3
import json
from datetime import datetime
import re

# Commit date mapping
commit_map = ${commitMapJSON}

def convert_to_timestamp(date_str):
    """Convert various date formats to Unix timestamp bytes"""
    # Try ISO 8601
    try:
        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return str(int(dt.timestamp())).encode('utf-8')
    except:
        pass

    # Try Git default format
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S %z")
        return str(int(dt.timestamp())).encode('utf-8')
    except:
        pass

    # Try RFC 2822
    try:
        dt = datetime.strptime(date_str, "%a, %d %b %Y %H:%M:%S %z")
        return str(int(dt.timestamp())).encode('utf-8')
    except:
        pass

    # Try Unix timestamp
    try:
        return str(int(date_str)).encode('utf-8')
    except:
        pass

    return None

# Get commit hash
commit_hash = commit.original_id.hex()

if commit_hash in commit_map:
    new_date = commit_map[commit_hash]
    timestamp = convert_to_timestamp(new_date)

    if timestamp:
        ${!committerOnly ? "commit.author_date = timestamp" : "# Author date not modified"}
        ${!authorOnly ? "commit.committer_date = timestamp" : "# Committer date not modified"}
`;
}

/**
 * Apply changes with git filter-branch (legacy)
 */
async function applyWithFilterBranch(commits, options) {
  const { authorOnly, committerOnly, debug } = options;

  // Build shell script
  const collection = [];
  let iter = 0;
  let colIter = 0;
  const limitChunks = 20;

  for (const commit of commits) {
    let authorDateCmd = "";
    let committerDateCmd = "";

    if (!committerOnly) {
      authorDateCmd = `export GIT_AUTHOR_DATE="${commit.date}"`;
    }

    if (!authorOnly) {
      committerDateCmd = `export GIT_COMMITTER_DATE="${commit.date}"`;
    }

    const commitEnv = `
      if [ $GIT_COMMIT = ${commit.hash} ];
      then
      ${authorDateCmd}
      ${committerDateCmd}
      fi;
    `;

    iter++;

    if (iter % limitChunks === 0) {
      colIter++;
    }

    collection[colIter] = (collection[colIter] || "") + commitEnv;
  }

  let shFile = `#!/bin/sh\nexport FILTER_BRANCH_SQUELCH_WARNING=1\n`;

  for (let i = 0; i < collection.length; i++) {
    const each = collection[i];
    const cmd = `git filter-branch -f --env-filter '${each}' HEAD~${commits.length}..HEAD`;

    shFile += `${cmd}\n`;
    const filename = `filter_branch_commands_${i}.sh`;

    await fs.writeFile(filename, shFile);

    shFile = `#!/bin/sh\nexport FILTER_BRANCH_SQUELCH_WARNING=1\n`;

    const spinner = ora(`Processing chunk ${i + 1}/${collection.length}...`).start();

    try {
      const { rewriteGitHistory } = await import("./utils/rewriteGitHistory.js");
      await rewriteGitHistory(filename, i, collection.length, spinner);
    } catch (error) {
      spinner.fail(chalk.red("Failed to process chunk"));
      throw error;
    }
  }
}

// Run the application
main().catch(error => {
  console.error(chalk.red.bold(`Fatal error: ${error.message}`));
  process.exit(1);
});
