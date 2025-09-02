# 🚀 AI Screen Overlay - Distribution Guide

## Quick Start for End Users

### 🐧 Linux (Recommended - Universal)
1. **Download**: `AI-Screen-Overlay-1.0.0-x86_64.AppImage` (100MB)
2. **Make Executable**: `chmod +x AI-Screen-Overlay-1.0.0-x86_64.AppImage`
3. **Run**: `./AI-Screen-Overlay-1.0.0-x86_64.AppImage`

**No installation required!** Works on Ubuntu, Debian, Fedora, Arch, openSUSE, etc.

### 🪟 Windows  
1. **Download**: `AI-Screen-Overlay-Setup-1.0.0.exe` (installer)
   - OR `AI-Screen-Overlay-1.0.0-win32-x64.exe` (portable)
2. **Install**: Run the installer and follow the wizard
   - OR run portable version directly
3. **Launch**: Use desktop shortcut or Start Menu

### 🍎 macOS
1. **Download**: `AI-Screen-Overlay-1.0.0-arm64.dmg` (Apple Silicon) or `-x64.dmg` (Intel)
2. **Install**: Open DMG and drag to Applications folder
3. **Launch**: Find in Applications or use Spotlight search

## 🛠️ Developer Distribution Setup

### Prerequisites
```bash
# Install dependencies
npm install

# Install system packages for icons (Ubuntu/Debian)
sudo apt-get install imagemagick

# For macOS icon creation (macOS only)
xcode-select --install
```

### Build Process

#### 1. Setup App Icons
```bash
# Create placeholder icons for testing
./setup-icons.sh

# Or add your custom icons to build/ directory:
# - build/icon.png (512x512 for Linux)
# - build/icon.ico (multi-size for Windows)  
# - build/icon.icns (multi-size for macOS)
```

#### 2. Build All Platforms
```bash
# Build for all platforms at once
./build-dist.sh all

# Or build specific platforms
./build-dist.sh linux    # AppImage, DEB, RPM, Snap
./build-dist.sh win      # NSIS installer + portable
./build-dist.sh mac      # DMG + ZIP
./build-dist.sh portable # Portable versions only
```

#### 3. Manual Build Commands
```bash
# Individual platform builds
npm run dist:linux   # All Linux formats
npm run dist:win     # Windows installer + portable
npm run dist:mac     # macOS DMG + ZIP

# Specific formats
npx electron-builder --linux AppImage
npx electron-builder --win nsis portable
npx electron-builder --mac dmg
```

### Distribution Types

#### Linux Distributions
| Format | Size | Install Method | Use Case |
|--------|------|----------------|----------|
| **AppImage** | ~100MB | `chmod +x && run` | **Recommended** - Universal, portable |
| **DEB** | ~60MB | `sudo dpkg -i` | Ubuntu, Debian systems |
| **RPM** | ~60MB | `sudo rpm -i` | Fedora, RHEL, openSUSE |  
| **Snap** | ~100MB | `sudo snap install` | Ubuntu Store |
| **TAR.GZ** | ~60MB | Extract & run | Manual installation |

#### Windows Distributions
| Format | Size | Install Method | Use Case |
|--------|------|----------------|----------|
| **NSIS Installer** | ~80MB | Run installer | **Recommended** - Full installation |
| **Portable EXE** | ~100MB | Run directly | No installation needed |
| **ZIP Archive** | ~80MB | Extract & run | Manual portable |

#### macOS Distributions  
| Format | Size | Install Method | Use Case |
|--------|------|----------------|----------|
| **DMG** | ~80MB | Drag to Applications | **Recommended** - Standard macOS |
| **ZIP** | ~80MB | Extract to Applications | Direct installation |

## 📁 File Structure After Build

```
release/
├── AI-Screen-Overlay-1.0.0-x86_64.AppImage      # Linux portable
├── AI-Screen-Overlay-Setup-1.0.0.exe             # Windows installer
├── AI-Screen-Overlay-1.0.0-win32-x64-portable.exe # Windows portable
├── ai-screen-overlay_1.0.0_amd64.deb            # Debian package
├── ai-screen-overlay-1.0.0.x86_64.rpm           # RedHat package
├── AI-Screen-Overlay-1.0.0-arm64.dmg            # macOS Apple Silicon
├── AI-Screen-Overlay-1.0.0-x64.dmg              # macOS Intel
├── AI-Screen-Overlay-1.0.0-mac.zip              # macOS portable
└── latest-*.yml                                   # Update metadata
```

## 🔄 Auto-Updates Setup

The apps are configured for auto-updates using electron-updater. To enable:

1. **Host releases** on GitHub Releases, S3, or your server
2. **Update metadata** files (`latest-*.yml`) point to download URLs
3. **Code signing** (optional but recommended for production)

## 📋 Distribution Checklist

### Before Release
- [ ] Update version in `package.json`
- [ ] Test app functionality locally (`npm start`)
- [ ] Create/update app icons in `build/` directory
- [ ] Update changelog and documentation  
- [ ] Test build process (`./build-dist.sh all`)

### Release Process
- [ ] Build all distributions
- [ ] Test AppImage on different Linux distributions
- [ ] Test Windows installer and portable versions
- [ ] Test macOS DMG on both Intel and Apple Silicon
- [ ] Upload to distribution platforms
- [ ] Update download links in documentation

### Distribution Platforms
- **GitHub Releases**: Automatic with electron-builder
- **Snap Store**: `snapcraft push ai-screen-overlay_*.snap`
- **Microsoft Store**: Use `electron-builder --win appx`
- **Mac App Store**: Use `electron-builder --mac mas`

## 🚨 Troubleshooting

### Build Issues
```bash
# Clean build cache
npm run clean
rm -rf node_modules package-lock.json
npm install

# Rebuild native modules
npm rebuild
```

### Permission Issues (Linux)
```bash
# Fix AppImage permissions
chmod +x *.AppImage

# Fix build permissions  
sudo chown -R $USER:$USER release/
```

### Missing Icons
```bash
# Recreate placeholder icons
./setup-icons.sh

# Check icon files exist
ls -la build/icon.*
```

## 📊 Build Stats

Current build sizes (v1.0.0):
- **Linux AppImage**: ~100MB (includes runtime)
- **Windows Installer**: ~80MB 
- **Windows Portable**: ~100MB
- **macOS DMG**: ~80MB
- **DEB/RPM**: ~60MB (smaller, uses system libraries)

Build time: ~2-5 minutes depending on platform and internet speed.
