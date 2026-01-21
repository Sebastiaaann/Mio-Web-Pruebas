---
name: git
description: Use when working with Git - creating branches, commits, merging, rebasing, resolving conflicts, and following Git best practices for version control
---

# Git Skill

## When to Use
- Creating new branches for features, fixes, or releases
- Committing changes with proper messages
- Merging and rebasing branches
- Resolving merge conflicts
- Managing remote repositories
- Following Git flow or trunk-based development

## Branch Naming Conventions

Use descriptive, lowercase names with hyphens:

```
feature/   - New features           → feature/user-authentication
fix/       - Bug fixes              → fix/login-validation-error
hotfix/    - Urgent production fix  → hotfix/critical-security-patch
refactor/  - Code refactoring       → refactor/api-layer-cleanup
docs/      - Documentation only     → docs/update-readme
chore/     - Maintenance tasks      → chore/update-dependencies
release/   - Release preparation    → release/v1.2.0
```

## Common Git Commands

### Branch Operations

```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Create branch from specific commit/branch
git checkout -b feature/new-feature origin/main

# List all branches
git branch -a

# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name

# Rename current branch
git branch -m new-name
```

### Commit Best Practices

```bash
# Stage specific files
git add path/to/file.vue

# Stage all changes
git add .

# Commit with message (imperative mood)
git commit -m "Add user authentication flow"

# Amend last commit (before push)
git commit --amend -m "Updated message"

# Amend without changing message
git commit --amend --no-edit
```

### Commit Message Format

Follow Conventional Commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Adding/fixing tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(auth): add OAuth2 login support"
git commit -m "fix(dashboard): resolve data refresh issue"
git commit -m "refactor(api): simplify error handling"
git commit -m "docs: update installation guide"
```

### Merging & Rebasing

```bash
# Merge branch into current
git merge feature/branch-name

# Merge with no fast-forward (preserves history)
git merge --no-ff feature/branch-name

# Rebase current branch onto main
git rebase main

# Interactive rebase (squash, edit commits)
git rebase -i HEAD~3

# Continue rebase after resolving conflicts
git rebase --continue

# Abort rebase
git rebase --abort
```

### Stashing Changes

```bash
# Stash current changes
git stash

# Stash with message
git stash save "WIP: dashboard refactor"

# List stashes
git stash list

# Apply most recent stash
git stash pop

# Apply specific stash
git stash apply stash@{2}

# Drop stash
git stash drop stash@{0}
```

### Remote Operations

```bash
# Fetch all remotes
git fetch --all

# Pull with rebase (cleaner history)
git pull --rebase origin main

# Push new branch to remote
git push -u origin feature/new-feature

# Force push (use carefully!)
git push --force-with-lease

# Sync fork with upstream
git fetch upstream
git rebase upstream/main
git push origin main
```

### Viewing History

```bash
# View commit log (compact)
git log --oneline -n 10

# View log with graph
git log --oneline --graph --all

# View changes in commit
git show <commit-hash>

# View file history
git log --follow -p path/to/file

# View who changed what
git blame path/to/file
```

### Undoing Changes

```bash
# Discard changes in working directory
git checkout -- path/to/file

# Unstage file (keep changes)
git reset HEAD path/to/file

# Undo last commit (keep changes staged)
git reset --soft HEAD~1

# Undo last commit (keep changes unstaged)
git reset HEAD~1

# Undo last commit (discard changes) ⚠️
git reset --hard HEAD~1

# Revert a commit (creates new commit)
git revert <commit-hash>
```

### Conflict Resolution

When conflicts occur:

1. **Identify conflicted files:**
   ```bash
   git status
   ```

2. **Open and resolve conflicts:**
   Look for conflict markers:
   ```
   <<<<<<< HEAD
   Your changes
   =======
   Incoming changes
   >>>>>>> branch-name
   ```

3. **After resolving:**
   ```bash
   git add <resolved-file>
   git rebase --continue  # if rebasing
   # or
   git commit             # if merging
   ```

### Tags

```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Create lightweight tag
git tag v1.0.0

# Push tags to remote
git push origin --tags

# Push specific tag
git push origin v1.0.0

# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin --delete v1.0.0
```

## Git Flow Workflow

```
main (production)
  │
  └── develop (integration)
        │
        ├── feature/user-auth
        ├── feature/dashboard
        └── release/v1.2.0
              │
              └── hotfix/critical-fix
```

**Workflow:**
1. Create `feature/` branch from `develop`
2. Work on feature, commit often
3. Merge feature into `develop`
4. Create `release/` branch when ready
5. Test and fix in release branch
6. Merge release to `main` AND `develop`
7. Tag the release on `main`

## Trunk-Based Development (Alternative)

- Work directly on `main` or short-lived feature branches
- Feature flags for incomplete features
- Continuous integration and deployment
- Simpler, faster, but requires good CI/CD

## Best Practices

1. **Commit frequently** with small, focused changes
2. **Write clear commit messages** in imperative mood
3. **Pull before push** to avoid conflicts
4. **Never force push** to shared branches
5. **Use `.gitignore`** to exclude build artifacts
6. **Review diffs** before committing
7. **Keep branches short-lived** (< 1 week ideally)
8. **Delete merged branches** to keep repo clean

## Common .gitignore Patterns

```gitignore
# Dependencies
node_modules/
vendor/

# Build output
dist/
build/
.output/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Cache
.cache/
.nuxt/
.next/
```
