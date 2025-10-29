# 🚀 Git Time Travel v2.0.0 - Major Release

## Breaking Changes & Powerful New Features

We're excited to announce **v2.0.0** - a major release that brings significant improvements, better performance, and powerful new features while maintaining the core functionality you love!

---

## ⚠️ Breaking Changes

### 1. **Confirmation Required Before Rewriting History**

For your safety, v2.0.0 now requires explicit confirmation before modifying Git history.

**Before (v1.x):**
```bash
git-time-travel -c 5
# Immediately rewrites after closing editor
```

**Now (v2.0.0):**
```bash
git-time-travel -c 5
# Shows summary and prompts: "⚠️ This will rewrite Git history. Continue? (y/N)"
```

This prevents accidental history rewrites and gives you a chance to review changes.

---

### 2. **Node.js 18+ Required**

Minimum Node.js version is now **18.0.0** to support modern JavaScript features.

**Check your version:**
```bash
node --version
```

**Upgrade if needed:**
```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or download from nodejs.org
```

---

### 3. **Auto-Detection of git-filter-repo**

v2.0.0 automatically detects and uses `git-filter-repo` (modern, recommended tool) if available, providing **10-100x better performance**!

**Falls back gracefully** to `git filter-branch` if not installed.

**To get the performance boost:**
```bash
# macOS
brew install git-filter-repo

# Ubuntu/Debian
sudo apt-get install git-filter-repo

# Fedora
sudo dnf install git-filter-repo

# Windows (via pip)
pip install git-filter-repo
```

---

## ✨ New Features

### 🔄 **Rollback System**

Made a mistake? Now you can undo it!

```bash
# Rollback last operation
git-time-travel --rollback

# View operation history
git-time-travel --history
```

**Features:**
- Automatic operation tracking
- Easy recovery with backup branches
- History of last 10 operations
- Safe rollback with confirmation

---

### 📝 **Batch Operations from Files**

Manage multiple commit date changes with JSON or YAML files!

```bash
# Generate example template
git-time-travel --generate-example json

# Apply changes from file
git-time-travel --batch changes.json --backup
```

**Example batch file (JSON):**
```json
[
  {
    "hash": "abc123def456",
    "date": "2023-02-20T15:30:00+05:30",
    "message": "Updated feature X date"
  },
  {
    "hash": "789ghi012jkl",
    "date": "2023-02-21T10:00:00+05:30",
    "message": "Fixed bug Y date"
  }
]
```

**Benefits:**
- Reproducible operations
- Team collaboration
- Audit trail
- Version control for changes

---

### 🎯 **Commit Range Support**

Target specific commit ranges with Git-style syntax!

```bash
# Modify specific range
git-time-travel --range HEAD~10..HEAD~5

# Preview first
git-time-travel --range HEAD~10..HEAD~5 --dry-run
```

---

### 🔍 **Advanced Filtering**

Filter commits by various criteria:

```bash
# By author
git-time-travel --author "John Doe" --backup

# By commit message pattern
git-time-travel --grep "fix:" --interactive

# Combine filters
git-time-travel --author "Jane" --grep "feature" --dry-run
```

---

### 👤 **Separate Author/Committer Dates**

Fine-grained control over date modification:

```bash
# Only change author dates
git-time-travel --author-date-only -c 5

# Only change committer dates
git-time-travel --committer-date-only -c 5
```

**Use cases:**
- Preserve commit attribution
- Adjust only authoring time
- Maintain committer timestamps

---

### 📤 **Export & Reuse**

Save your commit selections for later use:

```bash
# Export current selection
git-time-travel -c 10 --export my-changes.json --dry-run

# Apply exported changes later
git-time-travel --batch my-changes.json --backup
```

**Perfect for:**
- Sharing configurations with team
- Documenting changes
- Reproducible workflows

---

### ⚡ **Force Specific Git Tool**

Control which Git tool to use:

```bash
# Force git-filter-repo (fast)
git-time-travel --use-filter-repo -c 100

# Force legacy git filter-branch
git-time-travel --use-filter-branch -c 5
```

---

## 🛠️ Technical Improvements

### **Performance**
- **10-100x faster** with git-filter-repo
- Optimized for large repositories
- Better memory management

### **Code Quality**
- 4 new utility modules
- Better separation of concerns
- Enhanced error handling
- Comprehensive input validation

### **Developer Experience**
- 12 new CLI options
- Better progress indicators
- Clear error messages
- Helpful installation guidance

---

## 📚 Documentation

### **New Documentation**
- **[MIGRATION.md](MIGRATION.md)** - Complete migration guide from v1.x
- **Updated README** - New features and examples
- **Enhanced help text** - All options documented

### **Migration Guide Highlights**
- Step-by-step upgrade instructions
- Troubleshooting section
- Example scenarios
- Command comparison table

---

## 📊 Complete Feature List

### **Core Features (Maintained)**
- ✅ Interactive commit selection
- ✅ Automatic backup branches
- ✅ Dry-run preview mode
- ✅ Multiple date format support
- ✅ Cross-platform compatibility
- ✅ Configurable editor support

### **New in v2.0.0**
- ✅ Rollback last operation
- ✅ Operation history tracking
- ✅ Batch operations (JSON/YAML)
- ✅ Commit range support
- ✅ Filter by author
- ✅ Filter by message pattern
- ✅ Author/Committer date separation
- ✅ Export selections
- ✅ Generate example files
- ✅ git-filter-repo integration
- ✅ Mandatory confirmation prompts
- ✅ Better performance (10-100x)

---

## 🎓 Quick Start Examples

### **Basic Usage (with new confirmation)**
```bash
git-time-travel -c 5 --backup
# Edit dates in editor
# Confirm when prompted
```

### **Safe Workflow with Rollback**
```bash
# Make changes with backup
git-time-travel --backup -c 5

# If something went wrong
git-time-travel --rollback
```

### **Batch Operation Workflow**
```bash
# 1. Generate template
git-time-travel --generate-example json

# 2. Edit git-time-travel-example.json with your changes

# 3. Preview
git-time-travel --batch git-time-travel-example.json --dry-run

# 4. Apply
git-time-travel --batch git-time-travel-example.json --backup
```

### **Advanced Filtering**
```bash
# Modify only bug fixes from specific author
git-time-travel --author "John" --grep "fix" --interactive --backup
```

### **Team Collaboration**
```bash
# Lead exports changes
git-time-travel -c 10 --export team-changes.json --dry-run

# Share team-changes.json with team

# Team members apply
git-time-travel --batch team-changes.json --backup
```

---

## 🔄 Upgrade Instructions

### **1. Check Prerequisites**
```bash
# Check Node.js version
node --version  # Should be 18.0.0 or higher
```

### **2. Upgrade Package**
```bash
npm install -g git-time-travel@2.0.0
```

### **3. (Optional) Install git-filter-repo for Performance**
```bash
# Choose your platform
brew install git-filter-repo              # macOS
sudo apt-get install git-filter-repo      # Ubuntu/Debian
sudo dnf install git-filter-repo          # Fedora
pip install git-filter-repo               # Windows/Others
```

### **4. Test in Safe Environment**
```bash
# Try in a test repository first
git-time-travel --dry-run -c 3

# Use --backup for safety
git-time-travel --backup -c 3
```

### **5. Read Migration Guide**
See [MIGRATION.md](MIGRATION.md) for detailed upgrade instructions and troubleshooting.

---

## 🆘 Getting Help

### **New to v2.0.0?**
- Read the [Migration Guide](MIGRATION.md)
- Check out [new examples in README](README.md#examples)
- Try `git-time-travel --help`

### **Issues or Questions?**
- **Report bugs:** https://github.com/Yourstruggle11/git-time-travel/issues
- **Discussions:** https://github.com/Yourstruggle11/git-time-travel/discussions
- **Documentation:** https://github.com/Yourstruggle11/git-time-travel#readme

### **Want to Downgrade?**
```bash
npm install -g git-time-travel@1.2.0
```

---

## 📈 Comparison: v1.2.0 vs v2.0.0

| Feature | v1.2.0 | v2.0.0 |
|---------|--------|--------|
| Basic commit modification | ✅ | ✅ |
| Interactive mode | ✅ | ✅ |
| Backup branches | ✅ | ✅ |
| Dry-run preview | ✅ | ✅ |
| Confirmation prompt | ❌ | ✅ |
| Rollback capability | ❌ | ✅ |
| Operation history | ❌ | ✅ |
| Batch operations | ❌ | ✅ |
| Commit ranges | ❌ | ✅ |
| Filter by author | ❌ | ✅ |
| Filter by message | ❌ | ✅ |
| Date type separation | ❌ | ✅ |
| Export functionality | ❌ | ✅ |
| git-filter-repo support | ❌ | ✅ |
| Performance boost | 1x | 10-100x* |

\* With git-filter-repo installed

---

## 🙏 Acknowledgments

Special thanks to:
- The git-filter-repo project for the modern Git rewriting tool
- All contributors and users who provided feedback
- Everyone who reported issues and suggested improvements

---

## 🎯 What's Next?

We're already planning exciting features for future releases:
- Web-based UI for commit editing
- Git hooks integration
- Plugin system for extensibility
- More export formats
- Cloud backup options

**Stay tuned!**

---

## 📝 Full Changelog

### Added
- ✨ Rollback system with operation history (`--rollback`, `--history`)
- ✨ Batch operations from JSON/YAML files (`--batch`)
- ✨ Generate example batch files (`--generate-example`)
- ✨ Commit range support (`--range`)
- ✨ Filter by author (`--author`)
- ✨ Filter by message pattern (`--grep`)
- ✨ Separate author/committer date modification (`--author-date-only`, `--committer-date-only`)
- ✨ Export selections to files (`--export`)
- ✨ git-filter-repo integration with auto-detection
- ✨ Mandatory confirmation before history rewriting
- ✨ Force specific Git tool flags (`--use-filter-repo`, `--use-filter-branch`)
- 📚 Comprehensive migration guide (MIGRATION.md)
- 📚 Enhanced documentation with 15+ new examples

### Changed
- ⚠️ **BREAKING:** Now requires explicit confirmation before rewriting history
- ⚠️ **BREAKING:** Minimum Node.js version increased to 18.0.0
- ⚠️ **BREAKING:** Auto-detects git-filter-repo (falls back gracefully)
- ⚡ Significant performance improvements (10-100x with git-filter-repo)
- 📖 Updated README with v2.0.0 features
- 🎨 Enhanced CLI output and user feedback

### Fixed
- 🐛 Better error handling throughout
- 🐛 Improved input validation
- 🐛 Enhanced cross-platform compatibility

---

## 💡 Pro Tips

1. **Always use `--backup`** when experimenting
2. **Try `--dry-run` first** to preview changes
3. **Install git-filter-repo** for massive performance gains
4. **Use batch files** for reproducible operations
5. **Check `--history`** to see what you've done
6. **Export your work** to share with team

---

## 📦 Installation

```bash
# Install or upgrade
npm install -g git-time-travel@2.0.0

# Verify installation
git-time-travel --version
# Should output: 2.0.0
```

---

## 🎉 Thank You!

Thank you for using Git Time Travel! We hope v2.0.0 makes your Git workflow even better.

**Happy Time Traveling! 🚀⏰**

---

**Release Date:** Oct 30, 2025
**Version:** 2.0.0
**Type:** Major Release (Breaking Changes)
**Stability:** Stable
**Upgrade Recommended:** Yes (with migration planning)

---

**Links:**
- 📦 [npm package](https://www.npmjs.com/package/git-time-travel)
- 🔗 [GitHub Repository](https://github.com/Yourstruggle11/git-time-travel)
- 📖 [Documentation](https://github.com/Yourstruggle11/git-time-travel#readme)
- 📝 [Migration Guide](https://github.com/Yourstruggle11/git-time-travel/blob/main/MIGRATION.md)
- 🐛 [Report Issues](https://github.com/Yourstruggle11/git-time-travel/issues)

---

**Made with ❤️ by Souvik Sen**
