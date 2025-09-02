# AI Screen Overlay

A powerful AI-powered screen capture and chat overlay application built with Electron, React, and TypeScript. Capture any area of your screen and analyze it with multiple AI providers including OpenAI GPT-4o, Claude 3.7 Sonnet, and DeepSeek with full markdown rendering, intelligent chat management, and professional conversation features.

## Key Features

### Advanced Screen Capture & Image Input
- **Global Hotkey**: Press `Ctrl+Shift+S` anywhere to capture screen areas
- **File Upload**: Upload images directly from files with file browser
- **Clipboard Integration**: Paste images from clipboard with `Ctrl+V` or dedicated button
- **Smart Workflow**: Images added to current chat with option to move to new chat
- **Precision Selection**: Click and drag to select exact screen regions
- **Format Support**: Supports PNG, JPG, GIF, and all common image formats
- **File Validation**: Automatic size and format validation with user feedback
- **High Quality**: Full resolution capture and processing

### Professional Image Editing Suite
- **Canvas Editor**: Built-in drawing tools for image annotation
- **Drawing Tools**: Pen and eraser with customizable colors and brush sizes
- **Undo/Redo**: Full history management with ImageData-based state tracking
- **Responsive Design**: Works seamlessly on all screen sizes and devices
- **Real-time Editing**: Live canvas updates with smooth drawing performance
- **Color Palette**: Complete color selection with opacity controls
- **Brush Controls**: Variable brush sizes for precise annotations
- **Save Integration**: Edited images automatically replace originals in conversation

### Multi-LLM Intelligence
- **OpenAI Models**: GPT-4o, GPT-4o Mini, GPT-4 Turbo with vision capabilities
- **Claude Models**: Sonnet 3.7, Sonnet 4, Opus 4.1, Opus 4, Haiku 3.5
- **DeepSeek Models**: Chat and Reasoner with cost-effective analysis
- **Model Selection**: Dropdown menus with pricing information for each model
- **Provider Status**: Real-time API key validation and connection testing
- **Smart Identity**: Each AI model maintains proper identity and capabilities

### Professional Chat Experience
- **Intelligent Naming**: Auto-generated chat titles based on conversation content
- **Manual Renaming**: Inline editing with keyboard shortcuts (Enter/Escape)
- **Smart Numbering**: Automatic "Chat 1", "Chat 2", "Screen Capture Chat 1" naming
- **Markdown Rendering**: Full markdown support with syntax-highlighted code blocks
- **Text Selection**: Select and copy any message content with one click
- **Provider Attribution**: Each response shows AI provider and specific model used
- **Chat History**: Persistent conversations with SQLite storage
- **Context Awareness**: Full conversation context maintained across messages

### Modern Interface & Theming
- **Dynamic Theme System**: Three distinct themes - Glassmorphism (Default), Dark, and Light
- **Adaptive Opacity**: Automatically adjusts transparency based on system theme detection
- **Glassmorphism Design**: Beautiful translucent overlay with blur effects and gradient backgrounds
- **Smart Background Detection**: System theme awareness for optimal visibility
- **Always On Top**: Stays accessible while you work on other applications
- **Drag & Resize**: Repositionable and resizable overlay window with smooth interactions
- **Enhanced Contrast**: Optimized readability on any background with text shadows
- **Responsive Layout**: Adapts to different screen sizes and orientations

## System Requirements

- **Operating System**: Windows, macOS, or Linux
- **Node.js**: Version 16 or higher
- **npm**: Version 8 or higher
- **Git**: For version control and repository management
- **Display Resolution**: Minimum 1024x768 (HD or higher recommended)
- **GPU**: Hardware acceleration support recommended for smooth overlay rendering
- **Memory**: Minimum 4GB RAM (8GB+ recommended for AI processing)
- **System Theme Support**: Windows 10/11, macOS 10.14+, or Linux desktop environments

## Quick Start

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

## Usage Guide

### Basic Workflow
1. **Launch** the application with `npm start`
2. **Position** the overlay on your preferred screen location
3. **Add images** via screen capture (`Ctrl+Shift+S`), file upload, or clipboard paste (`Ctrl+V`)
4. **Edit images** using the built-in canvas editor with drawing tools
5. **Select** your preferred AI provider and model
6. **Analyze** images with natural language questions
7. **Chat** with full markdown rendering and copy support

### Image Input Methods
- **Screen Capture**: Global hotkey `Ctrl+Shift+S` works from any application
- **File Upload**: Click upload button to browse and select image files
- **Clipboard Paste**: Use `Ctrl+V` or click clipboard button to paste copied images
- **Format Support**: Supports PNG, JPG, GIF, and all common image formats
- **Size Validation**: Automatic file size and format validation with error messages

### Image Editing Features
- **Canvas Editor**: Click edit button on any image to open drawing tools
- **Drawing Tools**: Choose between pen and eraser with color selection
- **Brush Controls**: Adjustable brush size and opacity for precise annotations
- **Undo/Redo**: Full history tracking with unlimited undo/redo operations
- **Responsive Interface**: Canvas editor works on all screen sizes
- **Save Integration**: Edited images automatically replace originals in conversation

### Chat Management
- **New Chat**: Click the "+" button to create a new conversation
- **Rename Chats**: Click the edit icon next to any chat title
- **Auto-naming**: Chats are automatically renamed based on content after the first AI response
- **Image Integration**: All images flow seamlessly into your conversations

### AI Provider Setup
- **API Keys**: Add your OpenAI, Claude, and/or DeepSeek API keys in settings
- **Model Selection**: Choose specific models with pricing information displayed
- **Status Monitoring**: Indicators show real-time API connectivity status
- **Provider Switching**: Change providers mid-conversation as needed

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+S` | Capture screen area and add to current chat |
| `Ctrl+V` | Paste image from clipboard |
| `Enter` | Send message / Save chat rename |
| `Shift+Enter` | New line in message |
| `Esc` | Cancel screen capture / Cancel chat rename |
| `Ctrl+C` | Copy selected text |

## Latest Features (v2.2)

### Complete Image Workflow
- **File Upload Support**: Browse and upload images directly from file system
- **Clipboard Integration**: Full clipboard paste support with `Ctrl+V` hotkey
- **Universal Image Editing**: All uploaded, pasted, and captured images work with canvas editor
- **Format Validation**: Smart file type and size validation with user feedback
- **Seamless Integration**: All image sources work identically in chat workflow

### Advanced Canvas Editor
- **Professional Drawing Tools**: Pen and eraser with customizable properties
- **Color Palette**: Full color selection with opacity controls
- **Brush Size Control**: Variable brush sizes for precise annotations
- **Undo/Redo System**: ImageData-based history tracking for reliable state management
- **Responsive Design**: Fully responsive canvas that works on all screen sizes
- **Real-time Updates**: Smooth drawing performance with optimized rendering

### Enhanced User Experience
- **Smart Paste Detection**: Automatic image detection from clipboard
- **Error Handling**: Comprehensive error messages and recovery
- **File Validation**: Size limits and format checking with clear feedback
- **Keyboard Integration**: Full keyboard support for common operations
- **Visual Feedback**: Tooltips and hover states for all interactive elements

### Technical Improvements
- **IPC Architecture**: Robust Inter-Process Communication for image handling
- **File Management**: Automatic file organization with unique naming
- **Memory Optimization**: Efficient image processing and cleanup
- **Cross-Platform Support**: Works consistently across Windows, macOS, and Linux
- **Security**: Proper input validation and secure file handling

## Technical Architecture

### Technology Stack
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
│   ├── App.tsx             # Main app with chat state management
│   ├── components/         # UI components
│   │   ├── Overlay.tsx     # Main overlay container with window controls
│   │   ├── ChatInterface.tsx # Chat UI with image upload and editing
│   │   ├── ChatHistory.tsx # Sidebar with inline renaming functionality
│   │   ├── LLMSelector.tsx # AI provider selection with status indicators
│   │   ├── ImageCanvas.tsx # Canvas editor for image annotation
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

## Development

### Development Setup
```bash
# Clone repository
git clone https://github.com/Black-Lights/ai_screen_overlay.git
cd ai_screen_overlay

# Install Node.js dependencies
npm install

# Setup environment variables
cp .env.example .env
nano .env  # Add your API keys

# Start development mode
npm run dev          # Starts both Electron and React dev servers
npm run dev:react    # React development server only
npm run dev:electron # Electron development mode only
```

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

## Distribution & Deployment

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

See [DISTRIBUTION.md](DISTRIBUTION.md) for complete distribution guide.

### Distribution Formats

#### Windows
- **`.exe` Installer (NSIS)**: Full installer with Start Menu shortcuts
- **`.exe` Portable**: No installation required, run directly
- **Features**: Desktop shortcuts, auto-updater, uninstaller

#### macOS
- **`.dmg` Installer**: Standard macOS app installer
- **Universal Binary**: Supports both Intel (x64) and Apple Silicon (arm64)
- **Features**: Code signing ready, Gatekeeper compatible

#### Linux
- **`.AppImage`**: Portable, runs on any Linux distribution (Recommended)
- **`.deb` Package**: For Debian/Ubuntu systems (apt install)
- **`.rpm` Package**: For RedHat/Fedora systems (yum/dnf install)
- **`.snap` Package**: Universal Linux package (snap install)

## Troubleshooting

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

### Debug Mode
```bash
# Enable verbose logging
DEBUG=* npm start

# Check Electron logs
tail -f electron-debug.log
```

## Performance

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

## Privacy & Security

### Data Protection
- **Local Storage**: All data remains on your machine
- **No Telemetry**: Zero tracking or analytics
- **Secure APIs**: Direct HTTPS communication with AI providers
- **Temporary Files**: Images auto-deleted after processing

### Security Practices
- **Environment Variables**: API keys stored in .env file
- **IPC Security**: Secure communication between processes
- **Input Validation**: All user inputs sanitized
- **Error Handling**: Graceful error recovery without data loss

## Roadmap

### Upcoming Features
- **Multi-language Support**: Internationalization
- **Plugin System**: Custom AI provider plugins
- **Export Options**: PDF, HTML conversation export
- **Voice Input**: Speech-to-text integration
- **Cloud Sync**: Optional cloud backup (encrypted)
- **OCR**: Text extraction from images
- **Drag & Drop**: Direct file drag and drop support

### Performance Improvements
- **Streaming Responses**: Real-time AI response streaming
- **Caching**: Intelligent response caching
- **Compression**: Database and image optimization
- **Background Processing**: Non-blocking AI operations

## Adding New Features

### New AI Provider
1. Add provider config to `src/shared/models.ts`
2. Implement API client in `src/main/ipc-handlers.ts`
3. Update UI selectors in `src/renderer/components/LLMSelector.tsx`
4. Add API key handling in settings

### New UI Components
1. Create component in `src/renderer/components/`
2. Add styling in `src/renderer/styles/globals.css`
3. Import and use in parent components
4. Update TypeScript types if needed

## License

MIT License - see [LICENSE](LICENSE) file for full details.

## Contributing

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
- Test on multiple platforms

## Acknowledgments

Special thanks to:
- **Electron Team** - Cross-platform desktop framework
- **React Community** - Frontend framework and ecosystem
- **AI Providers** - OpenAI, Anthropic, and DeepSeek for powerful APIs
- **Open Source** - All the amazing libraries that make this possible

---

**Star this repository if you find it helpful!**

**Author**: [Ammar (Black-Lights)](https://github.com/Black-Lights)  
**Project**: AI Screen Overlay - Professional AI-powered screen capture and chat application
