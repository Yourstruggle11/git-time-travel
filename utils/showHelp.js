export const showHelp = () => {
    console.log("Usage: git-time-travel [options]");
    console.log("");
    console.log("Options:");
    console.log("  -V, --version           Output the version number");
    console.log("  -c, --commits <number>  Number of commits to modify (default: 5)");
    console.log("  -l, --limit <number>    Number of chunks to split commits into (default: 20)");
    console.log("  -e, --editor <editor>   Specify the editor to use (overrides EDITOR/VISUAL env)");
    console.log("  -d, --debug             Enable debug mode for verbose output");
    console.log("  -a, --all               Change date for all available commits");
    console.log("  -i, --interactive       Interactive mode with commit selection");
    console.log("  -b, --backup            Create a backup branch before making changes");
    console.log("  --dry-run               Preview changes without modifying git history");
    console.log("  -h, --help              Display usage information");
    console.log("");
    console.log("Examples:");
    console.log("  git-time-travel -c 3                    Modify last 3 commits");
    console.log("  git-time-travel --interactive           Select commits interactively");
    console.log("  git-time-travel --backup --dry-run      Preview with backup branch");
    console.log("  git-time-travel --editor nano           Use nano as editor");
    console.log("  git-time-travel -a                      Modify all commits");
  }
  