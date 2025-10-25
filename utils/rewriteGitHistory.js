import { execa } from "execa";
import { promises as fs } from "fs";
import { getShell } from "./getEditor.js";

export const rewriteGitHistory = async (file, index, collectionLength, spinner) => {
  try {
    const shell = getShell();

    await execa(shell, [file], {
      stdio: "inherit",
    });

    spinner.succeed(`Chunk ${index + 1}/${collectionLength} Finished`);

    try {
      await fs.unlink(file);
    } catch (err) {
      spinner.fail(`Error deleting temp file: ${err.message}`);
      throw err;
    }
  } catch (error) {
    spinner.fail(`Error executing filter-branch: ${error.message}`);

    // Delete the .sh file if there is any error
    try {
      await fs.unlink(file);
    } catch (err) {
      console.error(`Failed to cleanup temp file: ${err.message}`);
    }
    throw error;
  }
};