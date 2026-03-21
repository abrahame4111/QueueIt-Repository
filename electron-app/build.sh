#!/bin/bash

# Build script for Hostel Music Queue Admin Desktop App

echo "🚀 Building Hostel Music Queue Admin Desktop App"
echo "================================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Detect OS
OS="$(uname -s)"
case "${OS}" in
    Linux*)     PLATFORM=linux;;
    Darwin*)    PLATFORM=mac;;
    CYGWIN*|MINGW*|MSYS*)    PLATFORM=win;;
    *)          PLATFORM="unknown"
esac

echo "🖥️  Detected platform: $PLATFORM"
echo ""

if [ "$PLATFORM" = "unknown" ]; then
    echo "❌ Could not detect platform"
    echo "Please run one of these manually:"
    echo "  - npm run build:win   (Windows)"
    echo "  - npm run build:mac   (macOS)"
    echo "  - npm run build:linux (Linux)"
    exit 1
fi

echo "🔨 Building installer for $PLATFORM..."
echo ""

if [ "$PLATFORM" = "linux" ]; then
    npm run build:linux
elif [ "$PLATFORM" = "mac" ]; then
    npm run build:mac
elif [ "$PLATFORM" = "win" ]; then
    npm run build:win
fi

echo ""
echo "✅ Build complete!"
echo ""
echo "📂 Your installer is in the 'dist/' folder:"
ls -lh dist/ | grep -E '\.(exe|dmg|AppImage|deb)$'
echo ""
echo "🎉 You can now distribute this installer to hostel staff!"
