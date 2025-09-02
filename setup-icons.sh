#!/bin/bash

# Quick Icon Setup Script for AI Screen Overlay
# This script helps create basic placeholder icons for testing distributions

echo "🎨 Setting up app icons for distribution..."

# Create build directory if it doesn't exist
mkdir -p build

# Create a simple SVG icon as base (you can replace this with your actual design)
cat > build/icon.svg << 'EOF'
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="80" fill="url(#grad)"/>
  <circle cx="256" cy="200" r="60" fill="white" opacity="0.9"/>
  <rect x="176" y="280" width="160" height="120" rx="20" fill="white" opacity="0.8"/>
  <text x="256" y="470" text-anchor="middle" fill="white" font-family="Arial" font-size="32" font-weight="bold">AI</text>
</svg>
EOF

echo "✅ Created base SVG icon"

# Check if ImageMagick is available for conversion
if command -v convert &> /dev/null; then
    echo "🔄 Converting SVG to PNG formats..."
    
    # Create PNG icon for Linux
    convert -background transparent build/icon.svg -resize 512x512 build/icon.png
    echo "✅ Created icon.png (Linux)"
    
    # Create ICO for Windows (requires multiple sizes)
    convert -background transparent build/icon.svg \
        \( -clone 0 -resize 16x16 \) \
        \( -clone 0 -resize 32x32 \) \
        \( -clone 0 -resize 48x48 \) \
        \( -clone 0 -resize 64x64 \) \
        \( -clone 0 -resize 128x128 \) \
        \( -clone 0 -resize 256x256 \) \
        -delete 0 build/icon.ico
    echo "✅ Created icon.ico (Windows)"
    
else
    echo "⚠️  ImageMagick not found. Please install it to auto-convert icons:"
    echo "   Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "   macOS: brew install imagemagick"
    echo "   Or manually convert build/icon.svg to required formats"
fi

# Check if iconutil is available for macOS ICNS creation
if command -v iconutil &> /dev/null; then
    echo "🍎 Creating macOS ICNS icon..."
    
    # Create iconset directory
    mkdir -p build/icon.iconset
    
    # Generate all required sizes for macOS
    for size in 16 32 64 128 256 512 1024; do
        convert -background transparent build/icon.svg -resize ${size}x${size} build/icon.iconset/icon_${size}x${size}.png
        if [ $size -le 512 ]; then
            # Create @2x versions for retina displays
            double=$((size * 2))
            convert -background transparent build/icon.svg -resize ${double}x${double} build/icon.iconset/icon_${size}x${size}@2x.png
        fi
    done
    
    # Convert to ICNS
    iconutil -c icns build/icon.iconset
    echo "✅ Created icon.icns (macOS)"
    
    # Clean up
    rm -rf build/icon.iconset
else
    echo "⚠️  iconutil not found (macOS only tool)"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "   Please install Xcode command line tools: xcode-select --install"
    fi
fi

echo ""
echo "🎯 Icon setup complete!"
echo "📁 Icons created in build/ directory:"
ls -la build/icon.*

echo ""
echo "🚀 Ready to build distributions!"
echo "   Run: ./build-dist.sh all"
