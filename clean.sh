#!/bin/bash

echo "🧹 Cleaning React project for check-in..."

# Remove build artifacts
echo "📦 Removing build artifacts..."
rm -rf build/
rm -rf dist/
rm -rf .next/

# Remove dependency directories
echo "📚 Removing node_modules..."
rm -rf node_modules/
rm -rf .pnp/

# Remove lock files (optional - see note below)
echo "🔒 Removing lock files..."
# rm -rf package-lock.json  # Uncomment if you want to remove this
# rm -rf yarn.lock          # Uncomment if you want to remove this

# Remove test coverage
echo "📊 Removing test coverage..."
rm -rf coverage/

# Remove logs
echo "📋 Removing logs..."
rm -f npm-debug.log*
rm -f yarn-debug.log*
rm -f yarn-error.log*
rm -f lerna-debug.log*

# Remove OS generated files
echo "💻 Removing OS generated files..."
find . -name .DS_Store -type f -delete
rm -rf .vscode/
rm -rf .idea/

# Remove temporary files
echo "⏰ Removing temporary files..."
rm -rf .tmp/
rm -rf .cache/
rm -rf .parcel-cache/

# Remove environment files (be careful with this)
echo "🌍 Removing local environment files..."
rm -f .env.local
rm -f .env.development.local
rm -f .env.test.local
rm -f .env.production.local

# Clean npm cache (optional)
echo "🗄️ Cleaning npm cache..."
npm cache clean --force

echo "✅ Clean complete! Ready for check-in."
echo "💡 Don't forget to run 'npm install' after pulling from version control."
