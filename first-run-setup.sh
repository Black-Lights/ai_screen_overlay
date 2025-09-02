#!/bin/bash

# AI Screen Overlay - First Run Setup
# This script handles initial configuration after installation

APP_DIR=""
ENV_FILE=""

# Detect installation type and set paths
if [ -f "./AI Screen Overlay" ] || [ -f "./ai-screen-overlay" ]; then
    # Portable version - current directory
    APP_DIR="."
    ENV_FILE="./.env"
elif [ -d "/opt/AI Screen Overlay" ]; then
    # Linux system installation
    APP_DIR="/opt/AI Screen Overlay"
    ENV_FILE="$HOME/.config/ai-screen-overlay/.env"
    mkdir -p "$HOME/.config/ai-screen-overlay"
elif [ -d "$HOME/Applications/AI Screen Overlay.app" ]; then
    # macOS user installation
    APP_DIR="$HOME/Applications/AI Screen Overlay.app/Contents/Resources"
    ENV_FILE="$HOME/.config/ai-screen-overlay/.env"
    mkdir -p "$HOME/.config/ai-screen-overlay"
elif [ -d "/Applications/AI Screen Overlay.app" ]; then
    # macOS system installation
    APP_DIR="/Applications/AI Screen Overlay.app/Contents/Resources" 
    ENV_FILE="$HOME/.config/ai-screen-overlay/.env"
    mkdir -p "$HOME/.config/ai-screen-overlay"
else
    # Default fallback
    APP_DIR="."
    ENV_FILE="./.env"
fi

echo "🚀 AI Screen Overlay - First Run Setup"
echo "======================================"
echo ""

# Check if .env already exists
if [ -f "$ENV_FILE" ]; then
    echo "✅ Configuration file already exists at: $ENV_FILE"
    echo "   You can edit it manually or use the app's Settings panel"
    echo ""
    echo "🎯 To start the app:"
    if [ -f "./AI Screen Overlay.AppImage" ]; then
        echo "   ./AI\ Screen\ Overlay-*.AppImage"
    elif [ -f "./AI Screen Overlay.exe" ]; then
        echo "   ./AI\ Screen\ Overlay.exe"
    else
        echo "   Launch from your desktop shortcut or application menu"
    fi
    exit 0
fi

echo "📝 Creating configuration file..."

# Copy .env.example to .env
if [ -f "$APP_DIR/.env.example" ]; then
    cp "$APP_DIR/.env.example" "$ENV_FILE"
    echo "✅ Created: $ENV_FILE"
elif [ -f ".env.example" ]; then
    cp ".env.example" "$ENV_FILE"
    echo "✅ Created: $ENV_FILE"
else
    # Create basic .env file
    cat > "$ENV_FILE" << 'EOF'
# AI Screen Overlay - API Configuration
OPENAI_API_KEY=your-openai-api-key-here
CLAUDE_API_KEY=your-anthropic-api-key-here  
DEEPSEEK_API_KEY=your-deepseek-api-key-here
EOF
    echo "✅ Created basic: $ENV_FILE"
fi

echo ""
echo "🔑 IMPORTANT: Add your AI API keys"
echo "   Edit: $ENV_FILE"
echo "   Or use the app's Settings panel after launching"
echo ""
echo "📚 Get API keys from:"
echo "   • OpenAI: https://platform.openai.com/api-keys"
echo "   • Claude: https://console.anthropic.com/"
echo "   • DeepSeek: https://platform.deepseek.com/"
echo ""
echo "🎯 To start the app:"
if [ -f "./AI Screen Overlay.AppImage" ]; then
    echo "   ./AI\ Screen\ Overlay-*.AppImage"
elif [ -f "./AI Screen Overlay.exe" ]; then
    echo "   ./AI\ Screen\ Overlay.exe"
else
    echo "   Launch from your desktop shortcut or application menu"
fi
echo ""
echo "📖 For help, see: README.md or visit the GitHub repository"
