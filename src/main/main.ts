import { app, BrowserWindow, globalShortcut, Menu } from 'electron';
import { join } from 'path';
import { config } from 'dotenv';
import { initDatabase } from './database';
import { setupIpcHandlers } from './ipc-handlers';
import { ScreenCaptureService } from './screen-capture';

// Load environment variables from .env file
config();

const isDev = process.env.NODE_ENV === 'development';

class Application {
  private mainWindow: BrowserWindow | null = null;
  private screenCaptureService: ScreenCaptureService;
  
  constructor() {
    console.log('🏗️ Application constructor called');
    console.log('📹 Creating ScreenCaptureService...');
    this.screenCaptureService = new ScreenCaptureService();
    console.log('✅ ScreenCaptureService created');
    console.log('🔧 Calling init()...');
    this.init();
    console.log('✅ Application init completed');
  }

  private init(): void {
    console.log('🔧 Setting up app event listeners...');
    // Don't listen for 'ready' event here - it already fired in whenReady()
    // Just create the window immediately
    console.log('🪟 Creating window immediately (app already ready)...');
    this.createWindow();
    
    app.on('window-all-closed', () => {
      console.log('🪟 All windows closed');
      if (process.platform !== 'darwin') {
        console.log('🚪 Quitting app (not macOS)');
        app.quit();
      }
    });
    app.on('activate', () => {
      console.log('🔄 App activated');
      if (BrowserWindow.getAllWindows().length === 0) {
        console.log('🪟 No windows open, creating new window');
        this.createWindow();
      }
    });
    app.on('will-quit', () => {
      console.log('🚪 App will quit, unregistering shortcuts');
      globalShortcut.unregisterAll();
    });
    console.log('✅ App event listeners configured');
  }

  private createWindow(): void {
    console.log('🪟 Creating main window...');
    this.mainWindow = new BrowserWindow({
      height: 700,
      width: 500,
      minHeight: 300,
      minWidth: 280,
      maxHeight: 1400,
      maxWidth: 1000,
      show: false,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: false,
      resizable: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, 'preload.js'),
        webSecurity: true
      }
    });
    console.log('✅ BrowserWindow created');

    Menu.setApplicationMenu(null);
    console.log('🍽️ App menu disabled');

    if (isDev) {
      console.log('🔧 Development mode: loading built React files');
      this.mainWindow.loadFile(join(__dirname, '../../../dist/renderer/index.html'));
    } else {
      console.log('📦 Production mode: loading local file');
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }

    this.mainWindow.once('ready-to-show', () => {
      console.log('👁️ Window ready to show');
      this.mainWindow?.show();
      
      // Auto-test screen capture after 5 seconds for debugging
      setTimeout(() => {
        console.log('🧪 Auto-triggering test screen capture for React debugging...');
        this.screenCaptureService.startCapture()
          .then((captureResult) => {
            if (captureResult && this.mainWindow) {
              console.log('📸 Auto-test capture completed:', captureResult.imagePath);
              console.log('📤 Sending test screen-capture-complete event to renderer');
              this.mainWindow.webContents.send('screen-capture-complete', {
                imagePath: captureResult.imagePath,
                bounds: captureResult.bounds
              });
              console.log('🪟 Main window shown and focused');
              this.mainWindow.show();
              this.mainWindow.focus();
            } else {
              console.log('❌ Auto-test screen capture returned null (canceled or failed)');
            }
          })
          .catch((error: Error) => {
            console.error('❌ Auto-test screen capture failed with error:', error);
          });
      }, 5000);
    });

    this.mainWindow.on('closed', () => {
      console.log('🗑️ Main window closed');
      this.mainWindow = null;
    });

    console.log('⌨️ Setting up global shortcuts...');
    this.setupGlobalShortcuts();
    console.log('🖱️ Setting up context menu...');
    this.setupContextMenu();
    console.log('✅ Window setup complete');
  }

  private setupGlobalShortcuts(): void {
    const captureRet = globalShortcut.register('CommandOrControl+Shift+S', () => {
      console.log('🔥 Screen capture shortcut triggered (Ctrl+Shift+S)');
      this.screenCaptureService.startCapture()
        .then((captureResult) => {
          console.log('📸 Screen capture promise resolved:', captureResult);
          if (captureResult) {
            console.log('✅ Screen captured successfully:', captureResult.imagePath);
            console.log('📁 Image saved at:', captureResult.imagePath);
            if (this.mainWindow) {
              console.log('📤 Sending screen-capture-complete event to renderer');
              this.mainWindow.webContents.send('screen-capture-complete', captureResult);
              this.mainWindow.show();
              this.mainWindow.focus();
              console.log('🪟 Main window shown and focused');
            } else {
              console.log('❌ Main window not available');
            }
          } else {
            console.log('❌ Screen capture returned null (canceled or failed)');
          }
        })
        .catch((error: Error) => {
          console.error('❌ Screen capture failed with error:', error);
        });
    });

    const toggleRet = globalShortcut.register('CommandOrControl+Shift+A', () => {
      console.log('Toggle overlay shortcut triggered');
      if (this.mainWindow) {
        if (this.mainWindow.isVisible()) {
          this.mainWindow.hide();
        } else {
          this.mainWindow.show();
          this.mainWindow.focus();
        }
      }
    });

    if (!captureRet || !toggleRet) {
      console.log('Global shortcut registration failed');
    }
  }

  private setupContextMenu(): void {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show/Hide',
        click: () => {
          if (this.mainWindow) {
            if (this.mainWindow.isVisible()) {
              this.mainWindow.hide();
            } else {
              this.mainWindow.show();
              this.mainWindow.focus();
            }
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Capture Screen',
        accelerator: 'CommandOrControl+Shift+S',
        click: () => {
          this.screenCaptureService.startCapture()
            .then((captureResult) => {
              if (captureResult && this.mainWindow) {
                this.mainWindow.webContents.send('screen-captured', captureResult.imagePath);
                this.mainWindow.show();
                this.mainWindow.focus();
              }
            })
            .catch((error: Error) => {
              console.error('Screen capture failed:', error);
            });
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => {
          app.quit();
        }
      }
    ]);

    if (this.mainWindow) {
      this.mainWindow.webContents.on('context-menu', () => {
        contextMenu.popup();
      });
    }
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }
}

let appInstance: Application;

app.whenReady().then(() => {
  console.log('🚀 App ready event triggered');
  
  try {
    console.log('📊 Initializing database...');
    initDatabase();
    console.log('✅ Database initialized successfully');
    
    console.log('🔄 Setting up IPC handlers...');
    setupIpcHandlers();
    console.log('✅ IPC handlers setup complete');
    
    console.log('🏗️ Creating application instance...');
    appInstance = new Application();
    console.log('✅ Application instance created');
  } catch (error) {
    console.error('❌ Error during app initialization:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
  }
}).catch((error) => {
  console.error('❌ App whenReady failed:', error);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    appInstance = new Application();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

export { Application };
