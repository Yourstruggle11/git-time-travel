import { execa } from "execa";
import chalk from "chalk";

/**
 * Parse git commit range string (e.g., HEAD~5..HEAD~2, abc123..def456)
 * @param {string} rangeStr - Git range string
 * @returns {Promise<Array>} Array of commit objects
 */
export async function parseCommitRange(rangeStr) {
  try {
    // Get commits in the range
    const { stdout } = await execa("git", [
      "log",
      rangeStr,
      "--pretty=format:%cI | %H | %s",
    ]);

    if (!stdout.trim()) {
      throw new Error(`No commits found in range: ${rangeStr}`);
    }

    const commits = stdout.split("\n").filter(line => line.trim()).map(line => {
      const [date, hash, ...messageParts] = line.split("|");
      return {
        date: date.trim(),
        hash: hash.trim(),
        message: messageParts.join("|").trim(),
      };
    });

    return commits;
  } catch (error) {
    throw new Error(`Invalid commit range "${rangeStr}": ${error.message}`);
  }
}

/**
 * Validate commit range string
 */
export function isValidCommitRange(rangeStr) {
  // Valid formats:
  // - HEAD~5..HEAD~2
  // - abc123..def456
  // - v1.0..v2.0
  // - branch1..branch2
  // - commit_hash^..commit_hash

  const rangeRegex = /^[\w~^.-]+\.\.[\w~^.-]+$/;
  return rangeRegex.test(rangeStr);
}

/**
 * Get commits by author
 */
export async function getCommitsByAuthor(author, limit = null) {
  try {
    const args = [
      "log",
      `--author=${author}`,
      "--pretty=format:%cI | %H | %s",
    ];

    if (limit) {
      args.splice(1, 0, `-n${limit}`);
    }

    const { stdout } = await execa("git", args);

    if (!stdout.trim()) {
      throw new Error(`No commits found by author: ${author}`);
    }

    const commits = stdout.split("\n").filter(line => line.trim()).map(line => {
      const [date, hash, ...messageParts] = line.split("|");
      return {
        date: date.trim(),
        hash: hash.trim(),
        message: messageParts.join("|").trim(),
      };
    });

    return commits;
  } catch (error) {
    throw new Error(`Failed to get commits by author: ${error.message}`);
  }
}

/**
 * Get commits by message pattern
 */
export async function getCommitsByMessage(pattern, limit = null) {
  try {
    const args = [
      "log",
      `--grep=${pattern}`,
      "--pretty=format:%cI | %H | %s",
    ];

    if (limit) {
      args.splice(1, 0, `-n${limit}`);
    }

    const { stdout } = await execa("git", args);

    if (!stdout.trim()) {
      throw new Error(`No commits found matching pattern: ${pattern}`);
    }

    const commits = stdout.split("\n").filter(line => line.trim()).map(line => {
      const [date, hash, ...messageParts] = line.split("|");
      return {
        date: date.trim(),
        hash: hash.trim(),
        message: messageParts.join("|").trim(),
      };
    });

    return commits;
  } catch (error) {
    throw new Error(`Failed to get commits by message: ${error.message}`);
  }
}

/**
 * Get commits in date range
 */
export async function getCommitsByDateRange(afterDate, beforeDate = null) {
  try {
    const args = [
      "log",
      `--after=${afterDate}`,
      "--pretty=format:%cI | %H | %s",
    ];

    if (beforeDate) {
      args.splice(2, 0, `--before=${beforeDate}`);
    }

    const { stdout } = await execa("git", args);

    if (!stdout.trim()) {
      throw new Error(`No commits found in date range`);
    }

    const commits = stdout.split("\n").filter(line => line.trim()).map(line => {
      const [date, hash, ...messageParts] = line.split("|");
      return {
        date: date.trim(),
        hash: hash.trim(),
        message: messageParts.join("|").trim(),
      };
    });

    return commits;
  } catch (error) {
    throw new Error(`Failed to get commits by date range: ${error.message}`);
  }
}

/**
 * Show commit range preview
 */
export async function showCommitRangePreview(rangeStr) {
  const commits = await parseCommitRange(rangeStr);

  console.log(chalk.cyan.bold(`\nCommits in range: ${rangeStr}\n`));

  commits.forEach((commit, index) => {
    console.log(`${index + 1}. ${commit.date}`);
    console.log(`   ${chalk.gray(commit.hash.substring(0, 7))} ${commit.message}`);
  });

  console.log(chalk.cyan(`\nTotal: ${commits.length} commits\n`));

  return commits;
}
