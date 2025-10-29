# Migration Guide: v1.x → v2.0.0

This guide will help you migrate from git-time-travel v1.x to v2.0.0.

## 🚨 Breaking Changes

### 1. **Confirmation Prompt Required (NEW)**

**What changed:** v2.0.0 now requires explicit confirmation before rewriting Git history.

**v1.x behavior:**
```bash
git-time-travel -c 5
# Immediately starts rewriting after you close the editor
```

**v2.0.0 behavior:**
```bash
git-time-travel -c 5
# Shows summary and asks: "⚠️  This will rewrite Git history. Continue? (y/N)"
```

**Impact:** **MEDIUM** - Your automated scripts will need to handle the confirmation prompt

**Migration:**
- For interactive use: No change needed (just press 'y')
- For scripts: Use `--dry-run` first, or expect the prompt in your automation

---

### 2. **git-filter-repo Recommended (Automatic Fallback)**

**What changed:** v2.0.0 automatically detects and uses `git-filter-repo` if available, falling back to `git filter-branch` if not.

**v1.x behavior:**
- Always used `git filter-branch` (deprecated since Git 2.24)

**v2.0.0 behavior:**
- Checks for `git-filter-repo` availability
- Uses it automatically for 10-100x better performance
- Falls back gracefully to `git filter-branch` with warning

**Impact:** **LOW** - Fully backward compatible, but you'll see performance improvements if you install git-filter-repo

**Migration:**
```bash
# Optional but recommended: Install git-filter-repo for better performance

# macOS
brew install git-filter-repo

# Ubuntu/Debian
apt-get install git-filter-repo

# Windows (via pip)
pip install git-filter-repo

# Or continue using legacy mode (no action needed)
```

---

### 3. **Node.js >= 18.0.0 Required**

**What changed:** Minimum Node.js version increased from unspecified to 18.0.0

**Impact:** **MEDIUM** - Users on Node.js < 18 must upgrade

**Migration:**
```bash
# Check your Node.js version
node --version

# If < 18, upgrade:
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or download from nodejs.org
```

---

## ✨ New Features (Non-Breaking)

### 4. **Rollback Functionality**

```bash
# Make changes
git-time-travel --backup -c 5

# Oops, made a mistake? Rollback!
git-time-travel --rollback

# View operation history
git-time-travel --history
```

### 5. **Batch Operations from Files**

Create a JSON or YAML file:

```json
[
  {
    "hash": "abc123",
    "date": "2023-02-20T15:30:00+05:30",
    "message": "Optional description"
  },
  {
    "hash": "def456",
    "date": "2023-02-21T10:00:00+05:30"
  }
]
```

Then run:
```bash
git-time-travel --batch changes.json
```

Generate example file:
```bash
git-time-travel --generate-example json
git-time-travel --generate-example yaml
```

### 6. **Commit Range Support**

```bash
# Modify specific range
git-time-travel --range HEAD~10..HEAD~5

# Filter by author
git-time-travel --author "John Doe"

# Filter by message pattern
git-time-travel --grep "fix:"
```

### 7. **Author/Committer Date Separation**

```bash
# Only change author dates
git-time-travel --author-date-only -c 5

# Only change committer dates
git-time-travel --committer-date-only -c 5
```

### 8. **Export Current Selection**

```bash
# Export to batch file for later use
git-time-travel -c 10 --export my-changes.json --dry-run
```

---

## 📊 Command Comparison

| Feature | v1.2.0 | v2.0.0 |
|---------|--------|--------|
| Basic usage | ✅ `git-time-travel -c 5` | ✅ `git-time-travel -c 5` (+ confirmation) |
| Interactive mode | ✅ `--interactive` | ✅ `--interactive` |
| Backup branch | ✅ `--backup` | ✅ `--backup` |
| Dry run | ✅ `--dry-run` | ✅ `--dry-run` |
| Rollback | ❌ | ✅ `--rollback` |
| Batch operations | ❌ | ✅ `--batch file.json` |
| Commit ranges | ❌ | ✅ `--range HEAD~5..HEAD~2` |
| Filter by author | ❌ | ✅ `--author "name"` |
| Filter by message | ❌ | ✅ `--grep "pattern"` |
| Date type selection | ❌ | ✅ `--author-date-only` / `--committer-date-only` |
| Export | ❌ | ✅ `--export file.json` |
| History | ❌ | ✅ `--history` |
| git-filter-repo | ❌ | ✅ Auto-detect + `--use-filter-repo` |

---

## 🔄 Migration Checklist

### For Individual Users

- [ ] Check Node.js version (`node --version`)
- [ ] Upgrade to Node.js 18+ if needed
- [ ] (Optional) Install `git-filter-repo` for better performance
- [ ] Test v2.0.0 with `--dry-run` first
- [ ] Use `--backup` for safety during migration period
- [ ] Familiarize with new `--rollback` command

### For Scripts/Automation

- [ ] Update scripts to handle confirmation prompt (or use with `-y` equivalent)
- [ ] Consider using `--batch` mode for programmatic usage
- [ ] Add `--backup` to all automated operations
- [ ] Test scripts in staging environment first
- [ ] Update CI/CD pipelines if they use git-time-travel

### For Teams

- [ ] Announce upgrade timeline to team
- [ ] Ensure all team members have Node.js 18+
- [ ] Consider standardizing on `git-filter-repo` installation
- [ ] Update team documentation/runbooks
- [ ] Share this migration guide with team

---

## 🆘 Troubleshooting

### "git-filter-repo not found"

**Solution 1:** Install it (recommended for performance)
```bash
brew install git-filter-repo  # macOS
apt install git-filter-repo    # Ubuntu/Debian
pip install git-filter-repo    # Windows/Others
```

**Solution 2:** Use legacy mode
```bash
git-time-travel --use-filter-branch -c 5
```

### "Node.js version too old"

```bash
# Check version
node --version

# Upgrade using nvm
nvm install 18
nvm use 18

# Or download from nodejs.org
```

### "Confirmation prompt breaks my script"

**Workaround:** Use `--dry-run` to preview without prompts, then decide whether to proceed interactively.

**Future:** Non-interactive mode may be added in future versions. Open an issue if needed.

### "I want to go back to v1.x"

```bash
# Downgrade
npm install -g git-time-travel@1.2.0

# Or use npx for one-off
npx git-time-travel@1.2.0 -c 5
```

---

## 📝 Example Migration Scenarios

### Scenario 1: Simple Interactive Use

**v1.2.0:**
```bash
git-time-travel -c 5
# Edit dates
# Done
```

**v2.0.0:**
```bash
git-time-travel -c 5
# Edit dates
# Confirm: y
# Done
```

**Change:** Just press 'y' at the confirmation prompt.

---

### Scenario 2: Scripted Batch Operations

**v1.2.0:**
```bash
# Multiple manual runs
git-time-travel -c 1  # Edit commit 1
git-time-travel -c 1  # Edit commit 2
# ...
```

**v2.0.0:**
```bash
# Create batch file once
cat > batch.json <<EOF
[
  {"hash": "abc123", "date": "2023-02-20T15:30:00+05:30"},
  {"hash": "def456", "date": "2023-02-21T10:00:00+05:30"}
]
EOF

# Run once with confirmation
git-time-travel --batch batch.json --backup
```

**Benefit:** More efficient, reproducible, and safer with `--backup`.

---

### Scenario 3: Team Collaboration

**v1.2.0:**
```bash
# Each team member does manually
git-time-travel -c 10
# Risk: No easy rollback
```

**v2.0.0:**
```bash
# Lead creates batch file
git-time-travel -c 10 --export team-changes.json --dry-run

# Share team-changes.json with team

# Each member applies same changes
git-time-travel --batch team-changes.json --backup

# If issues occur
git-time-travel --rollback
```

**Benefit:** Consistent changes across team with easy rollback.

---

## 🎯 Recommended Upgrade Path

1. Test in development
   - Install v2.0.0 in dev environment
   - Test with `--dry-run` and `--backup`
   - Verify rollback works

2. Pilot with small team
   - Have 1-2 team members use v2.0.0
   - Gather feedback
   - Update scripts if needed

3. Full rollout
   - Announce upgrade to all users
   - Share this migration guide
   - Provide support for issues

4. Leverage new features
   - Start using batch operations
   - Implement rollback in workflows
   - Explore commit range filters

---

## 📚 Additional Resources

- [v2.0.0 Release Notes](https://github.com/Yourstruggle11/git-time-travel/releases/tag/v2.0.0)
- [Full README](README.md)
- [Report Issues](https://github.com/Yourstruggle11/git-time-travel/issues)
- [git-filter-repo Documentation](https://github.com/newren/git-filter-repo)

---

## 💬 Need Help?

- **Issues:** https://github.com/Yourstruggle11/git-time-travel/issues
- **Discussions:** https://github.com/Yourstruggle11/git-time-travel/discussions

---

**Last Updated:** 30-10-2025
**Version:** 2.0.0
