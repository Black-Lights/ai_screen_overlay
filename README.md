# AI Screen Overlay

A powerful AI-powered screen capture and chat overlay application built with Electron, React, and TypeScript. Capture any area of your screen and analyze it with multiple AI providers including OpenAI GPT-4o, Claude 3.7 Sonnet, and DeepSeek with full markdown rendering, intelligent chat management, and professional conversation features.

## ✨ Key Features

### 🖼️ **Advanced Screen Capture**
- **Global Hotkey**: Press `Ctrl+Shift+S` anywhere to capture screen areas
- **Smart Workflow**: Screenshots added to current chat with option to move to new chat
- **Precision Selection**: Click and drag to select exact regions
- **Instant Processing**: Captured images automatically attached to conversations
- **High Quality**: Full resolution capture with PNG encoding
- **Seamless Integration**: Continue conversations with visual context

### 🤖 **Multi-LLM Intelligence**
- **OpenAI Models**: GPT-4o, GPT-4o Mini, GPT-4 Turbo with vision capabilities
- **Claude Models**: Sonnet 3.7, Sonnet 4, Opus 4.1, Opus 4, Haiku 3.5 (official model IDs)
- **DeepSeek Models**: Chat and Reasoner with cost-effective analysis
- **Model Selection**: Dropdown menus with pricing information for each model
- **Provider Status**: Real-time API key validation and connection testing
- **Smart Identity**: Each AI model maintains proper identity and capabilities

### 💬 **Professional Chat Experience**
- **Intelligent Naming**: Auto-generated chat titles based on conversation content
- **Manual Renaming**: Inline editing with keyboard shortcuts (Enter/Escape)
- **Smart Numbering**: Automatic "Chat 1", "Chat 2", "Screen Capture Chat 1" naming
- **Markdown Rendering**: Full markdown support with syntax-highlighted code blocks
- **Text Selection**: Select and copy any message content with one click
- **Provider Attribution**: Each response shows AI provider and specific model used
- **Chat History**: Persistent conversations with SQLite storage
- **Context Awareness**: Full conversation context maintained across messages
- **Move Screenshots**: Transfer screenshots between chats with one click

### 🎨 **Modern Interface & Theming**
- **Dynamic Theme System**: Three distinct themes - Glassmorphism (Default), Dark, and Light
- **Adaptive Opacity**: Automatically adjusts transparency based on system theme detection
- **Glassmorphism Design**: Beautiful translucent overlay with blur effects and gradient backgrounds
- **Smart Background Detection**: System theme awareness for optimal visibility
- **Always On Top**: Stays accessible while you work on other applications
- **Drag & Resize**: Repositionable and resizable overlay window with smooth interactions
- **Enhanced Contrast**: Optimized readability on any background with text shadows and adaptive styling
- **Responsive Layout**: Adapts to different screen sizes and orientations
- **Professional Styling**: Multiple theme options with purple gradients and smooth animations
- **Settings Panel**: Modern modal interface with theme selection and opacity controls

## 📋 System Requirements

## 📋 System Requirements

- **Operating System**: Windows, macOS, or Linux
- **Node.js**: Version 16 or higher
- **npm**: Version 8 or higher (comes with Node.js)
- **Python**: Version 3.7 or higher (for AI processing)
- **Git**: For version control and repository management
- **Display Resolution**: Minimum 1024x768 (HD or higher recommended)
- **GPU**: Hardware acceleration support recommended for smooth overlay rendering
- **Memory**: Minimum 4GB RAM (8GB+ recommended for AI processing)
- **System Theme Support**: Windows 10/11, macOS 10.14+, or Linux desktop environments with dark/light theme detection

## � Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Black-Lights/ai_screen_overlay.git
cd ai_screen_overlay

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env  # Add your API keys

# Build and start
npm run build
npm start
```

### API Key Configuration

Edit `.env` file with your API keys:

```env
# OpenAI (GPT-4o, GPT-4o Mini, GPT-4 Turbo)
OPENAI_API_KEY=sk-your-openai-key-here

# Anthropic (Claude models)
CLAUDE_API_KEY=sk-ant-your-claude-key-here

# DeepSeek (Chat and Reasoner)
DEEPSEEK_API_KEY=your-deepseek-key-here
```

**Get API Keys:**
- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Claude**: [console.anthropic.com](https://console.anthropic.com/)
- **DeepSeek**: [platform.deepseek.com](https://platform.deepseek.com/)

## 🎯 How to Use

### Basic Workflow
1. **Launch** the application with `npm start`
2. **Position** the overlay on your preferred screen location
3. **Capture** screen areas with `Ctrl+Shift+S` hotkey
4. **Select** your preferred AI provider and model
5. **Analyze** images with natural language questions
6. **Chat** with full markdown rendering and copy support

### Advanced Features

#### Screen Capture Workflow
- **Smart Integration**: Screenshots added to current chat automatically
- **Move to New Chat**: Option to transfer screenshots to new conversation
- **Global Hotkey**: `Ctrl+Shift+S` works from any application
- **Precision Selection**: Click and drag for exact area capture
- **Multiple Captures**: Add multiple images to same conversation
- **Cancel Support**: Press `Esc` during selection to cancel

#### Intelligent Chat Management
- **Auto-naming**: Chats automatically renamed based on conversation content
- **Manual Renaming**: Inline editing with keyboard shortcuts (Enter/Escape)
- **Smart Numbering**: "Chat 1", "Chat 2", "Screen Capture Chat 1" patterns
- **Chat History**: Persistent storage with full conversation context
- **Multiple Threads**: Create unlimited conversation threads
- **Seamless Navigation**: Switch between chats while maintaining context

#### AI Provider Selection
- **Multi-model Dropdowns**: Choose specific models with pricing information
- **Provider Status**: Real-time API key validation (🟢 Ready, 🔴 Error, ⚠️ Invalid)
- **Connection Testing**: Live API connectivity verification
- **Auto-switching**: Seamlessly switch providers mid-conversation
- **Model Attribution**: Each response shows provider and model used

#### Enhanced Chat Features
- **Markdown Rendering**: Full markdown support with syntax-highlighted code blocks
- **Text Selection**: Select and copy any message content or portions
- **Provider Info**: Each AI response shows provider and model information
- **Rich Formatting**: Proper rendering of tables, lists, code blocks, and links
- **Copy Support**: One-click copying of any message or code block
- **Visual Context**: Screenshots integrated seamlessly into conversation flow

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+S` | Capture screen area and add to current chat |
| `Ctrl+Shift+A` | Toggle overlay visibility |
| `Enter` | Send message / Save chat rename |
| `Shift+Enter` | New line in message |
| `Esc` | Cancel screen capture / Cancel chat rename |
| `Ctrl+C` | Copy selected text |

## 🎯 Usage Guide

### Basic Workflow
1. **Start the app** and configure your AI provider API keys
2. **Create or select a chat** from the sidebar
3. **Take a screenshot** with `Ctrl+Shift+S` - it gets added to your current chat
4. **Ask questions** about the screenshot or continue your conversation
5. **Use "Move to New Chat"** if you want to discuss the screenshot separately

### Chat Management
- **New Chat**: Click the "+" button to create a new conversation
- **Rename Chats**: Click the edit icon next to any chat title
- **Auto-naming**: Chats are automatically renamed based on content after the first AI response
- **Screen Capture Integration**: Screenshots flow seamlessly into your conversations

### AI Provider Setup
- **API Keys**: Add your OpenAI, Claude, and/or DeepSeek API keys in settings
- **Model Selection**: Choose specific models with pricing information displayed
- **Status Monitoring**: Green/red indicators show real-time API connectivity
- **Provider Switching**: Change providers mid-conversation as needed

## � Latest Features (v2.1)

### 🎨 **Advanced Theme System**
- **Multiple Themes**: Choose from Glassmorphism (Default), Dark, and Light themes
- **Adaptive Opacity**: Automatic transparency adjustment based on system theme detection
- **Background Detection Service**: Smart system theme awareness using CSS media queries
- **Dynamic Styling**: Real-time theme switching with optimized opacity for light/dark backgrounds
- **Enhanced Readability**: 95% opacity on light backgrounds, 85% on dark backgrounds for optimal contrast
- **Settings Integration**: Easy theme selection and adaptive opacity toggle in settings panel

### ✨ **Smart Screen Capture Workflow**
- Screenshots are automatically added to your current conversation
- **Move to New Chat** option appears when you want to separate screenshot discussions
- Smart detection of existing conversation context
- Seamless integration without interrupting your workflow

### 🏷️ **Intelligent Chat Management**
- **Auto-naming**: Chats automatically get descriptive titles based on conversation content
- **Manual Renaming**: Click edit icon for inline title editing with keyboard shortcuts
- **Smart Numbering**: "Chat 1", "Chat 2", "Screen Capture Chat 1" patterns for new chats
- **LLM-powered Titles**: AI analyzes conversation to generate meaningful names

### 🎛️ **Enhanced UI/UX**
- **Multi-model Selection**: Dropdowns for each provider with pricing information
- **Real-time Status**: Live API connectivity testing with color-coded indicators
- **Provider Attribution**: Every AI response shows which provider and model was used
- **Enhanced Contrast**: Improved text readability with shadows and backdrop blur
- **Professional Styling**: Polished dark theme with purple gradients

### 🔧 **Technical Improvements**
- **React Closure Fixes**: Robust event handling with useRef patterns
- **Database Enhancements**: Full API key management with automatic synchronization
- **Error Handling**: Comprehensive error management and user feedback
- **Performance**: Optimized bundle size and loading times
- **State Management**: Improved React state synchronization

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Electron 27 + Node.js + better-sqlite3
- **Build**: Webpack 5 + TypeScript compiler
- **Styling**: Tailwind CSS + Custom glassmorphism
- **Markdown**: ReactMarkdown + Prism syntax highlighting

### Project Structure
```
src/
├── main/                    # Electron main process
│   ├── main.ts             # Application entry point with global shortcuts
│   ├── database.ts         # SQLite database service with chat management
│   ├── screen-capture.ts   # Advanced screen capture with area selection
│   ├── ipc-handlers.ts     # IPC communication handlers for all features
│   └── preload.ts          # Secure preload script with event handling
├── renderer/               # React frontend
│   ├── App.tsx             # Main app with chat state management and screen capture
│   ├── components/         # UI components
│   │   ├── Overlay.tsx     # Main overlay container with window controls
│   │   ├── ChatInterface.tsx # Chat UI with markdown and move-to-new-chat
│   │   ├── ChatHistory.tsx # Sidebar with inline renaming functionality
│   │   ├── LLMSelector.tsx # AI provider selection with status indicators
│   │   └── Settings.tsx    # Configuration panel with API key management
│   ├── services/           # Frontend services
│   │   └── chatNamingService.ts # LLM-based automatic chat title generation
│   └── styles/             # CSS and styling with glassmorphism
├── shared/                 # Shared TypeScript definitions
│   ├── types.ts           # Complete type definitions for all features
│   └── models.ts          # AI model configurations with pricing
└── types/                  # Global type declarations
```

### Database Schema
```sql
-- Chat conversations with intelligent naming
CREATE TABLE chats (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages with full AI attribution and image support
CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  chat_id INTEGER REFERENCES chats(id),
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  image_path TEXT,
  provider TEXT,
  model TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Application settings with API key management
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```
```
src/
├── main/                    # Electron main process
│   ├── main.ts             # Application entry point
│   ├── database.ts         # SQLite database service
│   ├── screen-capture.ts   # Screen capture implementation
│   ├── ipc-handlers.ts     # IPC communication handlers
│   └── preload.ts          # Preload script for security
├── renderer/               # React frontend
│   ├── App.tsx             # Main application component
│   ├── components/         # UI components
│   │   ├── Overlay.tsx     # Main overlay container
│   │   ├── ChatInterface.tsx # Chat UI with markdown
│   │   ├── LLMSelector.tsx # AI provider selection
│   │   └── Settings.tsx    # Configuration panel
│   ├── services/           # Frontend services
│   └── styles/             # CSS and styling
├── shared/                 # Shared TypeScript definitions
│   ├── types.ts           # Type definitions
│   └── models.ts          # AI model configurations
└── types/                  # Global type declarations
```

### Database Schema
```sql
-- Chat conversations
CREATE TABLE chats (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages with AI attribution
CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  chat_id INTEGER REFERENCES chats(id),
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  image_path TEXT,
  provider TEXT,
  model TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Application settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

## 🔧 Development

### Development Setup
```bash
# Clone repository
git clone https://github.com/your-username/ai-screen-overlay.git
cd ai-screen-overlay

# Install Node.js dependencies
npm install

# Install Python dependencies (for AI processing)
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
nano .env  # Add your API keys

# Start development mode
npm run dev          # Starts both Electron and React dev servers
npm run dev:react    # React development server only
npm run dev:electron # Electron development mode only
```

### Dependency Files
- **`node-requirements.txt`**: Complete list of Node.js packages with versions
- **`requirements.txt`**: Python packages for AI processing and image handling
- **`package.json`**: NPM configuration with all development and runtime dependencies

### Build Commands
```bash
npm run build           # Build everything
npm run build:react     # Build React frontend
npm run build:electron  # Build Electron main process
npm run clean           # Clean build artifacts
```

### Code Quality
```bash
npm run lint           # ESLint code checking
npm run type-check     # TypeScript validation
npm test              # Run test suite
```

## 📦 Distribution & Deployment

### Quick Distribution

**For end users**: Download ready-to-run apps:
- **Linux**: `AI-Screen-Overlay-1.0.0-x86_64.AppImage` - Works on all distributions
- **Windows**: `AI-Screen-Overlay-Setup-1.0.0.exe` - Standard installer
- **macOS**: `AI-Screen-Overlay-1.0.0.dmg` - Drag to Applications

### Building Distributions

Create installable applications for all platforms:

```bash
# Setup app icons (first time only)
./setup-icons.sh

# Build for all platforms (Windows, macOS, Linux)
./build-dist.sh all

# Build for specific platforms
./build-dist.sh win      # Windows installer + portable
./build-dist.sh mac      # macOS DMG + ZIP
./build-dist.sh linux    # AppImage, DEB, RPM, Snap
./build-dist.sh portable # Portable versions only
```

**📋 See [DISTRIBUTION.md](DISTRIBUTION.md) for complete distribution guide**

### Distribution Formats Created

#### **Windows** 🪟
- **`.exe` Installer (NSIS)**: Full installer with Start Menu shortcuts
- **`.exe` Portable**: No installation required, run directly
- **Features**: Desktop shortcuts, auto-updater, uninstaller

#### **macOS** 🍎  
- **`.dmg` Installer**: Standard macOS app installer
- **Universal Binary**: Supports both Intel (x64) and Apple Silicon (arm64)
- **Features**: Code signing ready, Gatekeeper compatible

#### **Linux** 🐧
- **`.AppImage`**: Portable, runs on any Linux distribution ⭐ **Recommended**
- **`.deb` Package**: For Debian/Ubuntu systems (apt install)
- **`.rpm` Package**: For RedHat/Fedora systems (yum/dnf install) 
- **`.snap` Package**: Universal Linux package (snap install)

### Adding New Features

#### New AI Provider
1. Add provider config to `src/shared/models.ts`
2. Implement API client in `src/main/ipc-handlers.ts`
3. Update UI selectors in `src/renderer/components/LLMSelector.tsx`
4. Add API key handling in settings

#### New UI Components
1. Create component in `src/renderer/components/`
2. Add styling in `src/renderer/styles/globals.css`
3. Import and use in parent components
4. Update TypeScript types if needed

## 🐛 Troubleshooting

### Common Issues

#### Screen Capture Not Working
```bash
# Check X11 permissions
xhost +local:
echo $DISPLAY

# Install missing dependencies
sudo apt-get install libxtst6 libxrandr2 libx11-6
```

#### API Connection Errors
- **Check API Keys**: Verify keys are valid and have credits
- **Network Issues**: Test internet connection
- **Rate Limits**: Wait if rate limited by provider
- **Model Availability**: Some models have regional restrictions

#### Build Failures
```bash
# Clear caches and reinstall
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

#### Performance Issues
```bash
# Monitor resource usage
htop
# Check database size
du -h data/chats.db
# Clean temporary files
npm run clean
```

### Debug Mode
```bash
# Enable verbose logging
DEBUG=* npm start

# Check Electron logs
tail -f electron-debug.log
```

## 📊 Performance

### Optimizations
- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Vendor and main bundles separated
- **Database Indexing**: Optimized queries for chat history
- **Memory Management**: Automatic cleanup of temporary images
- **Bundle Size**: Optimized to ~950KB total

### Benchmarks
- **Startup Time**: ~2-3 seconds cold start
- **Screen Capture**: <500ms from hotkey to selection
- **AI Response**: Varies by provider (2-10 seconds)
- **Memory Usage**: ~150-200MB RAM

## 🔒 Privacy & Security

### Data Protection
- **Local Storage**: All data remains on your machine
- **No Telemetry**: Zero tracking or analytics
- **Secure APIs**: Direct HTTPS communication with AI providers
- **Temporary Files**: Screenshots auto-deleted after processing

### Security Practices
- **Environment Variables**: API keys stored in .env file
- **IPC Security**: Secure communication between processes
- **Input Validation**: All user inputs sanitized
- **Error Handling**: Graceful error recovery without data loss

## 🚀 Roadmap

### Upcoming Features
- [ ] **Multi-language Support**: Internationalization
- [ ] **Plugin System**: Custom AI provider plugins
- [ ] **Export Options**: PDF, HTML conversation export
- [ ] **Voice Input**: Speech-to-text integration
- [ ] **Cloud Sync**: Optional cloud backup (encrypted)
- [x] **Themes**: Advanced theme system with Glassmorphism, Dark, and Light options
- [ ] **Annotations**: Draw on captured images
- [ ] **OCR**: Text extraction from images

### Performance Improvements
- [ ] **Streaming Responses**: Real-time AI response streaming
- [ ] **Caching**: Intelligent response caching
- [ ] **Compression**: Database and image optimization
- [ ] **Background Processing**: Non-blocking AI operations

## 📄 License

MIT License - see [LICENSE](LICENSE) file for full details.

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Ensure accessibility compliance
- Test on multiple Linux distributions

## 💖 Acknowledgments

Special thanks to:
- **Electron Team** - Cross-platform desktop framework
- **React Community** - Frontend framework and ecosystem
- **AI Providers** - OpenAI, Anthropic, and DeepSeek for powerful APIs
- **Open Source** - All the amazing libraries that make this possible

---

**🌟 Star this repository if you find it helpful!**

Built with ❤️ for the Linux community by [Black-Lights](https://github.com/Black-Lights)
