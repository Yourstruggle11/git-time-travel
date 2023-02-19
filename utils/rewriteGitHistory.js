
import { execSync } from "child_process";
import fs from "fs";

export const rewriteGitHistory =  (file, index, collectionLength,spinner) => {
    try {
        execSync(`bash ${file}`, {
          stdio: "inherit",
        });

        spinner.succeed(
          `Chunk ${index + 1}/${collectionLength} Finished`,
        );
        fs.unlink(`${file}`, (err) => {
          if (err) {
            spinner.fail(`Error: ${error}`);
            process.exit(1);
          }
        });
      } catch (error) {
        spinner.fail(`Error: ${error}`);
        // Delete the .sh file if there is any erroe
        fs.unlink(`${file}`, (err) => {
          if (err) {
            spinner.fail(`Error: ${error}`);
            process.exit(1);
          }
        });
        process.exit(1);
      }
}