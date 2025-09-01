# AI Screen Overlay

A powerful AI-powered screen capture and chat overlay application built with Electron, React, and TypeScript. Capture any area of your screen and analyze it with multiple AI providers including OpenAI GPT-4o, Claude 3.7 Sonnet, and DeepSeek with full markdown rendering and professional chat features.

## ✨ Key Features

### 🖼️ **Advanced Screen Capture**
- **Global Hotkey**: Press `Ctrl+Shift+S` anywhere to capture screen areas
- **Precision Selection**: Click and drag to select exact regions
- **Instant Processing**: Captured images automatically attached to chat
- **High Quality**: Full resolution capture with PNG encoding

### 🤖 **Multi-LLM Intelligence**
- **OpenAI Models**: GPT-4o, GPT-4o Mini, GPT-4 Turbo with vision capabilities
- **Claude Models**: Sonnet 3.7, Sonnet 4, Opus 4.1, Opus 4, Haiku 3.5
- **DeepSeek Models**: Chat and Reasoner with cost-effective analysis
- **Smart Routing**: Automatic model selection with fallback support
- **Provider Status**: Real-time API key validation and status indicators

### 💬 **Professional Chat Experience**
- **Markdown Rendering**: Full markdown support with syntax-highlighted code blocks
- **Text Selection**: Select and copy any message content with one click
- **Provider Attribution**: Each response shows AI provider and specific model used
- **Chat History**: Persistent conversations with SQLite storage
- **Context Awareness**: Full conversation context maintained across messages

### 🎨 **Modern Interface**
- **Glassmorphism Design**: Beautiful translucent overlay with blur effects
- **Always On Top**: Stays accessible while you work on other applications
- **Drag & Resize**: Repositionable and resizable overlay window
- **Enhanced Contrast**: Optimized readability on any background
- **Responsive Layout**: Adapts to different screen sizes and orientations

## 📋 System Requirements

- **Operating System**: Linux (Ubuntu 20.04+ recommended)
- **Node.js**: Version 18.0.0 or higher
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Display**: X11 or Wayland with screen capture permissions
- **Network**: Internet connection for AI API access

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

#### Screen Capture
- **Global Hotkey**: `Ctrl+Shift+S` works from any application
- **Precision Selection**: Click and drag for exact area capture
- **Multiple Captures**: Add multiple images to same conversation
- **Cancel**: Press `Esc` during selection to cancel

#### AI Provider Selection
- **Provider Dropdown**: Choose between OpenAI, Claude, or DeepSeek
- **Model Selection**: Pick specific models with pricing information
- **Status Indicators**: Real-time API key validation (🟢 Ready, 🔴 Error)
- **Auto-switching**: Seamlessly switch providers mid-conversation

#### Chat Management
- **Multiple Chats**: Create unlimited conversation threads
- **Chat History**: Persistent storage with full conversation context
- **Search & Navigate**: Find specific conversations quickly
- **Export/Import**: Backup and restore chat data

#### Markdown & Formatting
- **Rich Text Rendering**: Full markdown support in AI responses
- **Code Highlighting**: Syntax highlighting for 100+ programming languages
- **Copy Support**: One-click copying of any message or code block
- **Text Selection**: Select and copy portions of any message

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+S` | Capture screen area |
| `Ctrl+Shift+A` | Toggle overlay visibility |
| `Enter` | Send message |
| `Shift+Enter` | New line in message |
| `Esc` | Cancel screen capture |
| `Ctrl+C` | Copy selected text |

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Electron 27 + Node.js + better-sqlite3
- **Build**: Webpack 5 + TypeScript compiler
- **Styling**: Tailwind CSS + Custom glassmorphism
- **Markdown**: ReactMarkdown + Prism syntax highlighting

### Project Structure
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
# Install dependencies
npm install

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
- [ ] **Themes**: Dark/light theme options
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
