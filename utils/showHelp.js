export const showHelp = () => {
    console.log("Usage: git-time-travel [options]");
    console.log("");
    console.log("Options:");
    console.log("  -c, --commits [number]  Numer of commits to modify. If not specified, the last 5 commits will be used.");
    console.log("  -l, --limit [number]    specifies the number of chunks to split each commit into, with the default value being 20");
    console.log("  -d, --debug             specifies whether to enable debug mode or not");
    console.log("  -a or --all             specifies whether to change date for all available commits.");
    console.log("  -h, --help              output usage information");
  }
  