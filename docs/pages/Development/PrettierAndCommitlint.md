# Prettier & Commit Message Linting

This page documents the code formatting and commit message standards for this project.

---

## Prettier Setup

The project uses a **unified Prettier configuration** managed from the root level that formats the entire project, including all packages.

### Configuration Files

- **`.prettierrc.json`** - Root-level Prettier configuration that applies to the entire project
- **`.prettierignore`** - Specifies which files to ignore during formatting
- **`package.json`** - Contains lint-staged configuration for git hooks

### Prettier Configuration Details

```json
{
  "singleQuote": false,
  "printWidth": 200,
  "endOfLine": "lf",
  "tabWidth": 4,
  "useTabs": true,
  "trailingComma": "none",
  "overrides": [
    {
      "files": ["*.yaml", "*.yml", "*.md", "*.json", "*.xml", "*.properties"],
      "options": {
        "useTabs": false,
        "tabWidth": 2
      }
    }
  ],
  "plugins": ["@prettier/plugin-xml", "prettier-plugin-properties"]
}
```

### Supported File Types

The configuration handles all project file types:

- **JavaScript/TypeScript**: `*.js`, `*.jsx`, `*.ts`, `*.tsx`, `*.d.ts`
- **Markup**: `*.xml`, `*.html`
- **Styles**: `*.css`
- **Data**: `*.json`, `*.yaml`, `*.yml`, `*.properties`
- **Documentation**: `*.md`

### Available Commands

#### Manual Formatting

```bash
# Format all files in the project
npm run prettier

# Check formatting without making changes
npm run prettier:check

# Run lint-staged (used by git hooks)
npm run lint:staged
```

#### Manual Prettier Commands

```bash
# Format entire project
prettier --write .

# Check formatting
prettier --check .

# Format specific file types
prettier --write "**/*.{js,ts,json,xml,yaml,yml,md,css,html,properties}"
```

### Git Integration

#### Pre-commit Hook

The pre-commit hook automatically runs Prettier on all staged files:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "Running lint-staged on all staged files in the repo..."
npx lint-staged --relative
```

#### Lint-staged Configuration

Located in root `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,json,md,yaml,yml,css,html,xml,properties,d.ts}": [
      "prettier --write"
    ]
  }
}
```

### What Gets Ignored

The `.prettierignore` file excludes:

- Build outputs (`/docs/**`, `/webapp/**`, `/dev/**`, `/dist/**`)
- Dependencies (`node_modules`)
- Generated files (`*.gen.d.ts`)
- Binary files (`*.svg`, `*.png`)
- Package lock files

---

## Commit Message Linting

The project enforces [Conventional Commit](https://www.conventionalcommits.org/) format for all commit messages.

### Commit Message Format

```
<type>: <description>

[optional body]

[optional footer(s)]
```

### Allowed Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without functional changes
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system or dependency changes
- **ci**: CI/CD pipeline changes
- **chore**: Maintenance tasks
- **revert**: Reverting previous commits

### Examples

```bash
# Good commit messages
feat: add spreadsheet import validation
fix: resolve memory leak in file parser
docs: update API documentation
style: format code with prettier
refactor: extract utility functions
perf: optimize large file processing
test: add unit tests for upload service
build: update dependencies
ci: add automated testing workflow
chore: update .gitignore

# Bad commit messages
Add new feature
Fixed bug
Update
WIP
asdf
```

### Configuration

Commitlint is configured in `commitlint.config.js`:

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor', 
      'perf', 'test', 'build', 'ci', 'chore', 'revert'
    ]],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100]
  }
};
```

### Git Integration

#### Commit-msg Hook

The commit-msg hook validates commit messages:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Validate commit message format using root level config
echo "Validating commit message..."
npx commitlint --edit $1
```

---

## Workflow

When you commit changes:

1. **Pre-commit**: Prettier automatically formats all staged files
2. **Commit-msg**: Validates that your commit message follows conventional format
3. **Commit succeeds** only if both checks pass

### Troubleshooting

#### Formatting Issues
```bash
# Manually format all files
npm run prettier

# Check what would be formatted
npm run prettier:check
```

#### Commit Message Issues
```bash
# Check your commit message format
echo "feat: your message here" | npx commitlint

# Amend commit message
git commit --amend -m "feat: proper conventional commit message"
```

#### Hook Issues
```bash
# Reinstall hooks
npm run prepare

# Make hooks executable
chmod +x .husky/pre-commit .husky/commit-msg
```

---

## IDE Integration

### VS Code

Install the [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and add to your settings:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  }
}
```

### WebStorm/IntelliJ

1. Go to Settings → Languages & Frameworks → JavaScript → Prettier
2. Check "On 'Reformat Code' action"
3. Check "On save"
4. Set "Run for files" to match your project patterns

---

## Resources

- [Prettier Documentation](https://prettier.io/docs/en/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Commitlint](https://commitlint.js.org/)
- [Husky](https://typicode.github.io/husky/)
- [Lint-staged](https://github.com/okonet/lint-staged) 
