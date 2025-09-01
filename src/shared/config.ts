import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config();

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
