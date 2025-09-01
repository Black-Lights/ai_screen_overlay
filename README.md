# AI Screen Overlay

A powerful AI-powered screen capture and chat overlay application built with Electron, React, and TypeScript. Capture any area of your screen and analyze it with multiple AI providers including OpenAI GPT-4V, Claude 3.5 Sonnet, and DeepSeek.

## 🚀 Features

- **Global Screen Capture**: Press `Ctrl+Shift+S` anywhere to capture screen areas
- **Multi-LLM Support**: Switch between OpenAI, Claude, and DeepSeek AI providers
- **Vision Analysis**: AI can analyze and describe captured images
- **Persistent Chat History**: All conversations saved locally with SQLite
- **Modern UI**: Glassmorphism design with smooth animations
- **Always On Top**: Overlay stays accessible while you work
- **Drag & Drop**: Repositionable overlay window
- **Linux Optimized**: Built specifically for Linux environments

## 📋 Requirements

- **Node.js** 18+ and npm
- **Linux** (Ubuntu/Debian recommended)
- **Screen capture permissions** (handled automatically)
- **API keys** for your chosen AI providers

## 🛠️ Installation

### Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-screen-overlay

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your API keys to .env file
nano .env

# Build and start the application
npm start
```

### Development Mode

```bash
# Start in development mode with hot reload
npm run dev
```

### Build for Distribution

```bash
# Build the application
npm run build

# Create distributable packages
npm run dist
```

## 🔑 API Key Setup

Edit the `.env` file and add your API keys:

```env
# OpenAI (for GPT-4 Vision)
OPENAI_API_KEY=sk-your-openai-key-here

# Anthropic (for Claude 3.5 Sonnet)
CLAUDE_API_KEY=your-claude-key-here

# DeepSeek (for DeepSeek Vision)
DEEPSEEK_API_KEY=your-deepseek-key-here
```

### Getting API Keys

- **OpenAI**: Visit [platform.openai.com](https://platform.openai.com/api-keys)
- **Claude**: Visit [console.anthropic.com](https://console.anthropic.com/)
- **DeepSeek**: Visit [platform.deepseek.com](https://platform.deepseek.com/)

## ⌨️ Keyboard Shortcuts

- `Ctrl+Shift+S` - Start screen capture
- `Ctrl+Shift+A` - Toggle overlay visibility
- `Enter` - Send message
- `Shift+Enter` - New line in message
- `Esc` - Cancel screen capture (during selection)

## 🎯 Usage

### Basic Workflow

1. **Launch**: Start the application with `npm start`
2. **Position**: Drag the overlay to your preferred screen location
3. **Capture**: Press `Ctrl+Shift+S` and select screen area
4. **Analyze**: Type your question about the captured image
5. **Chat**: Continue the conversation with the AI

### Screen Capture

1. Press `Ctrl+Shift+S` from anywhere
2. Click and drag to select the area you want to capture
3. Release to capture, or press `Esc` to cancel
4. The overlay will appear with your captured image
5. Ask questions about the image or request analysis

### AI Provider Selection

- Click the provider dropdown in the overlay
- Select your preferred AI (OpenAI, Claude, or DeepSeek)
- Ensure the API key is configured (green indicator)
- Different providers excel at different tasks:
  - **OpenAI GPT-4V**: Excellent for detailed image analysis
  - **Claude 3.5**: Great for coding and technical content
  - **DeepSeek**: Cost-effective with good performance

### Chat Management

- **New Chat**: Click the "+" button in chat history
- **Switch Chats**: Click any chat in the history panel
- **Delete Chat**: Hover over a chat and click the delete button
- **Search**: Use the search bar to find specific conversations

## 🏗️ Project Structure

```
ai-screen-overlay/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.ts          # Application entry point
│   │   ├── database.ts      # SQLite database operations  
│   │   ├── screen-capture.ts # Screen capture service
│   │   └── ipc-handlers.ts  # IPC communication
│   ├── renderer/            # React frontend
│   │   ├── App.tsx          # Main React component
│   │   ├── components/      # UI components
│   │   ├── services/        # API and storage services
│   │   └── styles/          # CSS and styling
│   └── shared/              # Shared TypeScript types
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS setup
└── webpack.config.js       # Webpack build configuration
```

## 🔧 Configuration

### Overlay Settings

Access settings by clicking the gear icon in the overlay:

- **API Keys**: Configure keys for each AI provider
- **Position**: Overlay position is saved automatically
- **Provider**: Choose your default AI provider

### Database

- **Location**: `./data/chats.db` (SQLite)
- **Tables**: `chats`, `messages`, `settings`
- **Automatic**: Database created on first run

## 📦 Distribution

### Linux Packages

The build process creates multiple Linux-compatible packages:

```bash
npm run dist
```

Generates:
- `*.AppImage` - Universal Linux application
- `*.snap` - Snap package for Ubuntu
- `*.deb` - Debian/Ubuntu package

### Installation

```bash
# AppImage (run anywhere)
chmod +x ai-screen-overlay.AppImage
./ai-screen-overlay.AppImage

# Debian package
sudo dpkg -i ai-screen-overlay.deb
```

## 🛡️ Privacy & Security

- **Local Storage**: All data stored locally in SQLite database
- **No Telemetry**: No usage data collected or transmitted
- **API Keys**: Stored securely in local environment
- **Images**: Temporary screenshots deleted after processing

## 🐛 Troubleshooting

### Screen Capture Issues

```bash
# Check display permissions
echo $DISPLAY

# Install required dependencies
sudo apt-get install libxss1 libgconf-2-4 libxtst6 libxrandr2 libasound2 libpangocairo-1.0-0 libatk1.0-0 libcairo1.0-0 libgtk-3-0 libgdk-pixbuf2.0-0 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxext6 libxfixes3 libxrender1 libx11-6
```

### Build Issues

```bash
# Clear build cache
npm run clean
npm install

# Rebuild native dependencies
npm rebuild

# Check Node.js version (requires 18+)
node --version
```

### API Connection Issues

1. **Check API Keys**: Ensure keys are valid and have sufficient credits
2. **Network**: Verify internet connection and firewall settings
3. **Rate Limits**: Wait a few minutes if rate limited
4. **CORS**: API calls are made from main process (no CORS issues)

### Performance Issues

```bash
# Monitor memory usage
ps aux | grep ai-screen-overlay

# Check database size
du -h data/chats.db

# Clean up old screenshots
rm -rf temp/*.png
```

## 🤝 Development

### Prerequisites

- Node.js 18+
- TypeScript knowledge
- Electron basics
- React/tailwind CSS

### Development Setup

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Run TypeScript checks
npm run build:electron

# Lint code
npm run lint
```

### Adding New AI Providers

1. Add provider to `src/renderer/services/ai-service.ts`
2. Update provider list in `src/renderer/components/LLMSelector.tsx`
3. Add API key handling in settings
4. Update types in `src/shared/types.ts`

### Architecture

- **Main Process**: Handles system integration, database, screen capture
- **Renderer Process**: React UI, user interactions, AI communication
- **IPC**: Communication between main and renderer processes
- **SQLite**: Local data persistence

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Electron team for the fantastic framework
- React and TypeScript communities
- AI providers (OpenAI, Anthropic, DeepSeek)
- Tailwind CSS for the beautiful styling

## 📞 Support

For issues, feature requests, or questions:

1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include system information and error logs
4. Provide steps to reproduce the problem

---

**Built with ❤️ for the Linux community**
