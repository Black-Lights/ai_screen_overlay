# Ubuntu Installation Guide

## 📋 Installation Options for Ubuntu

### ✅ Option 1: DEB Package (Recommended)
```bash
# Download from GitHub releases or use local file
sudo dpkg -i "AI-Screen-Overlay-1.0.1-amd64.deb"

# If dependencies are missing:
sudo apt-get install -f

# Launch from applications menu or terminal:
ai-screen-overlay
```

### ✅ Option 2: AppImage (Portable)
```bash
# Make executable and run
chmod +x "AI-Screen-Overlay-1.0.1-x86_64.AppImage"

# Run with sandbox fix:
./"AI-Screen-Overlay-1.0.1-x86_64.AppImage" --no-sandbox
```

### ✅ Option 3: Snap (Sandboxed)
```bash
# Install the snap
sudo snap install "AI-Screen-Overlay-1.0.1-amd64.snap" --dangerous

# Connect network permissions (if needed):
sudo snap connect ai-screen-overlay:network
sudo snap connect ai-screen-overlay:network-bind
```

### ✅ Option 4: TAR.GZ (Manual)
```bash
# Extract and run
tar -xzf "AI-Screen-Overlay-1.0.1-x64.tar.gz"
cd "AI-Screen-Overlay-1.0.1"
./ai-screen-overlay
```

## 🔧 Troubleshooting

### AppImage Sandbox Error
If you see "SUID sandbox helper binary" error:
```bash
./"AI-Screen-Overlay-1.0.1-x86_64.AppImage" --no-sandbox
```

### Snap Network Issues
If API keys can't be verified in snap version:
```bash
# Connect additional network permissions
sudo snap connect ai-screen-overlay:network-bind
sudo snap connect ai-screen-overlay:process-control

# Or use DEB package instead (recommended)
```

### Permission Issues
```bash
# Fix file permissions if needed
chmod +x ai-screen-overlay
```

## 🎯 Recommended Installation Method

**For Ubuntu users**: Use the **DEB package** - it has the best compatibility and no sandboxing restrictions that might interfere with API verification or screen capture functionality.
