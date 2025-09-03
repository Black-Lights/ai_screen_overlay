# 🔑 API Key Setup Guide

## First Time Setup

When you first run AI Screen Overlay, you'll need to configure your API keys to use the AI features.

### 📱 **Method 1: Using the App Settings Panel (Recommended)**

1. **Launch the app** (AppImage, installer, or portable version)
2. **Click the Settings button** (⚙️ gear icon) in the overlay
3. **Go to "API Configuration" section**
4. **Enter your API keys** in the respective fields:
   - OpenAI API Key (for GPT models)
   - Claude API Key (for Anthropic models)  
   - DeepSeek API Key (for DeepSeek models)
5. **Click "Save"** - keys are stored securely in your local database

### 📝 **Method 2: Manual .env File Configuration**

#### **For Portable Versions** (AppImage, Portable EXE)
1. **Navigate** to the same folder where you placed the app
2. **Create a file** named `.env` (note the dot at the beginning)
3. **Copy content** from `.env.example` and fill in your keys:

```bash
# Copy this content to .env file
OPENAI_API_KEY=sk-your-actual-openai-key-here
CLAUDE_API_KEY=sk-ant-your-actual-claude-key-here  
DEEPSEEK_API_KEY=your-actual-deepseek-key-here
```

#### **For Installed Versions** (DEB, RPM, Windows Installer)
The `.env` file should be created in your user config directory:

**Linux:**
```bash
mkdir -p ~/.config/ai-screen-overlay
nano ~/.config/ai-screen-overlay/.env
```

**Windows:**
1. **Open File Explorer** and navigate to: `%APPDATA%\ai-screen-overlay\`
   - Or paste this in the address bar: `C:\Users\YourUsername\AppData\Roaming\ai-screen-overlay\`
2. **Create the folder** if it doesn't exist
3. **Create a new file** named `.env` (no file extension)
4. **Edit the file** with Notepad and add your API keys:
```env
OPENAI_API_KEY=sk-your-actual-openai-key-here
CLAUDE_API_KEY=sk-ant-your-actual-claude-key-here  
DEEPSEEK_API_KEY=your-actual-deepseek-key-here
```

**macOS:**
```bash
mkdir -p ~/.config/ai-screen-overlay  
nano ~/.config/ai-screen-overlay/.env
```

## 🔐 **Getting API Keys**

### **OpenAI (GPT-4, GPT-4o, GPT-3.5)**
1. Visit: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in to your OpenAI account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. **Important:** Add billing info to your OpenAI account to use the API

### **Anthropic Claude (Claude-3, Claude-3.5)**  
1. Visit: [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in to your Anthropic account
3. Go to "API Keys" section
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)

### **DeepSeek (DeepSeek Chat, DeepSeek Reasoner)**
1. Visit: [https://platform.deepseek.com/](https://platform.deepseek.com/)
2. Sign up or log in to your DeepSeek account  
3. Go to API section
4. Generate new API key
5. Copy the key

## 🛡️ **Security & Privacy**

- **Keys are stored locally** - never sent to our servers
- **Encrypted storage** - keys are stored in your local SQLite database  
- **No telemetry** - your API usage is between you and the AI providers
- **Open source** - you can verify the code yourself

## ❗ **Important Notes**

### **API Costs**
- All AI API calls are **billed directly by the providers** (OpenAI, Anthropic, DeepSeek)
- The app shows which provider/model is being used for each request
- Monitor your usage on the respective provider dashboards

### **Rate Limits**
- Each provider has different rate limits based on your account tier
- The app will show errors if you hit rate limits
- Consider upgrading your account tier for higher limits

### **Backup Your Keys**
- Save your API keys in a secure password manager
- The `.env` file is not backed up automatically
- If you reinstall, you'll need to re-enter your keys

## 🔧 **Troubleshooting**

### **"Invalid API Key" Error**
- Double-check the key is copied correctly (no extra spaces)
- Ensure the key is active on the provider's dashboard
- Check if billing is set up (required for OpenAI)

### **"Rate Limited" Error**  
- Wait a few minutes and try again
- Check your usage limits on the provider dashboard
- Consider upgrading your account tier

### **Keys Not Saving**
- Check file permissions for the `.env` file
- Try using the in-app Settings panel instead
- Ensure the app has write permissions to its directory

## 🚀 **Quick Start Commands**

### **Linux (AppImage)**
```bash
# Download AppImage
wget https://github.com/yourname/ai-screen-overlay/releases/latest/download/AI-Screen-Overlay-linux.AppImage

# Make executable  
chmod +x AI-Screen-Overlay-linux.AppImage

# Create .env file
cp .env.example .env
nano .env  # Edit with your keys

# Run
./AI-Screen-Overlay-linux.AppImage
```

### **Windows (Portable)**
1. Download `AI-Screen-Overlay-portable.exe`
2. Create `.env` file in same folder
3. Add your API keys to `.env`
4. Run the executable

### **First Run Setup Script**
For Linux/macOS users, you can also run:
```bash
./first-run-setup.sh
```

This script will guide you through the initial configuration process.
