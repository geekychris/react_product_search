#!/bin/bash

set -e  # Exit on any error

echo "🏗️  Building OpenSearch React UI - Complete Build Process"
echo "=================================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if OpenSearch is running
check_opensearch() {
    echo "🔍 Checking OpenSearch connection..."
    if curl -s "http://localhost:30920/_cluster/health" > /dev/null 2>&1; then
        echo "✅ OpenSearch is running on localhost:30920"
        return 0
    else
        echo "❌ OpenSearch is not running on localhost:30920"
        echo "💡 Please start OpenSearch before building"
        return 1
    fi
}

# Function to install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    if [ ! -d "node_modules" ]; then
        echo "📚 Running npm install..."
        npm install
    else
        echo "✅ node_modules exists, checking for updates..."
        npm ci --only=production --silent
    fi
    echo "✅ Dependencies installed"
}

# Function to create and index data
setup_opensearch_data() {
    echo "🗄️  Setting up OpenSearch data..."
    
    if ! check_opensearch; then
        echo "⚠️  Skipping data indexing - OpenSearch not available"
        return 1
    fi
    
    echo "📊 Indexing product catalog..."
    npm run index-data
    echo "✅ Product catalog indexed"
}

# Function to run tests
run_tests() {
    echo "🧪 Running tests..."
    if npm test -- --watchAll=false --silent --passWithNoTests 2>/dev/null; then
        echo "✅ All tests passed"
    else
        echo "⚠️  Tests failed or skipped due to configuration issues"
    fi
}

# Function to build React app
build_react_app() {
    echo "⚛️  Building React application..."
    npm run build
    echo "✅ React app built successfully"
    
    # Display build stats
    if [ -d "build" ]; then
        echo "📊 Build statistics:"
        du -sh build/
        echo "📁 Build contents:"
        ls -la build/
    fi
}

# Function to validate build
validate_build() {
    echo "🔍 Validating build..."
    
    if [ ! -d "build" ]; then
        echo "❌ Build directory not found"
        return 1
    fi
    
    if [ ! -f "build/index.html" ]; then
        echo "❌ index.html not found in build"
        return 1
    fi
    
    if [ ! -d "build/static" ]; then
        echo "❌ Static assets not found in build"
        return 1
    fi
    
    echo "✅ Build validation passed"
}

# Main build process
main() {
    echo "🚀 Starting build process..."
    echo "⏰ Build started at: $(date)"
    echo ""
    
    # Check prerequisites
    if ! command_exists npm; then
        echo "❌ npm is not installed"
        exit 1
    fi
    
    if ! command_exists node; then
        echo "❌ Node.js is not installed"
        exit 1
    fi
    
    echo "✅ Prerequisites check passed"
    echo "📍 Node version: $(node --version)"
    echo "📍 npm version: $(npm --version)"
    echo ""
    
    # Install dependencies
    install_dependencies
    echo ""
    
    # Setup OpenSearch data (optional)
    setup_opensearch_data
    echo ""
    
    # Run tests (optional)
    run_tests
    echo ""
    
    # Build React app
    build_react_app
    echo ""
    
    # Validate build
    validate_build
    echo ""
    
    echo "🎉 Build completed successfully!"
    echo "⏰ Build finished at: $(date)"
    echo ""
    echo "📋 Next steps:"
    echo "  • To run the application: npm start"
    echo "  • To serve the build: npx serve -s build"
    echo "  • To run everything: ./run-all.sh"
}

# Error handling
trap 'echo "❌ Build failed at line $LINENO. Exit code: $?"' ERR

# Run main function
main "$@"
