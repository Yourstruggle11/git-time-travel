import { exec, execSync } from "child_process";
import fs from "fs";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { isGitRepo } from "../utils/isGitRepo.js";
import path from "path";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Git time travel", () => {
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
      const out = result.trim(); // remove newline if present
      // allow either plain ISO or ISO wrapped in single quotes
      const isoStrict =
        /^'?\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+\-]\d{2}:\d{2})'?$/;
      expect(out).to.match(isoStrict);
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

  it.skip("should execute the specified editor with the temporary file", () => {
    // Skipped: Editor test requires manual interaction
    // Replace "vim" with the path to your preferred editor.
    const editor = "code";
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

  it("should reject if the filter-branch commands fail", function () {
    // Create a Git repository and add a commit to it.
    this.timeout(15000); // allow up to 15s on CI

    return expect(
      new Promise((resolve, reject) => {
        const tmpdir = fs.mkdtempSync(path.join(process.cwd(), "temp-"));
        const repoPath = path.join(tmpdir, "repo");
        fs.mkdirSync(repoPath);

        const cwd = process.cwd();
        try {
          process.chdir(repoPath);

          execSync("git init");
          // Make Git non-interactive & fast
          execSync('git config user.name "CI"');
          execSync('git config user.email "ci@example.com"');
          execSync("git config advice.detachedHead false");

          fs.writeFileSync("README.md", "# Test repository");
          execSync("git add README.md");
          execSync("git commit -m 'Initial commit'");

          // Create one more commit so there’s something to rewrite
          fs.writeFileSync("README.md", "# Updated README");
          execSync("git add README.md");
          execSync("git commit -m 'Update README'");

          // Fail fast: -f (force), --quiet, and limit scope to HEAD only
          const cmd = "git filter-branch -f --quiet --env-filter 'exit 1' HEAD";
          exec(cmd, (error) => {
            // We EXPECT an error; rejection = test passes
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        } catch (e) {
          // Bubble setup errors to the promise
          reject(e);
        } finally {
          // restore CWD so other tests aren’t impacted
          process.chdir(cwd);
        }
      })
    ).to.eventually.be.rejected;
  });
});
