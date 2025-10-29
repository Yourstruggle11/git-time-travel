import { execa } from "execa";
import { promises as fs } from "fs";
import path from "path";
import chalk from "chalk";
import os from "os";

const HISTORY_FILE = path.join(os.homedir(), ".git-time-travel-history.json");

/**
 * Save operation to history for rollback
 */
export async function saveOperationHistory(operation) {
  try {
    let history = [];

    // Read existing history
    try {
      const content = await fs.readFile(HISTORY_FILE, "utf-8");
      history = JSON.parse(content);
    } catch (error) {
      // File doesn't exist yet, start fresh
    }

    // Add new operation
    history.unshift({
      ...operation,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 10 operations
    history = history.slice(0, 10);

    // Write back
    await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error(chalk.yellow(`Warning: Could not save operation history: ${error.message}`));
  }
}

/**
 * Get operation history
 */
export async function getOperationHistory() {
  try {
    const content = await fs.readFile(HISTORY_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

/**
 * Rollback last operation
 */
export async function rollbackLastOperation() {
  const history = await getOperationHistory();

  if (history.length === 0) {
    console.log(chalk.yellow("No operations found in history to rollback"));
    return false;
  }

  const lastOp = history[0];

  console.log(chalk.cyan("\nLast operation:"));
  console.log(chalk.white(`  Date: ${new Date(lastOp.timestamp).toLocaleString()}`));
  console.log(chalk.white(`  Type: ${lastOp.type}`));
  console.log(chalk.white(`  Branch: ${lastOp.branch}`));

  if (lastOp.backupBranch) {
    console.log(chalk.green(`  Backup: ${lastOp.backupBranch}`));

    const inquirer = await import("inquirer");
    const { confirm } = await inquirer.default.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Reset to backup branch?",
        default: false,
      },
    ]);

    if (confirm) {
      try {
        // Reset to backup branch
        await execa("git", ["reset", "--hard", lastOp.backupBranch]);
        console.log(chalk.green.bold("\n✅ Rolled back successfully!"));

        // Remove from history
        history.shift();
        await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));

        return true;
      } catch (error) {
        console.error(chalk.red.bold(`\n❌ Rollback failed: ${error.message}`));
        return false;
      }
    }
  } else if (lastOp.originalRef) {
    console.log(chalk.green(`  Original ref: ${lastOp.originalRef}`));

    const inquirer = await import("inquirer");
    const { confirm } = await inquirer.default.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Reset to original ref?",
        default: false,
      },
    ]);

    if (confirm) {
      try {
        // Use reflog to go back
        await execa("git", ["reset", "--hard", lastOp.originalRef]);
        console.log(chalk.green.bold("\n✅ Rolled back successfully!"));

        // Remove from history
        history.shift();
        await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));

        return true;
      } catch (error) {
        console.error(chalk.red.bold(`\n❌ Rollback failed: ${error.message}`));
        return false;
      }
    }
  } else {
    console.log(chalk.yellow("\nNo backup information available for this operation"));
    console.log(chalk.yellow("Try using git reflog to manually recover:"));
    console.log(chalk.gray("  git reflog"));
    console.log(chalk.gray("  git reset --hard HEAD@{n}"));
    return false;
  }

  return false;
}

/**
 * List operation history
 */
export async function listOperationHistory() {
  const history = await getOperationHistory();

  if (history.length === 0) {
    console.log(chalk.yellow("No operations in history"));
    return;
  }

  console.log(chalk.cyan.bold("\nOperation History:\n"));

  history.forEach((op, index) => {
    console.log(chalk.white(`${index + 1}. ${new Date(op.timestamp).toLocaleString()}`));
    console.log(chalk.gray(`   Type: ${op.type}`));
    console.log(chalk.gray(`   Branch: ${op.branch}`));
    if (op.backupBranch) {
      console.log(chalk.green(`   Backup: ${op.backupBranch}`));
    }
    console.log();
  });
}
