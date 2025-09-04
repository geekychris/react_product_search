#!/bin/bash

echo "🚀 Running OpenSearch React UI - Complete Application Stack"
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

# Function to check OpenSearch
check_opensearch() {
    echo "🔍 Checking OpenSearch..."
    
    if curl -s "http://localhost:30920/_cluster/health" > /dev/null 2>&1; then
        echo "✅ OpenSearch is running on localhost:30920"
        
        # Check if index exists and has data
        local doc_count=$(curl -s "http://localhost:30920/products/_count" | grep -o '"count":[0-9]*' | cut -d':' -f2)
        if [ "$doc_count" -gt 0 ] 2>/dev/null; then
            echo "✅ Product index has $doc_count documents"
        else
            echo "⚠️  Product index is empty or doesn't exist"
            echo "💡 Running data indexing..."
            npm run index-data
        fi
        return 0
    else
        echo "❌ OpenSearch is not running on localhost:30920"
        echo "💡 Please start OpenSearch before running the application"
        echo "   Example: docker run -p 30920:9200 opensearchproject/opensearch:latest"
        return 1
    fi
}

# Function to start the proxy server
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

# Function to start the React development server
start_react_app() {
    echo "⚛️  Starting React development server..."
    
    # Check if React app is already running
    if port_in_use 3000; then
        echo "⚠️  Port 3000 is in use, React app might already be running"
        echo "💡 If you want to restart, please kill the existing process first"
        return 1
    fi
    
    if port_in_use 3001; then
        echo "⚠️  Port 3001 is in use, trying alternative port"
    fi
    
    echo "🚀 Starting React app..."
    echo "💡 This will open your browser automatically"
    echo "📱 React app will be available at:"
    echo "   • http://localhost:3000 (or alternative port)"
    echo "   • Network access available for mobile testing"
    
    # Start React app (this will block)
    npm start
}

# Function to display running services
show_services() {
    echo ""
    echo "🌐 Application Services:"
    echo "========================"
    
    if port_in_use 30920; then
        echo "✅ OpenSearch:     http://localhost:30920"
    else
        echo "❌ OpenSearch:     Not running"
    fi
    
    if port_in_use 4000; then
        echo "✅ Proxy Server:   http://localhost:4000"
        echo "   ├─ Health:      http://localhost:4000/healthz"
        echo "   └─ API:         http://localhost:4000/api"
    else
        echo "❌ Proxy Server:   Not running"
    fi
    
    if port_in_use 3000; then
        echo "✅ React App:      http://localhost:3000"
    elif port_in_use 3001; then
        echo "✅ React App:      http://localhost:3001"
    else
        echo "⏳ React App:      Starting..."
    fi
    
    echo ""
}

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    
    # Kill proxy server if we started it
    if [ -f ".proxy.pid" ]; then
        local proxy_pid=$(cat .proxy.pid)
        echo "🔗 Stopping proxy server (PID: $proxy_pid)..."
        kill $proxy_pid 2>/dev/null
        rm -f .proxy.pid
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
    echo "  --proxy-only        Start only the proxy server"
    echo "  --check-services    Check service status without starting"
    echo ""
    echo "This script will start the complete OpenSearch React UI stack:"
    echo "  1. Verify OpenSearch is running"
    echo "  2. Start the proxy server (if not running)"
    echo "  3. Start the React development server"
    echo ""
    echo "Press Ctrl+C to stop all services"
}

# Main function
main() {
    echo "🚀 Starting complete application stack..."
    echo "⏰ Started at: $(date)"
    echo ""
    
    # Parse arguments
    case "${1:-}" in
        --help|-h)
            show_help
            exit 0
            ;;
        --proxy-only)
            check_opensearch && start_proxy_server
            echo "🔗 Proxy server is running. Press Ctrl+C to stop."
            wait
            exit 0
            ;;
        --check-services)
            show_services
            exit 0
            ;;
    esac
    
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
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi
    
    # Check OpenSearch
    if ! check_opensearch; then
        echo ""
        echo "⚠️  OpenSearch is required but not running"
        echo "   Please start OpenSearch on port 30920 and try again"
        exit 1
    fi
    
    # Start proxy server
    if ! start_proxy_server; then
        echo "❌ Failed to start proxy server"
        exit 1
    fi
    
    # Show current services
    show_services
    
    echo "🎉 Backend services are ready!"
    echo ""
    echo "📋 Next: Starting React development server..."
    echo "💡 The React app will open in your browser automatically"
    echo "🛑 Press Ctrl+C to stop all services"
    echo ""
    
    # Start React app (this will block until user stops it)
    start_react_app
}

# Set up signal handlers for cleanup
trap cleanup INT TERM

# Run main function
main "$@"
