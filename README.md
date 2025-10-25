<img src="./screenShots/SS1.jpeg">
<br />
<br />


[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![NPM Downloads](https://img.shields.io/npm/dt/git-time-travel.svg?style=flat)](https://npmcharts.com/compare/git-time-travel?minimal=true)

# Git Time Travel

https://user-images.githubusercontent.com/82510209/219964886-bb020c32-d13f-479b-898a-b6aa8161c542.mp4


Git Time Travel is a powerful Node.js package that lets you manipulate the date and time of any previous Git commit in your repository. With Git Time Travel, you can easily correct mistakes or update information in your Git history without having to rewrite your entire commit history.Try Git Time Travel today and take control of your Git history!

## 🆕 What's New in v1.2.0

- **🎯 Interactive Mode**: Select specific commits using checkboxes
- **💾 Auto Backup**: Create safety branches before modifications
- **🚀 Async/Await**: Completely rewritten with modern async patterns
- **📦 Multiple Date Formats**: Support for ISO 8601, RFC 2822, and Unix timestamps
- **⚡ Better CLI**: Powered by Commander.js with improved arg parsing
- **✅ CI/CD**: GitHub Actions workflow for automated testing

# Prerequisites

- **Git Bash** (Windows) or any bash shell (Unix/Linux/macOS). Download from [here](https://git-scm.com/downloads)
- **Node.js** version 18 or higher
- A text editor (VS Code, nano, vim, etc.) - can be configured via `--editor` flag or `EDITOR` environment variable

## Installation

### To install Git Time Travel, use npm:

```sh
$ npm install -g git-time-travel
```
This will install Git Time Travel globally on your system, making it available as a command line tool.

# Usage

Git Time Travel is a command line tool that allows you to change the date and time of previous Git commits.

To use Git Time Travel, navigate to a Git repository and run:

```bash
$ git-time-travel [options]
```
## Here are the available options for Git Time Travel:


# Options

| Flag | Description |
|------|-------------|
| `-V, --version` | Output the version number |
| `-c, --commits <number>` | Number of commits to modify (default: 5) |
| `-l, --limit <number>` | Number of chunks to split commits into (default: 20) |
| `-e, --editor <editor>` | Specify the editor to use (overrides `EDITOR` and `VISUAL` env vars) |
| `-d, --debug` | Enable debug mode for verbose output |
| `-a, --all` | Change date for all available commits |
| `-i, --interactive` | **NEW** Interactive mode with commit selection |
| `-b, --backup` | **NEW** Create a backup branch before making changes |
| `--dry-run` | Preview changes without modifying git history |
| `-h, --help` | Display usage information |


# Examples

### Change the date of the most recent commit

```bash
$ git-time-travel -c 1
```

### Preview changes without applying them

```bash
$ git-time-travel --dry-run
```

### Use a specific editor

```bash
$ git-time-travel --editor nano
$ git-time-travel --editor vim
```

### Modify last 10 commits

```bash
$ git-time-travel -c 10
```

### Modify all commits in repository

```bash
$ git-time-travel --all
```

### 🆕 Interactive mode with commit selection

```bash
$ git-time-travel --interactive
```

### 🆕 Create backup before modifying

```bash
$ git-time-travel --backup -c 5
```

### 🆕 Combine flags for safety

```bash
$ git-time-travel --backup --interactive --dry-run
```

## How it Works

### Standard Mode

1. Run the command with your desired options
2. Code editor will open with the commit list:

<img src="./screenShots/SS2.jpeg">

3. Edit the dates in the format shown
4. Save the file and close the editor
5. Confirm when prompted
6. That's it! Your commit dates have been updated.

### Interactive Mode (NEW in v1.2.0)

1. Run with `--interactive` flag
2. Select specific commits using checkboxes
3. Edit dates in your preferred editor
4. Changes are applied only to selected commits

## Date Format

Git Time Travel supports the following date formats:
- **ISO 8601**: `2023-02-20T15:30:00+05:30` or `2023-02-20T15:30:00Z`
- **Git default**: `2023-02-20 15:30:00 +0530`
- **RFC 2822**: `Mon, 20 Feb 2023 15:30:00 +0530`
- **Unix timestamp**: `1234567890` (seconds since epoch)

## Troubleshooting

### Editor not opening

**Problem**: Error opening editor

**Solution**:
- Specify your editor explicitly: `git-time-travel --editor nano`
- Or set the `EDITOR` environment variable:
  ```bash
  export EDITOR=nano  # Linux/macOS
  set EDITOR=nano     # Windows CMD
  ```

### Invalid date format error

**Problem**: Validation errors when processing dates

**Solution**:
- Ensure dates follow the format: `YYYY-MM-DDTHH:MM:SS+HH:MM`
- Example: `2023-02-20T15:30:00+05:30`
- Don't remove the pipe separators (`|`) between date, hash, and message

### Not a git repo error

**Problem**: "Not a git repo!" error

**Solution**:
- Navigate to a git repository directory before running the command
- Verify with `git status`

### Git Bash requirement (Windows)

**Problem**: Script fails on Windows

**Solution**:
- Install Git Bash from [git-scm.com](https://git-scm.com/downloads)
- Run the command from Git Bash terminal, not CMD or PowerShell

### Force push after changes

After modifying commit dates, you'll need to force push to update the remote:

```bash
git push -f origin YOUR_BRANCH_NAME
```

⚠️ **Warning**: Force pushing rewrites history. Make sure to coordinate with your team if working on a shared branch.

## FAQ

**Q: Can I undo changes after running git-time-travel?**

A: Yes, use `git reflog` to find the previous state and reset:
```bash
git reflog
git reset --hard HEAD@{n}  # Replace n with the appropriate number
```

**Q: Is it safe to use on shared branches?**

A: Be cautious! Rewriting history on shared branches can cause issues for collaborators. Use `--dry-run` first and coordinate with your team.

**Q: Does this work with signed commits?**

A: Changing commit dates will invalidate GPG signatures. You'll need to re-sign commits if needed.


Created with ❤️ by Souvik Sen


## License

Git Time Travel is released under the [MIT](LICENSE) LICENSE.

[npm-image]: https://img.shields.io/npm/v/git-time-travel.svg
[npm-url]: https://www.npmjs.com/package/git-time-travel
[downloads-image]: https://img.shields.io/npm/dm/git-time-travel.svg
[downloads-url]: https://www.npmjs.com/package/git-time-travel
