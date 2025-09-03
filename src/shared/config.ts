import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// Get the appropriate .env file path for different installation types
const getEnvPath = (): string | null => {
  // Try multiple locations in order of preference
  const possiblePaths = [
    // 1. Current working directory (portable versions)
    path.join(process.cwd(), '.env'),
    // 2. User config directory (installed versions)
    path.join(os.homedir(), '.config', 'ai-screen-overlay', '.env'),
    // 3. Windows AppData (installed versions on Windows)
    process.platform === 'win32' ? path.join(os.homedir(), 'AppData', 'Roaming', 'ai-screen-overlay', '.env') : null,
    // 4. macOS Application Support (installed versions on macOS)
    process.platform === 'darwin' ? path.join(os.homedir(), 'Library', 'Application Support', 'ai-screen-overlay', '.env') : null,
  ].filter(Boolean) as string[];

  // Return the first existing path
  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      console.log(`📄 Found .env file at: ${envPath}`);
      return envPath;
    }
  }

  console.log(`⚠️ .env file not found in any of these locations:\n${possiblePaths.map(p => `  - ${p}`).join('\n')}`);
  return null;
};

// Load environment variables manually instead of using dotenv
const loadEnvFile = () => {
  const envPath = getEnvPath();
  if (!envPath) return;

  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    }
  });
};

// Load environment variables
loadEnvFile();

export const config = {
  database: {
    path: process.env.DB_PATH || path.join(process.cwd(), 'data', 'chats.db')
  },
  api: {
    openai: process.env.OPENAI_API_KEY,
    claude: process.env.CLAUDE_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY
  },
  app: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production'
  }
};
