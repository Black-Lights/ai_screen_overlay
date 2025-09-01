# AI Screen Overlay - Full Automation Instructions for GitHub Copilot

## 🤖 COPILOT: BUILD COMPLETE PROJECT AUTOMATICALLY

Generate all files and folder structure for a complete AI screen overlay application. This should be a fully working Electron app with React frontend.

## PROJECT REQUIREMENTS

**Core Functionality:**
- Global hotkey (Ctrl+Shift+S) for screen area selection
- Transparent overlay for area selection
- AI chat interface with multi-LLM support (OpenAI, Claude, DeepSeek)
- Image capture and analysis
- Chat history persistence with SQLite
- Modern glassmorphism UI design

**Target Platform:** Linux (Ubuntu/Debian)
**Framework:** Electron + React + TypeScript + Tailwind CSS

---

## 🎯 GENERATE COMPLETE PROJECT STRUCTURE

Create this exact folder structure with all files:

```
ai-screen-overlay/
├── package.json                 # Complete dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS setup
├── electron.config.js          # Electron builder config
├── .env.example                # Environment variables template
├── src/
│   ├── main/                   # Electron main process
│   │   ├── main.ts            # Main electron process with hotkeys
│   │   ├── screen-capture.ts  # Linux screen capture service
│   │   ├── database.ts        # SQLite chat storage
│   │   └── ipc-handlers.ts    # IPC communication
│   ├── renderer/              # React frontend
│   │   ├── index.html         # HTML template
│   │   ├── App.tsx            # Main React application
│   │   ├── components/
│   │   │   ├── Overlay.tsx    # Main chat overlay
│   │   │   ├── ChatInterface.tsx  # Chat messages UI
│   │   │   ├── ScreenSelector.tsx # Area selection
│   │   │   ├── LLMSelector.tsx    # AI provider dropdown
│   │   │   └── ChatHistory.tsx    # Chat management
│   │   ├── services/
│   │   │   ├── ai-service.ts      # Multi-LLM integration
│   │   │   └── storage-service.ts # Database operations
│   │   └── styles/
│   │       └── globals.css        # Global styles
│   └── shared/
│       └── types.ts               # TypeScript interfaces
└── README.md                      # Usage instructions
```

---

## 📦 PACKAGE.JSON - COMPLETE SETUP

Generate package.json with:
- All required dependencies for Electron, React, TypeScript
- Linux-compatible screen capture libraries (screenshot-desktop, not robotjs)
- SQLite, AI API clients, Tailwind CSS
- Complete npm scripts for dev, build, and distribution
- Electron builder configuration for Linux

**Required Dependencies:**
```json
"dependencies": {
  "electron": "latest",
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "axios": "latest",
  "better-sqlite3": "latest",
  "screenshot-desktop": "latest",
  "electron-screenshot": "latest",
  "tailwindcss": "latest"
}
```

---

## 🖥️ MAIN PROCESS FILES

### main.ts Requirements:
- Register global hotkey Ctrl+Shift+S for Linux
- Create main window (hidden initially)
- Handle screen capture workflow
- IPC communication setup
- Database initialization
- Linux permissions handling

### screen-capture.ts Requirements:
- Full screen transparent overlay for area selection
- Mouse drag selection with visual feedback
- Capture selected area using Linux-compatible methods
- Save to temporary directory
- Multi-monitor support

### database.ts Requirements:
- SQLite database with tables: chats, messages, settings
- Complete CRUD operations
- Chat history management
- Automatic database creation and migrations

---

## ⚛️ REACT FRONTEND FILES

### App.tsx Requirements:
- Main application state management
- Route between overlay and settings
- IPC communication with main process
- Error boundary and loading states

### Overlay.tsx Requirements:
- Modern glassmorphism design with Tailwind
- Draggable window with custom title bar
- Minimize/maximize/close controls
- Responsive design
- Smooth animations

### ChatInterface.tsx Requirements:
- Message bubbles (user/AI styling)
- Image display within messages
- Input field with send button
- Typing indicators and loading states
- Auto-scroll to bottom

### LLMSelector.tsx Requirements:
- Dropdown for OpenAI, Claude, DeepSeek selection
- API key input fields for each provider
- Provider switching logic
- Validation and error handling

---

## 🤖 AI SERVICE IMPLEMENTATION

### ai-service.ts Requirements:
Create complete service supporting:
- OpenAI GPT-4V with vision capabilities
- Claude 3.5 Sonnet with image analysis
- DeepSeek with vision support
- Base64 image encoding for APIs
- Streaming responses where supported
- Error handling and retries
- API key management

**API Integration Details:**
```typescript
interface AIProvider {
  name: string;
  sendMessage(image: string, text: string): Promise<string>;
}

// Implement: OpenAIProvider, ClaudeProvider, DeepSeekProvider
```

---

## 💾 DATABASE SCHEMA

Generate complete SQLite schema:
```sql
CREATE TABLE chats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id INTEGER REFERENCES chats(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  image_path TEXT,
  provider TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

---

## 🎨 UI DESIGN SPECIFICATIONS

### Glassmorphism Theme:
- Background: `backdrop-blur-lg bg-white/10`
- Borders: `border border-white/20`
- Shadows: `shadow-2xl`
- Rounded corners: `rounded-xl`

### Color Scheme:
- Primary: Blue gradient (`from-blue-500 to-purple-600`)
- User messages: `bg-blue-500 text-white`
- AI messages: `bg-gray-100 text-gray-800`
- Accents: `text-blue-400`

### Animations:
- Smooth transitions on all interactions
- Fade in/out for overlay appearance
- Smooth scrolling for chat
- Hover effects on buttons

---

## 🔧 CONFIGURATION FILES

### tsconfig.json:
- Strict TypeScript configuration
- Path mapping for clean imports
- React JSX support
- Target ES2020

### tailwind.config.js:
- Custom glassmorphism utilities
- Animation extensions
- Custom color palette
- Responsive breakpoints

### electron.config.js:
- Linux build configuration
- AppImage and Snap package support
- Auto-updater setup
- Icon and metadata

---

## 🚀 DEVELOPMENT SCRIPTS

Generate complete npm scripts:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:react\" \"npm run dev:electron\"",
    "dev:react": "webpack serve --mode development",
    "dev:electron": "electron src/main/main.ts",
    "build": "npm run build:react && npm run build:electron",
    "build:react": "webpack --mode production",
    "build:electron": "tsc",
    "dist": "electron-builder",
    "clean": "rm -rf dist build node_modules/.cache"
  }
}
```

---

## 🔐 ENVIRONMENT SETUP

Generate .env.example:
```
OPENAI_API_KEY=your_openai_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Database
DB_PATH=./data/chats.db

# Development
NODE_ENV=development
```

---

## 📖 README.md REQUIREMENTS

Generate complete README with:
- Project description and features
- Installation instructions for Linux
- Usage guide with screenshots
- API key setup instructions
- Development setup
- Building and distribution
- Troubleshooting section

---

## ✅ VALIDATION REQUIREMENTS

Ensure the generated project:
- ✅ Installs without errors on Linux
- ✅ Screen capture works with Ctrl+Shift+S
- ✅ All three AI providers integrate properly
- ✅ Chat history persists across restarts
- ✅ UI is responsive and modern
- ✅ No TypeScript errors
- ✅ Builds successfully with `npm run dist`

---

## 🎯 COPILOT EXECUTION COMMAND

**To use this file:**

1. Create new folder: `ai-screen-overlay`
2. Open in VS Code
3. Create new file: `instructions-copilot.md`
4. Paste this entire content
5. Open VS Code Command Palette (Ctrl+Shift+P)
6. Run: "GitHub Copilot: Generate Project from Instructions"
7. Select this instructions file

**Alternative method:**
```
@workspace /generateProject Generate complete AI screen overlay project based on instructions-copilot.md file. Create all files and folders as specified.
```

---

## 🏁 EXPECTED RESULT

After generation, you should have:
- Complete working Electron app
- All files generated and properly configured
- Ready to run with `npm install && npm start`
- Functional screen capture and AI chat
- Professional UI with all features working

**Total generated files: ~15-20 files**
**Development time saved: ~20-30 hours**

---

## ⚠️ POST-GENERATION STEPS

After Copilot generates everything:
1. `npm install` - Install dependencies
2. Copy `.env.example` to `.env` and add your API keys
3. `npm start` - Test the application
4. Press Ctrl+Shift+S to test screen capture
5. Test all AI providers in the dropdown

**That's it! Complete automation.** 🎉