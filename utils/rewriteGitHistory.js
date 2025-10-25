import { execaSync } from "execa";
import fs from "fs";
import { getShell } from "./getEditor.js";

export const rewriteGitHistory = (file, index, collectionLength, spinner) => {
  try {
    const shell = getShell();

    execaSync(shell, [file], {
      stdio: "inherit",
    });

    spinner.succeed(`Chunk ${index + 1}/${collectionLength} Finished`);

    fs.unlink(file, (err) => {
      if (err) {
        spinner.fail(`Error deleting temp file: ${err.message}`);
        process.exit(1);
      }
    });
  } catch (error) {
    spinner.fail(`Error executing filter-branch: ${error.message}`);

    // Delete the .sh file if there is any error
    fs.unlink(file, (err) => {
      if (err) {
        console.error(`Failed to cleanup temp file: ${err.message}`);
      }
    });
    process.exit(1);
  }
};