import { promises as fs } from "fs";
import path from "path";
import chalk from "chalk";

/**
 * Load batch operations from JSON file
 */
export async function loadBatchFromJSON(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(content);

    if (!Array.isArray(data)) {
      throw new Error("JSON file must contain an array of commit objects");
    }

    // Validate each commit object
    const validatedCommits = data.map((commit, index) => {
      if (!commit.hash || !commit.date) {
        throw new Error(`Commit at index ${index} missing required 'hash' or 'date' field`);
      }

      return {
        hash: commit.hash,
        date: commit.date,
        message: commit.message || "",
        authorOnly: commit.authorOnly || false,
        committerOnly: commit.committerOnly || false,
      };
    });

    return validatedCommits;
  } catch (error) {
    throw new Error(`Failed to load batch file: ${error.message}`);
  }
}

/**
 * Load batch operations from YAML file
 */
export async function loadBatchFromYAML(filePath) {
  try {
    // Import yaml dynamically
    const yaml = await import("js-yaml");
    const content = await fs.readFile(filePath, "utf-8");
    const data = yaml.load(content);

    if (!Array.isArray(data)) {
      throw new Error("YAML file must contain an array of commit objects");
    }

    // Validate each commit object
    const validatedCommits = data.map((commit, index) => {
      if (!commit.hash || !commit.date) {
        throw new Error(`Commit at index ${index} missing required 'hash' or 'date' field`);
      }

      return {
        hash: commit.hash,
        date: commit.date,
        message: commit.message || "",
        authorOnly: commit.authorOnly || false,
        committerOnly: commit.committerOnly || false,
      };
    });

    return validatedCommits;
  } catch (error) {
    if (error.code === "ERR_MODULE_NOT_FOUND") {
      throw new Error("js-yaml package required for YAML support. Install: npm install js-yaml");
    }
    throw new Error(`Failed to load batch file: ${error.message}`);
  }
}

/**
 * Load batch operations from file (auto-detect format)
 */
export async function loadBatchOperations(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  console.log(chalk.cyan(`Loading batch operations from: ${filePath}`));

  let commits;

  if (ext === ".json") {
    commits = await loadBatchFromJSON(filePath);
  } else if (ext === ".yml" || ext === ".yaml") {
    commits = await loadBatchFromYAML(filePath);
  } else {
    throw new Error(`Unsupported file format: ${ext}. Supported: .json, .yml, .yaml`);
  }

  console.log(chalk.green(`✓ Loaded ${commits.length} commit operations`));

  return commits;
}

/**
 * Generate example batch file
 */
export async function generateExampleBatchFile(format = "json", outputPath) {
  const exampleData = [
    {
      hash: "abc123def456",
      date: "2023-02-20T15:30:00+05:30",
      message: "Update commit date for feature X",
      authorOnly: false,
      committerOnly: false,
    },
    {
      hash: "789ghi012jkl",
      date: "2023-02-21T10:00:00+05:30",
      message: "Update commit date for bug fix Y",
    },
  ];

  let content;

  if (format === "json") {
    content = JSON.stringify(exampleData, null, 2);
  } else if (format === "yaml" || format === "yml") {
    const yaml = await import("js-yaml");
    content = yaml.dump(exampleData);
  } else {
    throw new Error(`Unsupported format: ${format}`);
  }

  await fs.writeFile(outputPath, content);

  console.log(chalk.green(`✓ Example batch file created: ${outputPath}`));
  console.log(chalk.cyan("\nEdit this file with your commit hashes and dates, then run:"));
  console.log(chalk.white(`  git-time-travel --batch ${outputPath}`));
}

/**
 * Export current commit selection to batch file
 */
export async function exportToBatchFile(commits, format = "json", outputPath) {
  const exportData = commits.map(commit => ({
    hash: commit.hash,
    date: commit.date,
    message: commit.message || "",
  }));

  let content;

  if (format === "json") {
    content = JSON.stringify(exportData, null, 2);
  } else if (format === "yaml" || format === "yml") {
    const yaml = await import("js-yaml");
    content = yaml.dump(exportData);
  } else {
    throw new Error(`Unsupported format: ${format}`);
  }

  await fs.writeFile(outputPath, content);

  console.log(chalk.green(`✓ Exported ${commits.length} commits to: ${outputPath}`));
}
