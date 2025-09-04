#!/bin/bash

set -e  # Exit on any error

echo "🏗️🚀 Build and Run OpenSearch React UI - Complete Pipeline"
echo "=========================================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo "✅ $service_name is ready!"
            return 0
        fi
        
        echo "   Attempt $attempt/$max_attempts - waiting for $service_name..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name failed to start within expected time"
    return 1
}

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "🧹 Cleaning up services..."
    
    # Kill proxy server if we started it
    if [ -f ".proxy.pid" ]; then
        local proxy_pid=$(cat .proxy.pid)
        echo "🔗 Stopping proxy server (PID: $proxy_pid)..."
        kill $proxy_pid 2>/dev/null
        rm -f .proxy.pid
    fi
    
    # Kill production server if running
    if [ -f ".serve.pid" ]; then
        local serve_pid=$(cat .serve.pid)
        echo "⚛️  Stopping production server (PID: $serve_pid)..."
        kill $serve_pid 2>/dev/null
        rm -f .serve.pid
    fi
    
    echo "✅ Cleanup complete"
    exit 0
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help, -h          Show this help message"
    echo "  --dev               Build and run in development mode"
    echo "  --prod              Build and run in production mode (default)"
    echo "  --build-only        Only build, don't run"
    echo "  --serve-port PORT   Specify port for production server (default: 3000)"
    echo ""
    echo "This script will:"
    echo "  1. Run the complete build process"
    echo "  2. Start all required services"
    echo "  3. Serve the application (dev or prod mode)"
    echo ""
    echo "Press Ctrl+C to stop all services"
}

# Function to run the complete build
run_build() {
    echo "🏗️  Phase 1: Building Application"
    echo "================================="
    
    if [ -f "./build-all.sh" ]; then
        echo "🚀 Running complete build process..."
        ./build-all.sh
    else
        echo "❌ build-all.sh not found, running basic build..."
        npm run build
    fi
    
    echo "✅ Build phase completed"
    echo ""
}

# Function to start proxy server
start_proxy_server() {
    echo "🔗 Starting proxy server..."
    
    if port_in_use 4000; then
        echo "✅ Proxy server is already running on port 4000"
        return 0
    fi
    
    echo "🚀 Starting proxy server on port 4000..."
    npm run server &
    local proxy_pid=$!
    
    # Wait for proxy server to be ready
    if wait_for_service "http://localhost:4000/healthz" "Proxy Server"; then
        echo "✅ Proxy server started successfully (PID: $proxy_pid)"
        echo $proxy_pid > .proxy.pid
        return 0
    else
        echo "❌ Failed to start proxy server"
        kill $proxy_pid 2>/dev/null
        return 1
    fi
}

# Function to run in development mode
run_development() {
    echo "⚛️  Phase 2: Running in Development Mode"
    echo "========================================"
    
    # Start proxy server
    start_proxy_server
    
    echo ""
    echo "🚀 Starting React development server..."
    echo "💡 This will open your browser automatically"
    echo "📱 Available at http://localhost:3000 (or alternative port)"
    echo ""
    
    # Start React development server
    npm start
}

# Function to run in production mode
run_production() {
    local serve_port=${1:-3000}
    
    echo "⚛️  Phase 2: Running in Production Mode"
    echo "======================================="
    
    # Check if serve is installed
    if ! command_exists serve; then
        echo "📦 Installing serve globally..."
        npm install -g serve
    fi
    
    # Start proxy server
    start_proxy_server
    
    echo ""
    echo "🚀 Starting production server on port $serve_port..."
    
    # Check if port is available
    if port_in_use $serve_port; then
        echo "⚠️  Port $serve_port is in use, trying alternative ports..."
        for port in 3001 3002 3003 5000 8000 8080; do
            if ! port_in_use $port; then
                serve_port=$port
                break
            fi
        done
    fi
    
    echo "📡 Serving build on port $serve_port..."
    serve -s build -l $serve_port &
    local serve_pid=$!
    
    # Wait for production server to be ready
    if wait_for_service "http://localhost:$serve_port" "Production Server"; then
        echo "✅ Production server started successfully (PID: $serve_pid)"
        echo $serve_pid > .serve.pid
        
        echo ""
        echo "🎉 Application is running!"
        echo "========================="
        echo "🌐 Production App:  http://localhost:$serve_port"
        echo "🔗 Proxy Server:    http://localhost:4000"
        echo "📊 Health Check:    http://localhost:4000/healthz"
        echo "🔍 OpenSearch:      http://localhost:30920"
        echo ""
        echo "🛑 Press Ctrl+C to stop all services"
        
        # Keep the script running
        wait
    else
        echo "❌ Failed to start production server"
        kill $serve_pid 2>/dev/null
        return 1
    fi
}

# Main function
main() {
    local mode="prod"
    local serve_port=3000
    local build_only=false
    
    echo "🏗️🚀 Starting build and run pipeline..."
    echo "⏰ Started at: $(date)"
    echo ""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_help
                exit 0
                ;;
            --dev)
                mode="dev"
                shift
                ;;
            --prod)
                mode="prod"
                shift
                ;;
            --build-only)
                build_only=true
                shift
                ;;
            --serve-port)
                serve_port="$2"
                shift 2
                ;;
            *)
                echo "❌ Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Check prerequisites
    if ! command_exists npm; then
        echo "❌ npm is not installed"
        exit 1
    fi
    
    if ! command_exists node; then
        echo "❌ Node.js is not installed"
        exit 1
    fi
    
    if ! command_exists curl; then
        echo "❌ curl is not installed"
        exit 1
    fi
    
    echo "✅ Prerequisites check passed"
    echo "📍 Node version: $(node --version)"
    echo "📍 npm version: $(npm --version)"
    echo "🎯 Mode: $mode"
    if [ "$mode" = "prod" ]; then
        echo "🌐 Port: $serve_port"
    fi
    echo ""
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
        echo ""
    fi
    
    # Run build phase
    run_build
    
    # Exit if build-only mode
    if [ "$build_only" = true ]; then
        echo "🎉 Build completed successfully!"
        echo "💡 To run: ./build-and-run.sh --prod (or --dev)"
        exit 0
    fi
    
    # Run based on mode
    case $mode in
        "dev")
            run_development
            ;;
        "prod")
            run_production $serve_port
            ;;
        *)
            echo "❌ Unknown mode: $mode"
            exit 1
            ;;
    esac
}

# Set up signal handlers for cleanup
trap cleanup INT TERM

# Run main function
main "$@"
