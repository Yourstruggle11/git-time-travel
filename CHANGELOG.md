# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 30-10-2025

### 🚨 BREAKING CHANGES

#### Changed
- **Confirmation Required**: Now requires explicit user confirmation before rewriting Git history for safety
- **Node.js 18+ Required**: Minimum Node.js version increased from unspecified to 18.0.0
- **git-filter-repo Auto-Detection**: Automatically detects and uses `git-filter-repo` if available (10-100x faster), falls back to `git filter-branch` with warning

### ✨ Added

#### Major Features
- **Rollback System**: New `--rollback` flag to undo last operation
- **Operation History**: New `--history` flag to view past operations (stores last 10)
- **Batch Operations**: Load commit changes from JSON/YAML files with `--batch <file>`
- **Commit Range Support**: New `--range <range>` flag for Git-style ranges (e.g., `HEAD~5..HEAD~2`)
- **Filter by Author**: New `--author <name>` flag to filter commits by author
- **Filter by Message**: New `--grep <pattern>` flag to filter commits by message pattern
- **Date Type Separation**: New `--author-date-only` and `--committer-date-only` flags
- **Export Functionality**: New `--export <file>` flag to save selections to batch files
- **Generate Examples**: New `--generate-example [format]` flag to create sample batch files
- **Force Git Tool**: New `--use-filter-repo` and `--use-filter-branch` flags

#### Utilities
- Added `utils/gitFilterRepo.js` - git-filter-repo integration and detection
- Added `utils/rollback.js` - Operation tracking and rollback functionality
- Added `utils/batchOperations.js` - JSON/YAML batch file operations
- Added `utils/commitRange.js` - Advanced commit selection and filtering

#### Dependencies
- Added `js-yaml@^4.1.0` for YAML batch file support

#### Documentation
- Added `MIGRATION.md` - Comprehensive migration guide from v1.x
- Added `RELEASE_NOTES_v2.0.0.md` - Detailed release notes
- Added `PUBLISH_CHECKLIST.md` - Publishing guidelines
- Added 15+ new usage examples in README
- Added troubleshooting for git-filter-repo installation

### 🔧 Changed
- **Performance**: Up to 100x faster when git-filter-repo is installed
- **CLI Output**: Enhanced with better progress indicators and colored output
- **Error Messages**: More helpful with actionable suggestions
- **Confirmation Flow**: Better summary display before executing changes
- Updated help text with all new options
- Improved validation for all user inputs

### 🐛 Fixed
- Better error handling for edge cases
- Improved cross-platform compatibility
- Enhanced input sanitization
- Fixed various minor bugs

### 📚 Documentation
- Completely updated README with v2.0.0 features
- Added migration guide for v1.x users
- Added comprehensive examples for all new features
- Updated all documentation to reflect breaking changes

---

## [1.2.0] - 27-10-2025

### ✨ Added

#### Major Features
- **Complete Async/Await Migration**: Replaced all callbacks with modern async/await patterns
- **Commander.js Integration**: Professional CLI argument parsing
- **Interactive Mode**: Select specific commits using checkboxes with Inquirer.js
- **Auto Backup**: `--backup` flag creates timestamped backup branches
- **Multiple Date Formats**: Support for ISO 8601, RFC 2822, and Unix timestamps

#### Infrastructure
- Added GitHub Actions CI/CD workflow
- Multi-OS testing (Ubuntu, Windows, macOS)
- Multi-Node version testing (18.x, 20.x, 22.x)
- Automated security audits

#### Dependencies
- Added `commander@^14.0.2` for CLI management
- Added `inquirer@^12.10.0` for interactive prompts
- Updated `execa` to async version

#### Documentation
- Added "What's New in v1.2.0" section to README
- Enhanced examples with interactive mode
- Better date format documentation

### 🔧 Changed
- **Code Architecture**: Complete rewrite with better separation of concerns
- **Error Handling**: Improved with proper async try/catch blocks
- **Argument Parsing**: Professional handling with type validation
- **Code Organization**: Split into well-defined functions
- Simplified main execution flow

### 📚 Documentation
- Added interactive mode guide
- Updated options table
- Added more usage examples
- Enhanced troubleshooting section

### ⚡ Performance
- Better memory management with async operations
- Cleaner promise chains
- Reduced callback nesting

---

## [1.1.0] - 26-10-2025

### ✨ Added

#### Security Features
- **Input Validation**: Comprehensive date and commit hash validation
- **Shell Injection Protection**: Sanitization of all user inputs
- **Safe Command Execution**: Replaced raw shell commands with `execa` library

#### New Features
- **Configurable Editor**: Respects `EDITOR` and `VISUAL` environment variables
- **Editor Flag**: New `--editor <editor>` flag to override editor choice
- **Dry-Run Mode**: New `--dry-run` flag to preview changes without applying
- **Cross-Platform Shell Detection**: Automatic detection for Windows/Unix/macOS

#### Utilities
- Added `utils/validateDate.js` - Date validation and sanitization
- Added `utils/getEditor.js` - Editor and shell configuration

#### Dependencies
- Added `execa@^9.5.2` for safe command execution

### 🔧 Changed
- **Shell Commands**: All exec calls replaced with execa for security
- **Error Messages**: More actionable with helpful suggestions
- **CLI Arguments**: Better validation for numeric inputs
- **Help Text**: Updated with new flags and better examples

### 🐛 Fixed
- Cross-platform compatibility issues
- Windows path handling
- Editor detection on different platforms

### 📚 Documentation
- Added comprehensive troubleshooting section (5 common issues)
- Added FAQ section (3 key questions)
- Updated prerequisites with clearer requirements
- Enhanced examples with new features
- Better date format documentation
- Added force push warnings

---

## [1.0.4] - 25-10-2025

### 🐛 Fixed
- **Exit Code**: Fixed incorrect exit code (now exits with 0 on success, 1 on error)
- **Error Variables**: Fixed error variable reference mismatches in `utils/rewriteGitHistory.js`
  - Line 16: Changed `error` to `err`
  - Line 25: Changed `error` to `err`
- **Typo**: Fixed "Numer" to "Number" in help text
- **Test Compatibility**: Fixed cross-platform test issues
  - Windows temp path handling
  - Editor command casing

### 🔧 Changed
- Updated all dependencies to latest compatible versions:
  - chalk: 5.2.0 → 5.6.2
  - figlet: 1.5.2 → 1.9.3
  - ora: 6.1.2 → 6.3.1
  - @babel/core: 7.20.12 → 7.28.5
  - @babel/register: 7.18.9 → 7.28.3
  - chai: 4.3.7 → 4.5.0
  - chai-as-promised: 7.1.1 → 7.1.2
  - mocha: 10.2.0 → 10.8.2

### 🧪 Tests
- Fixed test compatibility for Windows
- Updated temp directory creation to use cross-platform paths
- All tests passing (6 passing, 1 skipped)

---

## [1.0.3] - 20-02-2023

### 🔧 Changed
- Minor bug fixes and improvements
- Dependency updates
- Documentation refinements

---

## [1.0.2] - 19-02-2023

### 🐛 Fixed
- Fixed issues with commit date parsing
- Improved error handling
- Better cross-platform support

---

## [1.0.1] - 18-02-2023

### 🐛 Fixed
- Fixed npm package installation issues
- Corrected file paths in package.json
- Updated documentation

---

## [1.0.0] - 18-02-2023

### 🎉 Initial Release

#### Features
- Basic commit date modification
- Support for modifying last N commits
- Support for modifying all commits with `--all` flag
- Debug mode with `--debug` flag
- Customizable chunk limits with `--limit` flag
- Git filter-branch based implementation
- Figlet ASCII art signature
- Colored terminal output with Chalk
- Interactive editor-based date modification

#### CLI Options
- `-c, --commits <number>` - Number of commits to modify (default: 5)
- `-l, --limit <number>` - Chunk size (default: 20)
- `-d, --debug` - Debug mode
- `-a, --all` - Modify all commits
- `-h, --help` - Display help

#### Dependencies
- `chalk@^5.2.0` - Terminal colors
- `figlet@^1.5.2` - ASCII art
- `ora@^6.1.2` - Spinners
- `readline@^1.3.0` - User input
- `tempfile@^4.0.0` - Temporary files

#### Documentation
- README with installation instructions
- Usage examples
- Code of Conduct
- MIT License

---

## Version Comparison Matrix

| Feature | v1.0.0 | v1.0.4 | v1.1.0 | v1.2.0 | v2.0.0 |
|---------|--------|--------|--------|--------|--------|
| Basic commit modification | ✅ | ✅ | ✅ | ✅ | ✅ |
| Multiple commits | ✅ | ✅ | ✅ | ✅ | ✅ |
| All commits mode | ✅ | ✅ | ✅ | ✅ | ✅ |
| Debug mode | ✅ | ✅ | ✅ | ✅ | ✅ |
| Correct exit codes | ❌ | ✅ | ✅ | ✅ | ✅ |
| Input validation | ❌ | ❌ | ✅ | ✅ | ✅ |
| Configurable editor | ❌ | ❌ | ✅ | ✅ | ✅ |
| Dry-run mode | ❌ | ❌ | ✅ | ✅ | ✅ |
| Interactive mode | ❌ | ❌ | ❌ | ✅ | ✅ |
| Backup branches | ❌ | ❌ | ❌ | ✅ | ✅ |
| Async/await | ❌ | ❌ | ❌ | ✅ | ✅ |
| Commander.js | ❌ | ❌ | ❌ | ✅ | ✅ |
| Confirmation prompt | ❌ | ❌ | ❌ | ❌ | ✅ |
| Rollback system | ❌ | ❌ | ❌ | ❌ | ✅ |
| Batch operations | ❌ | ❌ | ❌ | ❌ | ✅ |
| Commit ranges | ❌ | ❌ | ❌ | ❌ | ✅ |
| Advanced filters | ❌ | ❌ | ❌ | ❌ | ✅ |
| git-filter-repo | ❌ | ❌ | ❌ | ❌ | ✅ |
| Node.js requirement | Any | Any | Any | 18+ | 18+ |

---

## Migration Guides

### Migrating to v2.0.0
See [MIGRATION.md](MIGRATION.md) for detailed instructions.

**Key Changes:**
- Node.js 18+ required
- Confirmation prompt added
- Install git-filter-repo for best performance

### Migrating to v1.2.0
**Key Changes:**
- New interactive mode available
- Backup branches recommended
- Better async patterns

### Migrating to v1.1.0
**Key Changes:**
- Set EDITOR environment variable or use --editor flag
- Use --dry-run to preview changes
- Security improvements automatic

### Migrating to v1.0.4
**Key Changes:**
- No breaking changes
- Automatic dependency updates
- Bug fixes applied

---

## Upgrade Recommendations

### From v1.x to v2.0.0
- **RECOMMENDED**: Review [MIGRATION.md](MIGRATION.md) first
- **REQUIRED**: Upgrade Node.js to 18+
- **OPTIONAL**: Install git-filter-repo for performance
- **TEST**: Try in non-production repository first

### From v1.0.x to v1.1.0+
- **RECOMMENDED**: Start using --backup flag
- **RECOMMENDED**: Try --dry-run before applying changes
- **RECOMMENDED**: Use --interactive mode for better control

---

## Release Schedule

| Version | Release Date | Type | Status |
|---------|--------------|------|--------|
| 1.0.0 | 18-02-2023 | Initial | Deprecated |
| 1.0.1 | 18-02-2023 | Patch | Deprecated |
| 1.0.2 | 19-02-2023 | Patch | Deprecated |
| 1.0.3 | 20-02-2023 | Patch | Deprecated |
| 1.0.4 | 25-10-2025 | Patch | Supported |
| 1.1.0 | 26-10-2025 | Minor | Supported |
| 1.2.0 | 27-10-2025 | Minor | Supported |
| **2.0.0** | **30-10-2025** | **Major** | **Latest** |

---

## Support Policy

### Current Support Status

- **v2.0.0**: ✅ Actively supported
- **v1.2.0**: ✅ Security updates only
- **v1.1.0**: ✅ Security updates only
- **v1.0.4**: ⚠️ Limited support
- **v1.0.0-1.0.3**: ❌ No longer supported

### Maintenance Windows

- **v2.x**: Full support, regular updates
- **v1.2.x**: Security patches until v2.1.0 release
- **v1.1.x**: Security patches until v2.1.0 release
- **v1.0.x**: Upgrade recommended

---

## Statistics

### Development Timeline

```
v1.0.0 (Feb 2023)  → Initial release
   ↓
v1.0.1-1.0.3       → Bug fixes (Feb 2023)
   ↓
v1.0.4 (Oct 2025)  → Hotfix after 2 years
   ↓
v1.1.0 (Oct 2025)  → Security & features (+1 day)
   ↓
v1.2.0 (Oct 2025)  → Modernization (+1 day)
   ↓
v2.0.0 (Oct 2025)  → Major release (+1 day)
```

### Code Growth

| Version | Lines of Code | Files | CLI Options |
|---------|---------------|-------|-------------|
| v1.0.0 | ~300 | 5 | 5 |
| v1.0.4 | ~350 | 5 | 5 |
| v1.1.0 | ~500 | 7 | 8 |
| v1.2.0 | ~700 | 8 | 11 |
| v2.0.0 | ~1,500 | 12 | 23 |

### Feature Growth

| Version | Features | Breaking Changes |
|---------|----------|------------------|
| v1.0.0 | 6 | N/A (initial) |
| v1.0.4 | 6 | 0 |
| v1.1.0 | 10 (+4) | 0 |
| v1.2.0 | 14 (+4) | 0 |
| v2.0.0 | 26 (+12) | 3 |

---

## Links

- **Repository**: https://github.com/Yourstruggle11/git-time-travel
- **npm Package**: https://www.npmjs.com/package/git-time-travel
- **Issues**: https://github.com/Yourstruggle11/git-time-travel/issues
- **Discussions**: https://github.com/Yourstruggle11/git-time-travel/discussions

---

## Credits

**Created by:** Souvik Sen

**Contributors:** See [GitHub Contributors](https://github.com/Yourstruggle11/git-time-travel/graphs/contributors)

**License:** MIT

---

**Last Updated:** 30-10-2025
**Current Version:** 2.0.0
