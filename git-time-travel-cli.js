#!/usr/bin/env node

import { exec } from "child_process";
import fs from "fs";
import chalk from "chalk";
import tempfile from "tempfile";
import readline from "readline";
import ora from "ora";
import { isGitRepo } from "./utils/isGitRepo.js";
import { showSignature } from "./utils/signature.js";
import { showHelp } from "./utils/showHelp.js";
import { rewriteGitHistory } from "./utils/rewriteGitHistory.js";
import { getEditor } from "./utils/getEditor.js";
import { sanitizeDate, isValidCommitHash } from "./utils/validateDate.js";

let COMMITS = 5;
let LIMITCHUNKS = 20;
let DEBUG = false;
let ALL = false;
let DRY_RUN = false;
let EDITOR = null;

/**
 * Determines if the current working directory is inside a Git repository.
 */
isGitRepo();

/**
 * Show signature
 */
showSignature();

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case "-c":
    case "--commits":
      COMMITS = parseInt(args[i + 1], 10) || COMMITS;
      if (isNaN(COMMITS) || COMMITS < 1) {
        console.error(chalk.red.bold(`Error: Invalid commit count "${args[i + 1]}". Must be a positive number.`));
        process.exit(1);
      }
      i++;
      break;
    case "-l":
    case "--limit":
      LIMITCHUNKS = parseInt(args[i + 1], 10) || LIMITCHUNKS;
      if (isNaN(LIMITCHUNKS) || LIMITCHUNKS < 1) {
        console.error(chalk.red.bold(`Error: Invalid limit "${args[i + 1]}". Must be a positive number.`));
        process.exit(1);
      }
      i++;
      break;
    case "-d":
    case "--debug":
      DEBUG = true;
      break;
    case "-a":
    case "--all":
      ALL = true;
      break;
    case "--dry-run":
      DRY_RUN = true;
      break;
    case "-e":
    case "--editor":
      EDITOR = args[i + 1];
      if (!EDITOR) {
        console.error(chalk.red.bold("Error: --editor flag requires a value"));
        process.exit(1);
      }
      i++;
      break;
    default:
      // unknown option
      break;
  }
}

if (args.includes("-h") || args.includes("--help")) {
  showHelp();
  process.exit(0);
}

let sh_file = `#!/bin/sh
export FILTER_BRANCH_SQUELCH_WARNING=1
`;

let datefmt = "%cI";

let ITER = 0;
let COLITER = 0;
const COLLECTION = [];
exec(`git log -n1 --pretty=format:"${datefmt}"`, (error, stdout) => {
  if (stdout === datefmt) {
    datefmt = "%ci";
  }

  let cmd = `git log -n ${COMMITS} --pretty=format:"${datefmt} | %H | %s"`;
  if (ALL) {
    cmd = `git log --pretty=format:"${datefmt} | %H | %s"`;
  }
  exec(cmd, (error, stdout) => {
    const tmpfile = tempfile("gitblah-");
    fs.writeFileSync(tmpfile, stdout);

    const editor = getEditor(EDITOR);

    if (DRY_RUN) {
      console.log(chalk.yellow.bold("\n🔍 DRY RUN MODE - No changes will be made\n"));
      console.log(chalk.cyan("Commits that would be modified:"));
      console.log(stdout);
      console.log(chalk.yellow(`\nTo make actual changes, run without --dry-run flag`));
      process.exit(0);
    }

    exec(`${editor} "${tmpfile}"`, (error, s) => {
      if (error) {
        console.error(chalk.red.bold(`Error opening editor: ${error.message}`));
        console.error(chalk.yellow(`\nTip: Set your preferred editor using --editor flag or EDITOR environment variable`));
        console.error(chalk.yellow(`Example: git-time-travel --editor nano`));
        process.exit(1);
      }

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(
        "Please update the commit date in the code editor and press enter to continue...",
        () => {
          console.log(
            `Please wait while we adjust the dates of your commits and enjoy the ${chalk.red.bold(
              "TIME TRAVEL..."
            )}`
          );
          const contents = fs.readFileSync(tmpfile, "utf-8");

          const commits = contents.split("\n").filter(line => line.trim());
          let count = 0;
          let validationErrors = [];

          for (const commit of commits) {
            count++;
            if (count > (ALL ? commits.length : COMMITS)) break;

            const [date, hash, message] = commit.split("|");

            if (!date || !hash) {
              validationErrors.push(`Line ${count}: Missing date or hash`);
              continue;
            }

            const trimmedDate = date.trim();
            const trimmedHash = hash.trim();

            // Validate commit hash
            if (!isValidCommitHash(trimmedHash)) {
              validationErrors.push(`Line ${count}: Invalid commit hash "${trimmedHash}"`);
              continue;
            }

            // Validate and sanitize date
            try {
              const DATE_NO_SPACE = sanitizeDate(trimmedDate);

              const commitEnv = `
                      if [ \$GIT_COMMIT = ${trimmedHash} ];
                      then
                      export GIT_AUTHOR_DATE="${DATE_NO_SPACE}"
                      export GIT_COMMITTER_DATE="${DATE_NO_SPACE}"
                      fi;
              `;
              ITER++;

              if (DEBUG && ITER % LIMITCHUNKS === LIMITCHUNKS - 1) {
                console.log(`Chunk ${COLITER} Finished`);
              }

              if (ITER % LIMITCHUNKS === 0) {
                COLITER++;
                if (DEBUG) {
                  console.log(`Chunk ${COLITER} Started`);
                }
              }

              COLLECTION[COLITER] = (COLLECTION[COLITER] || "") + commitEnv;
              if (DEBUG) {
                console.log(`Commit ${ITER}/${commits.length} Collected`);
              }
            } catch (err) {
              validationErrors.push(`Line ${count}: ${err.message}`);
            }
          }

          // If there are validation errors, display and exit
          if (validationErrors.length > 0) {
            console.error(chalk.red.bold("\n❌ Validation Errors Found:\n"));
            validationErrors.forEach(err => console.error(chalk.red(`  • ${err}`)));
            console.error(chalk.yellow("\n💡 Tip: Ensure dates are in format YYYY-MM-DDTHH:MM:SS+HH:MM"));
            console.error(chalk.yellow("Example: 2023-02-20T15:30:00+05:30\n"));
            rl.close();
            process.exit(1);
          }

          if (ITER === 0) {
            console.error(chalk.red.bold("\n❌ No valid commits found to process"));
            rl.close();
            process.exit(1);
          }

          let spinner;

          for (let i = 0; i < COLLECTION.length; i++) {
            const each = COLLECTION[i];
            let cmd = "";
            if (ALL) {
              cmd = `git filter-branch -f --env-filter '${each}' -- --all`;
            } else {
              cmd = `git filter-branch -f --env-filter '${each}' HEAD~${COMMITS}..HEAD`;
            }
            sh_file += `${cmd}\n`;
            fs.appendFileSync(`filter_branch_commands_${i}.sh`, sh_file);
            sh_file = `#!/bin/sh
            export FILTER_BRANCH_SQUELCH_WARNING=1
            `;

            if (DEBUG) {
              spinner = ora(
                `Chunk ${i + 1}/${COLLECTION.length} Started...`
              ).start();
              rewriteGitHistory(
                `filter_branch_commands_${i}.sh`,
                i,
                COLLECTION.length,
                spinner
              );
            } else {
              spinner = ora(
                `Chunk ${i + 1}/${COLLECTION.length} Started...`
              ).start();

              rewriteGitHistory(
                `filter_branch_commands_${i}.sh`,
                i,
                COLLECTION.length,
                spinner
              );
            }
          }
          spinner.succeed(
            chalk.green.bold(
              "Git commit dates have been adjusted. To push your changes, do 'git push -f BRANCH NAME'."
            )
          );
          rl.close();
          process.exit(0);
        }
      );
    });
  });
});
