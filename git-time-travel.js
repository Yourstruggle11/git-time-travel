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

let COMMITS = 5;
let LIMITCHUNKS = 20;
let DEBUG = false;
let ALL = false;

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
      COMMITS = args[i + 1] || COMMITS;
      i++;
      break;
    case "-l":
    case "--limit":
      LIMITCHUNKS = args[i + 1] || LIMITCHUNKS;
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

    const editor = "code";
    exec(`${editor} ${tmpfile}`, (error, s) => {
      if (error) {
        console.error(`Error: ${error}`);
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

          const commits = contents.split("\n");
          let count = 0;
          for (const commit of commits) {
            count++;
            if (count > (ALL ? commits : COMMITS)) break;

            const [date, hash, message] = commit.split("|");
            const DATE_NO_SPACE = date.trim();

            const commitEnv = `
                      if [ \$GIT_COMMIT = ${hash.trim()} ];
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
          }

          for (let i = 0; i < COLLECTION.length; i++) {
            const each = COLLECTION[i];
            let cmd = "";
            if (ALL) {
              cmd = `git filter-branch -f --env-filter '${each}' -- --all`;
            } else {
              cmd = `git filter-branch -f --env-filter '${each}' HEAD~${COMMITS}..HEAD`;
            }
            sh_file += `${cmd}\n`;
            fs.appendFileSync("filter_branch_commands.sh", sh_file);

            if (DEBUG) {
              let spinner = ora(
                `Chunk ${i + 1}/${COLLECTION.length} Started`
              ).start();
              exec("bash filter_branch_commands.sh", (error, s) => {
                if (error) {
                  spinner.fail(`Error: ${error}`);

                  // Delete the .sh file if there is any erroe
                  fs.unlink("filter_branch_commands.sh", (err) => {
                    if (err) {
                      spinner.fail(`Error: ${error}`);
                      process.exit(1);
                    }
                  });
                  process.exit(1);
                }
                // Delete the .sh file after the command has been executed
                fs.unlink("filter_branch_commands.sh", (err) => {
                  if (err) {
                    spinner.fail(`Error: ${error}`);
                    console.error(`Error deleting file: ${err}`);
                    process.exit(1);
                  }
                  spinner.succeed(
                    `Chunk ${i + 1}/${COLLECTION.length} Finished`,
                    s
                  );
                  spinner.succeed(
                    chalk.green.bold(
                      "Git commit dates have been adjusted. To push your changes, do 'git push -f BRANCH NAME'."
                    )
                  );
                });
              });
            } else {
              let spinner = ora(
                `Chunk ${i + 1}/${COLLECTION.length} Started`
              ).start();
              exec("bash filter_branch_commands.sh", (error, s) => {
                if (error) {
                  spinner.fail(`Error: ${error}`);
                  // Delete the .sh file if there is any erroe
                  fs.unlink("filter_branch_commands.sh", (err) => {
                    if (err) {
                      spinner.fail(`Error: ${error}`);
                      process.exit(1);
                    }
                  });
                  process.exit(1);
                }
                // Delete the .sh file after the command has been executed
                fs.unlink("filter_branch_commands.sh", (err) => {
                  if (err) {
                    spinner.fail(`Error: ${error}`);
                    process.exit(1);
                  }
                  spinner.succeed(
                    `Chunk ${i + 1}/${COLLECTION.length} Finished`,
                    s
                  );
                  spinner.succeed(
                    chalk.green.bold(
                      "Git commit dates have been adjusted. To push your changes, do 'git push -f BRANCH NAME'."
                    )
                  );
                });
              });
            }
          }
          rl.close();
        }
      );
    });
  });
});
