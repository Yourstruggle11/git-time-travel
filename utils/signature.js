import chalk from "chalk";
import figlet from "figlet";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

const projectName = "Git Time Travel";
const asciiTitle = projectName;

const figletOptions = {
  font: "Slant",
  horizontalLayout: "default",
  verticalLayout: "default",
};

const identity = (text) => text;

const createStyler = (styleFn, useColor) =>
  useColor && typeof styleFn === "function" ? styleFn : identity;

const getTerminalWidth = () => {
  if (
    typeof process.stdout === "object" &&
    process.stdout &&
    typeof process.stdout.columns === "number"
  ) {
    return Math.max(process.stdout.columns - 4, 60);
  }
  return 80;
};

const buildSignature = ({ useColor = true, maxWidth } = {}) => {
  let asciiArt;
  try {
    asciiArt = figlet.textSync(asciiTitle, figletOptions);
  } catch (error) {
    console.log("Something went wrong...");
    console.dir(error);
    asciiArt = asciiTitle;
  }

  const style = (styleFn) => createStyler(styleFn, useColor);

  const colorCycle = [
    style(chalk.redBright.bold),
    style(chalk.magentaBright.bold),
    style(chalk.yellowBright.bold),
    style(chalk.blueBright.bold),
    style(chalk.cyanBright.bold),
  ];

  const overview =
    "Rewrite commit timestamps safely, with guardrails for every run.";
  const highlights = [
    "* Target commits by range, author, message, or batch file.",
    "* Export, replay, and dry-run timestamp edits before pushing.",
    "* Roll back or audit every rewrite via built-in history logs.",
  ];
  const quickTips = [
    "> git-time-travel --interactive   # curate commits before editing",
    "> git-time-travel --rollback      # undo the last rewrite instantly",
    "> git-time-travel --history       # review recent operations",
  ];
  const footer =
    "Docs: README.md  |  Maintainer: Souvik Sen  |  Version " + version;

  const infoLines = [
    { raw: projectName + " v" + version, color: style(chalk.whiteBright.bold) },
    { raw: overview, color: style(chalk.cyanBright) },
    { raw: "", color: identity },
    { raw: "Highlights", color: style(chalk.gray.underline) },
    ...highlights.map((raw) => ({ raw, color: style(chalk.yellowBright) })),
    { raw: "", color: identity },
    { raw: "Quick Commands", color: style(chalk.gray.underline) },
    ...quickTips.map((raw) => ({ raw, color: style(chalk.greenBright) })),
    { raw: "", color: identity },
    { raw: footer, color: style(chalk.magentaBright) },
  ];

  const bannerLines = asciiArt
    .split("\n")
    .filter(Boolean)
    .map((line, index) => colorCycle[index % colorCycle.length](line));

  const longestLine = Math.max(...infoLines.map((line) => line.raw.length), 60);
  const availableWidth =
    typeof maxWidth === "number" && maxWidth > 0 ? maxWidth : getTerminalWidth();
  const contentWidth = Math.max(
    Math.min(longestLine, Math.max(availableWidth, 60)),
    60
  );

  const borderColor = style(chalk.gray);
  const border = borderColor("+" + "-".repeat(contentWidth + 2) + "+");

  const formatLine = (raw, color = identity) => {
    const truncated =
      raw.length > contentWidth
        ? raw.slice(0, contentWidth - 3) + "..."
        : raw;
    const padded = truncated.padEnd(contentWidth, " ");
    const content = color(padded);
    const prefix = borderColor("| ");
    const suffix = borderColor(" |");
    return prefix + content + suffix;
  };

  const infoPanelLines = infoLines.map((line) =>
    formatLine(line.raw, line.color)
  );

  return {
    bannerLines,
    infoPanelLines: [border, ...infoPanelLines, border],
  };
};

/**
 * Renders the Git Time Travel banner and companion info panel for CLI entrypoints.
 */
export const showSignature = () => {
  const { bannerLines, infoPanelLines } = buildSignature({ useColor: true });
  bannerLines.forEach((line) => console.log(line));
  console.log();
  infoPanelLines.forEach((line) => console.log(line));
};

