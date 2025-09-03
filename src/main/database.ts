import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Chat, Message, AppSettings } from '@/shared/types';

class DatabaseService {
  private db: Database.Database;
  private dbPath: string;

  constructor() {
    console.log('📊 DatabaseService constructor called');
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    console.log('📁 Data directory path:', dataDir);
    
    if (!fs.existsSync(dataDir)) {
      console.log('📂 Creating data directory...');
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('✅ Data directory created');
    } else {
      console.log('✅ Data directory already exists');
    }

    this.dbPath = path.join(dataDir, 'chats.db');
    console.log('🗃️ Database path:', this.dbPath);
    
    console.log('🔌 Connecting to SQLite database...');
    this.db = new Database(this.dbPath);
    console.log('✅ Database connection established');
    
    // Enable WAL mode for better performance
    console.log('⚙️ Setting up database pragmas...');
    this.db.exec('PRAGMA journal_mode = WAL');
    this.db.exec('PRAGMA foreign_keys = ON');
    console.log('✅ Database pragmas configured');
    
    console.log('🏗️ Creating database tables...');
    this.createTables();
    console.log('✅ Database tables created/verified');
  }

  private createTables() {
    console.log('📋 Creating chats table...');
    // Create chats table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Chats table ready');

    console.log('💬 Creating messages table...');
    // Create messages table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        image_path TEXT,
        provider TEXT,
        model TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Messages table ready');

    // Add model column migration for existing tables
    console.log('🔄 Checking for model column migration...');
    try {
      this.db.exec('ALTER TABLE messages ADD COLUMN model TEXT');
      console.log('✅ Added model column to messages table');
    } catch (error: any) {
      if (error.message && error.message.includes('duplicate column name')) {
        console.log('✅ Model column already exists');
      } else {
        console.log('⚠️ Error adding model column:', error.message);
      }
    }

    console.log('⚙️ Creating settings table...');
    // Create settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
    console.log('✅ Settings table ready');

    console.log('📇 Creating database indexes...');
    // Create indexes for performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
      CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
    `);
    console.log('✅ Database indexes created');
  }

  // Chat operations
  createChat(title: string): Chat {
    const stmt = this.db.prepare(`
      INSERT INTO chats (title) VALUES (?)
    `);
    const result = stmt.run(title);
    
    return {
      id: result.lastInsertRowid as number,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  getChats(): Chat[] {
    const stmt = this.db.prepare('SELECT * FROM chats ORDER BY updated_at DESC');
    const rows = stmt.all() as any[];
    
    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  getChat(id: number): Chat | null {
    const stmt = this.db.prepare(`
      SELECT * FROM chats WHERE id = ?
    `);
    const row = stmt.get(id) as any;
    
    if (!row) return null;
    
    return {
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  updateChatTitle(id: number, title: string): void {
    const stmt = this.db.prepare(`
      UPDATE chats SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);
    stmt.run(title, id);
  }

  deleteChat(id: number): void {
    const stmt = this.db.prepare(`
      DELETE FROM chats WHERE id = ?
    `);
    stmt.run(id);
  }

  // Message operations
  saveMessage(message: Omit<Message, 'id' | 'timestamp'>): Message {
    const stmt = this.db.prepare(`
      INSERT INTO messages (chat_id, role, content, image_path, provider, model)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      message.chatId,
      message.role,
      message.content,
      message.imagePath || null,
      message.provider || null,
      message.model || null
    );

    // Update chat's updated_at timestamp
    const updateChatStmt = this.db.prepare(`
      UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);
    updateChatStmt.run(message.chatId);

    return {
      id: result.lastInsertRowid as number,
      chatId: message.chatId,
      role: message.role,
      content: message.content,
      imagePath: message.imagePath,
      provider: message.provider,
      model: message.model,
      timestamp: new Date().toISOString()
    };
  }

  updateMessage(id: number, updates: { content?: string; imagePath?: string }): Message | null {
    const stmt = this.db.prepare(`
      UPDATE messages 
      SET content = COALESCE(?, content),
          image_path = COALESCE(?, image_path)
      WHERE id = ?
    `);
    
    const result = stmt.run(updates.content, updates.imagePath, id);
    
    if (result.changes === 0) {
      return null; // Message not found
    }

    // Get the updated message
    const getStmt = this.db.prepare(`
      SELECT * FROM messages WHERE id = ?
    `);
    const row = getStmt.get(id) as any;
    
    if (!row) return null;

    return {
      id: row.id,
      chatId: row.chat_id,
      role: row.role,
      content: row.content,
      imagePath: row.image_path,
      provider: row.provider,
      model: row.model,
      timestamp: row.timestamp
    };
  }

  getChatMessages(chatId: number): Message[] {
    const stmt = this.db.prepare(`
      SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp ASC
    `);
    const rows = stmt.all(chatId) as any[];
    
    return rows.map((row: any) => ({
      id: row.id,
      chatId: row.chat_id,
      role: row.role,
      content: row.content,
      imagePath: row.image_path,
      provider: row.provider,
      model: row.model,
      timestamp: row.timestamp
    }));
  }

  deleteMessage(id: number): void {
    const stmt = this.db.prepare(`
      DELETE FROM messages WHERE id = ?
    `);
    stmt.run(id);
  }

  // Settings operations
  getSetting(key: string): string | null {
    const stmt = this.db.prepare(`
      SELECT value FROM settings WHERE key = ?
    `);
    const row = stmt.get(key) as any;
    return row ? row.value : null;
  }

  setSetting(key: string, value: string): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
    `);
    stmt.run(key, value);
  }

  getSettings(): AppSettings {
    const stmt = this.db.prepare(`
      SELECT key, value FROM settings
    `);
    const rows = stmt.all() as any[];
    
    const settings: any = {};
    rows.forEach((row: any) => {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    });

    return {
      openaiApiKey: settings.openaiApiKey || process.env.OPENAI_API_KEY || '',
      claudeApiKey: settings.claudeApiKey || process.env.CLAUDE_API_KEY || '',
      deepseekApiKey: settings.deepseekApiKey || process.env.DEEPSEEK_API_KEY || '',
      selectedProvider: settings.selectedProvider || 'openai',
      overlayPosition: settings.overlayPosition || { x: 100, y: 100 },
      overlaySize: settings.overlaySize || { width: 500, height: 700 }
    };
  }

  saveSettings(settings: Partial<AppSettings>): void {
    Object.entries(settings).forEach(([key, value]) => {
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      this.setSetting(key, serializedValue);
    });
  }

  syncEnvToDatabase(): void {
    console.log('🔄 Syncing .env keys to database...');
    
    // Get the appropriate .env file path for different installation types
    const getEnvPath = (): string | null => {
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
          console.log(`📄 Found .env file for sync at: ${envPath}`);
          return envPath;
        }
      }

      console.log(`⚠️ .env file not found for sync in any of these locations:\n${possiblePaths.map(p => `  - ${p}`).join('\n')}`);
      return null;
    };

    const envPath = getEnvPath();
    if (!envPath) {
      console.log('⚠️ .env file not found, skipping sync');
      return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const openaiMatch = envContent.match(/OPENAI_API_KEY=(.+)/);
    const claudeMatch = envContent.match(/CLAUDE_API_KEY=(.+)/);
    const deepseekMatch = envContent.match(/DEEPSEEK_API_KEY=(.+)/);

    if (openaiMatch && openaiMatch[1] && openaiMatch[1] !== 'your_openai_api_key_here') {
      const key = openaiMatch[1].trim();
      this.setSetting('openaiApiKey', key);
      console.log('✅ Synced OpenAI API key to database');
    }

    if (claudeMatch && claudeMatch[1] && claudeMatch[1] !== 'your_claude_api_key_here') {
      const key = claudeMatch[1].trim();
      this.setSetting('claudeApiKey', key);
      console.log('✅ Synced Claude API key to database');
    }

    if (deepseekMatch && deepseekMatch[1] && deepseekMatch[1] !== 'your_deepseek_api_key_here') {
      const key = deepseekMatch[1].trim();
      this.setSetting('deepseekApiKey', key);
      console.log('✅ Synced DeepSeek API key to database');
    }

    console.log('✅ Env to database sync completed');
  }

  close(): void {
    this.db.close();
  }
}

// Global database instance
let dbService: DatabaseService;

export async function initDatabase(): Promise<void> {
  console.log('🗄️ initDatabase() called');
  try {
    console.log('🏗️ Creating DatabaseService instance...');
    dbService = new DatabaseService();
    console.log('✅ DatabaseService instance created');
    
    console.log('📋 Calling createTables...');
    dbService['createTables'](); // Call private method
    
    console.log('🔄 Syncing .env keys to database...');
    dbService.syncEnvToDatabase();
    
    console.log('✅ initDatabase completed successfully');
  } catch (error) {
    console.error('❌ Error in initDatabase:', error);
    throw error;
  }
}

export function getDatabase(): DatabaseService {
  return dbService;
}

// Export the service class for use in IPC handlers
export { DatabaseService };
