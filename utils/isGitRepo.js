import { execSync } from "child_process";

/**
 * Determines if the current working directory is inside a Git repository.
 * @returns {boolean} True if the current working directory is inside a Git repository, false otherwise.
 */

export const isGitRepo = () => {
    try {
      execSync('git rev-parse --show-toplevel');
      return true;
    } catch (err) {
      if (err.status === 128) {
        console.error('Not a git repo!');
        process.exit(1);
      } else {
        throw err;
      }
    }
  }