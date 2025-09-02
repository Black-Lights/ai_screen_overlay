import * as path from 'path';
import * as fs from 'fs';

// Load environment variables manually instead of using dotenv
const loadEnvFile = () => {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
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
  }
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
