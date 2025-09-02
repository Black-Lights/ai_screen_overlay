#!/bin/bash

# AI Screen Overlay - Distribution Builder
# Builds distributable packages for Windows, macOS, and Linux

# Handle clean-all option
if [ "$1" = "clean-all" ]; then
    echo "🧹 Performing full clean (including icons and release packages)..."
    rm -rf dist build release node_modules/.cache
    echo "✅ Full clean completed!"
    exit 0
fi

echo "🚀 Building AI Screen Overlay distributions..."

# Clean previous builds (preserve icons and existing release packages)
echo "🧹 Cleaning previous builds..."
# Only clean dist and cache, preserve build/ icons and release/ packages
rm -rf dist node_modules/.cache
# Create directories if they don't exist
mkdir -p build release

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Create app icons if they don't exist
echo "🎨 Checking app icons..."
if [ ! -f "build/icon.png" ]; then
    echo "⚠️  Warning: build/icon.png not found. Using placeholder."
    # Create a simple placeholder icon (you should replace with actual icons)
    mkdir -p build
    # This would need actual icon files - see instructions below
fi

# Build distributions
echo "📱 Building distributions..."

if [ "$1" = "all" ] || [ "$1" = "" ]; then
    echo "Building for all platforms..."
    npm run dist:all
elif [ "$1" = "win" ]; then
    echo "Building for Windows..."
    npm run dist:win
elif [ "$1" = "mac" ]; then
    echo "Building for macOS..."
    npm run dist:mac
elif [ "$1" = "linux" ]; then
    echo "Building for Linux..."
    npm run dist:linux
elif [ "$1" = "portable" ]; then
    echo "Building portable versions..."
    npm run dist:portable
else
    echo "❌ Unknown platform: $1"
    echo "Usage: ./build-dist.sh [all|win|mac|linux|portable|clean-all]"
    echo ""
    echo "Options:"
    echo "  all       - Build for all platforms"
    echo "  win       - Build for Windows only"
    echo "  mac       - Build for macOS only"
    echo "  linux     - Build for Linux only"
    echo "  portable  - Build portable versions only"
    echo "  clean-all - Full clean (removes icons and release packages)"
    exit 1
fi

echo "✅ Distribution build completed!"
echo "📁 Output files are in the 'release/' directory"
echo ""
echo "Distribution types created:"
echo "  Windows: .exe installer, .exe portable"
echo "  macOS: .dmg installer, .zip portable"
echo "  Linux: .AppImage portable, .deb/.rpm packages, .snap"
echo ""
echo "🎉 Ready to distribute!"
