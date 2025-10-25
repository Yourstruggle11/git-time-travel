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
import { rewriteGitHistory } from "./utils/rewriteGitHistory.js";
import { getEditor } from "./utils/getEditor.js";
import { sanitizeDate, isValidCommitHash } from "./utils/validateDate.js";

/**
 * Main CLI application
 */
async function main() {
  // Check if we're in a git repository
  isGitRepo();

  // Show signature
  showSignature();

  const program = new Command();

  program
    .name("git-time-travel")
    .description("Manipulate the date and time of Git commits")
    .version("1.2.0")
    .option("-c, --commits <number>", "Number of commits to modify", "5")
    .option("-l, --limit <number>", "Number of chunks to split commits into", "20")
    .option("-e, --editor <editor>", "Specify the editor to use")
    .option("-d, --debug", "Enable debug mode")
    .option("-a, --all", "Change date for all available commits")
    .option("--dry-run", "Preview changes without modifying git history")
    .option("-i, --interactive", "Interactive mode with commit selection")
    .option("-b, --backup", "Create a backup branch before making changes")
    .parse(process.argv);

  const options = program.opts();

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

  try {
    // Create backup if requested
    if (options.backup) {
      await createBackupBranch();
    }

    // Get commit list
    const commitList = await getCommitList(options.all ? null : commits);

    // Interactive mode
    if (options.interactive) {
      const selectedCommits = await interactiveCommitSelection(commitList);
      if (selectedCommits.length === 0) {
        console.log(chalk.yellow("No commits selected. Exiting."));
        process.exit(0);
      }
      await processCommits(selectedCommits, limitChunks, options);
    } else {
      // Non-interactive mode
      if (options.dryRun) {
        showDryRun(commitList);
        process.exit(0);
      }

      await processCommitsWithEditor(commitList, commits, limitChunks, options);
    }
  } catch (error) {
    console.error(chalk.red.bold(`\n❌ Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Create a backup branch
 */
async function createBackupBranch() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const branchName = `git-time-travel-backup-${timestamp}`;

  const spinner = ora(`Creating backup branch: ${branchName}`).start();

  try {
    await execa("git", ["branch", branchName]);
    spinner.succeed(chalk.green(`Backup branch created: ${branchName}`));
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
      message: "Select commits to modify:",
      choices,
      pageSize: 15,
    },
  ]);

  return selectedCommits;
}

/**
 * Show dry run preview
 */
function showDryRun(commitList) {
  console.log(chalk.yellow.bold("\n🔍 DRY RUN MODE - No changes will be made\n"));
  console.log(chalk.cyan("Commits that would be modified:\n"));

  commitList.forEach((commit, index) => {
    console.log(`${index + 1}. ${commit.date} | ${commit.hash.substring(0, 7)} | ${commit.message}`);
  });

  console.log(chalk.yellow(`\nTotal: ${commitList.length} commits`));
  console.log(chalk.yellow("To make actual changes, run without --dry-run flag\n"));
}

/**
 * Process commits with editor
 */
async function processCommitsWithEditor(commitList, commits, limitChunks, options) {
  const tmpfile = tempfile("gitblah-");
  const content = commitList.map(c => `${c.date} | ${c.hash} | ${c.message}`).join("\n");

  await fs.writeFile(tmpfile, content);

  const editor = getEditor(options.editor);

  try {
    await execa(editor, [tmpfile], { shell: true });
  } catch (error) {
    console.error(chalk.red.bold(`Error opening editor: ${error.message}`));
    console.error(chalk.yellow(`\nTip: Set your preferred editor using --editor flag or EDITOR environment variable`));
    console.error(chalk.yellow(`Example: git-time-travel --editor nano`));
    throw error;
  }

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Have you finished editing the commit dates?",
      default: true,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow("Operation cancelled."));
    process.exit(0);
  }

  console.log(
    `Please wait while we adjust the dates of your commits and enjoy the ${chalk.red.bold("TIME TRAVEL...")}`
  );

  const updatedContent = await fs.readFile(tmpfile, "utf-8");
  const updatedCommits = parseEditedCommits(updatedContent);

  await applyCommitChanges(updatedCommits, options.all ? updatedCommits.length : commits, limitChunks, options.debug);

  console.log(
    chalk.green.bold("\n✅ Git commit dates have been adjusted successfully!")
  );
  console.log(
    chalk.yellow("To push your changes, use: ") +
    chalk.cyan.bold("git push -f origin YOUR_BRANCH_NAME")
  );
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
    console.error(chalk.yellow("\n💡 Tip: Ensure dates are in format YYYY-MM-DDTHH:MM:SS+HH:MM"));
    console.error(chalk.yellow("Example: 2023-02-20T15:30:00+05:30\n"));
    throw new Error("Validation failed");
  }

  if (commits.length === 0) {
    throw new Error("No valid commits found to process");
  }

  return commits;
}

/**
 * Process commits in interactive mode
 */
async function processCommits(commits, limitChunks, options) {
  const { updatedCommits } = await inquirer.prompt([
    {
      type: "editor",
      name: "updatedCommits",
      message: "Edit commit dates",
      default: commits.map(c => `${c.date} | ${c.hash} | ${c.message}`).join("\n"),
    },
  ]);

  const parsedCommits = parseEditedCommits(updatedCommits);
  await applyCommitChanges(parsedCommits, parsedCommits.length, limitChunks, options.debug);

  console.log(chalk.green.bold("\n✅ Git commit dates have been adjusted successfully!"));
}

/**
 * Apply commit changes
 */
async function applyCommitChanges(commits, totalCommits, limitChunks, debug) {
  const collection = [];
  let iter = 0;
  let colIter = 0;

  for (const commit of commits) {
    const commitEnv = `
      if [ $GIT_COMMIT = ${commit.hash} ];
      then
      export GIT_AUTHOR_DATE="${commit.date}"
      export GIT_COMMITTER_DATE="${commit.date}"
      fi;
    `;

    iter++;

    if (debug && iter % limitChunks === limitChunks - 1) {
      console.log(`Chunk ${colIter} Finished`);
    }

    if (iter % limitChunks === 0) {
      colIter++;
      if (debug) {
        console.log(`Chunk ${colIter} Started`);
      }
    }

    collection[colIter] = (collection[colIter] || "") + commitEnv;

    if (debug) {
      console.log(`Commit ${iter}/${commits.length} Collected`);
    }
  }

  let shFile = `#!/bin/sh\nexport FILTER_BRANCH_SQUELCH_WARNING=1\n`;

  for (let i = 0; i < collection.length; i++) {
    const each = collection[i];
    const cmd = `git filter-branch -f --env-filter '${each}' HEAD~${totalCommits}..HEAD`;

    shFile += `${cmd}\n`;
    const filename = `filter_branch_commands_${i}.sh`;

    await fs.writeFile(filename, shFile);

    shFile = `#!/bin/sh\nexport FILTER_BRANCH_SQUELCH_WARNING=1\n`;

    const spinner = ora(`Chunk ${i + 1}/${collection.length} Started...`).start();

    try {
      await rewriteGitHistory(filename, i, collection.length, spinner);
    } catch (error) {
      console.error(chalk.red.bold(`\nFailed to rewrite history: ${error.message}`));
      process.exit(1);
    }
  }
}

// Run the application
main().catch(error => {
  console.error(chalk.red.bold(`Fatal error: ${error.message}`));
  process.exit(1);
});
