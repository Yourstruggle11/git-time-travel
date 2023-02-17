import { exec, execSync } from "child_process";
import fs from "fs";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { isGitRepo } from "../utils/isGitRepo.js";
import path from "path";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Git time traveler", () => {
  it("should detect if it is in a Git repository", () => {
    return expect(isGitRepo()).to.be.true;
  });

  it("should execute git log command", () => {
    const cmd = "git log -n1 --pretty=format:'%cI'";
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    }).then((result) => {
      expect(result).to.match(
        /^'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2})'$/
      );
    });
  });

  it("should create a temporary file with git log output", () => {
    const cmd = "git log -n1 --pretty=format:'%cI'";
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    })
      .then((result) => {
        return new Promise((resolve, reject) => {
          fs.writeFile("tempfile", result, (error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        });
      })
      .then(() => {
        return expect(fs.existsSync("tempfile")).to.be.true;
      });
  });

  it("should execute the specified editor with the temporary file", () => {
    // Replace "vim" with the path to your preferred editor.
    const editor = "CODE";
    const cmd = `${editor} tempfile`;
    return new Promise((resolve, reject) => {
      exec(cmd, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  });

  it("should reject if the specified editor is not found", () => {
    const editor = "fakeeditor";
    const cmd = `${editor} tempfile`;
    return expect(
      new Promise((resolve, reject) => {
        exec(cmd, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      })
    ).to.eventually.be.rejected;
  });

  it("should delete the temporary file", () => {
    // Code omitted for brevity
    // Delete the temporary file
    fs.unlinkSync("tempfile");
    // Verify that the file no longer exists
    return expect(fs.existsSync("tempfile")).to.be.false;
  });

  it("should reject if the filter-branch commands fail", () => {
    // Create a Git repository and add a commit to it.
    return expect(
      new Promise((resolve, reject) => {
        const tmpdir = fs.mkdtempSync("/tmp");
        const repoPath = path.join(tmpdir, "repo");
        fs.mkdirSync(repoPath);
        process.chdir(repoPath);
        execSync("git init");
        fs.writeFileSync("README.md", "# Test repository");
        execSync("git add README.md");
        execSync("git commit -m 'Initial commit'");
        // Make a backup of the original HEAD commit.
        const backup = execSync("git rev-parse HEAD").toString().trim();
        // Replace the HEAD commit with a new commit that will fail the filter-branch command.
        fs.writeFileSync("README.md", "# Updated README");
        execSync("git add README.md");
        execSync("git commit -m 'Update README'");
        execSync("git reset --hard HEAD~1");
        // Run the filter-branch command.
        const cmd = "git filter-branch --env-filter 'exit 1' HEAD";

        exec(cmd, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      })
    ).to.eventually.be.rejected;
  });
});
