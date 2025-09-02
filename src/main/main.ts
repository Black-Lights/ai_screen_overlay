import { app, BrowserWindow, globalShortcut, Menu } from 'electron';
import { join } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import { initDatabase } from './database';
import { setupIpcHandlers } from './ipc-handlers';
import { ScreenCaptureService } from './screen-capture';

// Load environment variables from .env file manually
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
      minHeight: 400,
      minWidth: 350,
      maxHeight: 1400,
      maxWidth: 1000,
      show: false,
      frame: true, // Keep frame for smooth dragging
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden', // Hide title bar content but keep frame
      backgroundColor: '#1f1f1f',
      alwaysOnTop: false, // Start with alwaysOnTop false, we'll set it when needed
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

    // Set custom title
    this.mainWindow.setTitle('AI Screen Overlay');

    Menu.setApplicationMenu(null);
    console.log('🍽️ App menu disabled');

    // Determine the correct HTML file path for production builds
    let htmlPath: string;
    if (isDev) {
      console.log('🔧 Development mode: loading built React files');
      htmlPath = join(__dirname, '../../../dist/renderer/index.html');
    } else {
      console.log('📦 Production mode: loading from resources path');
      // In production, the files are in the resources/app.asar/dist/renderer/ directory
      const possiblePaths = [
        join(__dirname, '../renderer/index.html'),
        join(__dirname, '../../dist/renderer/index.html'),
        join(process.resourcesPath, 'app.asar', 'dist', 'renderer', 'index.html'),
        join(process.resourcesPath, 'app', 'dist', 'renderer', 'index.html')
      ];
      
      htmlPath = possiblePaths.find(path => {
        const exists = require('fs').existsSync(path);
        console.log(`📁 Checking path: ${path} - ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
        return exists;
      }) || possiblePaths[0];
      
      console.log(`📍 Using HTML path: ${htmlPath}`);
    }

    this.mainWindow.loadFile(htmlPath);

    this.mainWindow.once('ready-to-show', () => {
      console.log('👁️ Window ready to show');
      this.mainWindow?.show();
      this.mainWindow?.focus();
      // Set alwaysOnTop after window is shown for better behavior
      setTimeout(() => {
        if (this.mainWindow) {
          this.mainWindow.setAlwaysOnTop(true, 'floating');
          console.log('📌 Window set to always on top');
        }
      }, 500);
      console.log('🎯 Window shown and focused');
    });

    this.mainWindow.on('closed', () => {
      console.log('🗑️ Main window closed');
      this.mainWindow = null;
    });

    // Add error handling for failed loads
    this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('❌ Failed to load:', { errorCode, errorDescription, validatedURL });
    });

    this.mainWindow.webContents.on('dom-ready', () => {
      console.log('🎯 DOM ready - page loaded successfully');
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
      
      // Force cleanup of any existing selection windows first
      if (this.screenCaptureService) {
        console.log('🧹 Forcing cleanup before new capture...');
        this.screenCaptureService.forceCleanup();
      }
      
      // Hide the main window before capturing to avoid capturing it
      const wasVisible = this.mainWindow?.isVisible() || false;
      if (this.mainWindow && wasVisible) {
        this.mainWindow.hide();
        console.log('🫥 Main window hidden for screen capture');
      }
      
      // Set alwaysOnTop to false during capture to avoid interference
      if (this.mainWindow) {
        this.mainWindow.setAlwaysOnTop(false);
      }
      
      // Wait longer for all windows to settle before starting capture
      setTimeout(() => {
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
                // Set alwaysOnTop back to true after a delay to ensure proper focus
                setTimeout(() => {
                  if (this.mainWindow) {
                    this.mainWindow.setAlwaysOnTop(true, 'floating');
                    console.log('📌 Window set back to always on top');
                  }
                }, 800);
                console.log('🪟 Main window shown, focused, and will be set to stay on top');
              } else {
                console.log('❌ Main window not available');
              }
            } else {
              console.log('❌ Screen capture returned null (canceled or failed)');
              // Still show the window even if capture failed, but only if it was visible before
              if (this.mainWindow && wasVisible) {
                this.mainWindow.show();
                this.mainWindow.focus();
                setTimeout(() => {
                  if (this.mainWindow) {
                    this.mainWindow.setAlwaysOnTop(true, 'floating');
                  }
                }, 300);
              }
            }
          })
          .catch((error: Error) => {
            console.error('❌ Screen capture failed with error:', error);
            // Show the window even if capture failed, but only if it was visible before
            if (this.mainWindow && wasVisible) {
              this.mainWindow.show();
              this.mainWindow.focus();
              setTimeout(() => {
                if (this.mainWindow) {
                  this.mainWindow.setAlwaysOnTop(true, 'floating');
                }
              }, 300);
            }
          });
      }, 500); // Longer delay to ensure clean capture and all overlays are hidden
    });

    const toggleRet = globalShortcut.register('CommandOrControl+Shift+A', () => {
      console.log('🔄 Toggle overlay shortcut triggered');
      if (this.mainWindow) {
        if (this.mainWindow.isVisible()) {
          console.log('🫥 Hiding main window');
          this.mainWindow.hide();
          this.mainWindow.setAlwaysOnTop(false);
        } else {
          console.log('👁️ Showing main window');
          this.mainWindow.show();
          this.mainWindow.focus();
          // Set alwaysOnTop after showing to ensure it works properly
          setTimeout(() => {
            if (this.mainWindow) {
              this.mainWindow.setAlwaysOnTop(true, 'floating');
            }
          }, 100);
        }
      }
    });

    if (!captureRet || !toggleRet) {
      console.log('❌ Global shortcut registration failed');
    } else {
      console.log('✅ Global shortcuts registered successfully');
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
