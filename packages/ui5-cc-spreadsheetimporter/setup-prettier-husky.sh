#!/bin/bash

# Setup script for Prettier and Husky configuration
echo "Setting up Prettier and Husky for UI5 Spreadsheet Importer..."

# Make sure we're in the package directory
cd "$(dirname "$0")"
PACKAGE_DIR=$(pwd)
REPO_ROOT="../../"

echo "Package directory: $PACKAGE_DIR"
echo "Repository root: $REPO_ROOT"

# Install dependencies in the package
echo "Installing dependencies..."
npm install

# Initialize husky from the repository root
echo "Initializing Husky from repository root..."
cd "$REPO_ROOT"
npx husky init

# Make hook files executable
echo "Making hook files executable..."
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg

# Go back to package directory and run prettier
cd "$PACKAGE_DIR"
echo "Running Prettier on all files..."
npm run prettier

echo "✅ Setup complete!"
echo ""
echo "🎉 Your project is now configured with:"
echo "   • Prettier with custom configuration"
echo "   • Husky git hooks (configured for monorepo structure)"
echo "   • Commitlint for conventional commits"
echo ""
echo "Git hooks will now:"
echo "   • Run UI5 lint on pre-commit"
echo "   • Run Prettier on staged files"
echo "   • Validate commit messages (feat:, fix:, etc.)"
echo ""
echo "Note: Hooks are configured at the repository root level to work with the monorepo structure."
echo ""
echo "Try making a commit with: git commit -m 'feat: add prettier configuration'"
