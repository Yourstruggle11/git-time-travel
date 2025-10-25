export const showHelp = () => {
    console.log("Usage: git-time-travel [options]");
    console.log("");
    console.log("Options:");
    console.log("  -c, --commits [number]  Number of commits to modify. If not specified, the last 5 commits will be used.");
    console.log("  -l, --limit [number]    Number of chunks to split each commit into (default: 20)");
    console.log("  -e, --editor [editor]   Specify the editor to use (overrides EDITOR and VISUAL env vars)");
    console.log("  -d, --debug             Enable debug mode for verbose output");
    console.log("  -a, --all               Change date for all available commits");
    console.log("  --dry-run               Preview changes without modifying git history");
    console.log("  -h, --help              Display usage information");
    console.log("");
    console.log("Examples:");
    console.log("  git-time-travel -c 3                    Modify last 3 commits");
    console.log("  git-time-travel --dry-run               Preview without making changes");
    console.log("  git-time-travel --editor nano           Use nano as editor");
    console.log("  git-time-travel -a                      Modify all commits");
  }
  