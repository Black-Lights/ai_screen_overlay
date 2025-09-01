import { BrowserWindow, screen, desktopCapturer } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { ScreenCapture, SelectionArea } from '@/shared/types';

export class ScreenCaptureService {
  private selectionWindow: BrowserWindow | null = null;
  private isCapturing = false;

  constructor() {
    console.log('🎯 ScreenCaptureService constructor called');
  }

  // Main capture method - fallback to full desktop if selection fails
  async captureScreen(): Promise<string> {
    console.log('📸 captureScreen() called');
    try {
      console.log('🎯 Starting screen capture with selection...');
      const result = await this.startCapture();
      if (result && result.imagePath) {
        console.log('✅ Screen capture with selection completed:', result.imagePath);
        return result.imagePath;
      } else {
        // Fallback to full desktop capture
        console.log('🔄 Selection canceled or failed, capturing full desktop');
        return await this.captureDesktop();
      }
    } catch (error) {
      console.error('❌ Screen capture failed, trying desktop capture:', error);
      return await this.captureDesktop();
    }
  }

  async startCapture(): Promise<ScreenCapture | null> {
    console.log('🚀 startCapture() called');
    if (this.isCapturing) {
      console.log('⚠️ Already capturing, ignoring request');
      return null;
    }

    this.isCapturing = true;
    console.log('Starting screen capture process');

    try {
      // Get all displays
      const displays = screen.getAllDisplays();
      console.log('Found displays:', displays.length);
      
      // Create selection overlay for each display
      await this.createSelectionOverlay(displays);
      console.log('Selection overlay created');
      
      // Wait for user selection
      const selection = await this.waitForSelection();
      console.log('Selection result:', selection);
      
      if (selection) {
        console.log('Processing selection area');
        // Capture the selected area
        const captureResult = await this.captureArea(selection);
        console.log('Capture completed:', captureResult.imagePath);
        return captureResult;
      } else {
        console.log('Selection was canceled or failed');
        return null;
      }
    } catch (error) {
      console.error('Error in screen capture process:', error);
      return null;
    } finally {
      this.cleanup();
      this.isCapturing = false;
      console.log('Screen capture process finished');
    }
  }

  private async createSelectionOverlay(displays: Electron.Display[]): Promise<void> {
    // Get total screen bounds
    const totalBounds = this.getTotalScreenBounds(displays);

    this.selectionWindow = new BrowserWindow({
      x: totalBounds.x,
      y: totalBounds.y,
      width: totalBounds.width,
      height: totalBounds.height,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      fullscreen: false,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'selection-preload.js')
      }
    });

    // Load selection overlay HTML
    const selectionHtml = this.generateSelectionHtml();
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(selectionHtml)}`;
    await this.selectionWindow.loadURL(dataUrl);

    this.selectionWindow.setAlwaysOnTop(true, 'screen-saver');
    
    // Ensure window can receive keyboard events
    this.selectionWindow.setFocusable(true);
    this.selectionWindow.show();
    this.selectionWindow.focus();
    
    // Force focus after a small delay
    setTimeout(() => {
      if (this.selectionWindow && !this.selectionWindow.isDestroyed()) {
        this.selectionWindow.focus();
      }
    }, 100);
    
    // Add global key handler for ESC key as fallback
    this.selectionWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'Escape') {
        console.log('ESC key detected in before-input-event');
        const { ipcMain } = require('electron');
        ipcMain.emit('selection-cancel');
      }
    });
  }

  private getTotalScreenBounds(displays: Electron.Display[]) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    displays.forEach(display => {
      const { x, y, width, height } = display.bounds;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  private generateSelectionHtml(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: rgba(0, 0, 0, 0.3);
            cursor: crosshair;
            user-select: none;
            overflow: hidden;
          }
          .selection-area {
            position: absolute;
            border: 2px solid #3b82f6;
            background: rgba(59, 130, 246, 0.1);
            pointer-events: none;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }
          .instructions {
            position: fixed;
            top: 50px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            z-index: 1000;
            backdrop-filter: blur(10px);
          }
        </style>
      </head>
      <body>
        <div class="instructions">
          <strong>Screen Capture Mode</strong><br>
          • Click and drag to select an area<br>
          • Press ESC to cancel<br>
          • Double-click to cancel
        </div>
        <script>
          let isSelecting = false;
          let startX, startY;
          let selectionDiv = null;

          document.addEventListener('mousedown', (e) => {
            isSelecting = true;
            startX = e.clientX;
            startY = e.clientY;
            
            selectionDiv = document.createElement('div');
            selectionDiv.className = 'selection-area';
            selectionDiv.style.left = startX + 'px';
            selectionDiv.style.top = startY + 'px';
            document.body.appendChild(selectionDiv);
          });

          document.addEventListener('mousemove', (e) => {
            if (!isSelecting || !selectionDiv) return;
            
            const currentX = e.clientX;
            const currentY = e.clientY;
            
            const left = Math.min(startX, currentX);
            const top = Math.min(startY, currentY);
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);
            
            selectionDiv.style.left = left + 'px';
            selectionDiv.style.top = top + 'px';
            selectionDiv.style.width = width + 'px';
            selectionDiv.style.height = height + 'px';
          });

          document.addEventListener('mouseup', (e) => {
            if (!isSelecting) return;
            
            const endX = e.clientX;
            const endY = e.clientY;
            
            // Ensure minimum selection size (at least 10x10 pixels)
            const width = Math.abs(endX - startX);
            const height = Math.abs(endY - startY);
            
            if (width < 10 || height < 10) {
              // Too small, cancel selection
              if (selectionDiv) {
                selectionDiv.remove();
              }
              isSelecting = false;
              return;
            }
            
            const selection = {
              startX: Math.min(startX, endX),
              startY: Math.min(startY, endY),
              endX: Math.max(startX, endX),
              endY: Math.max(startY, endY)
            };
            
            console.log('Selection completed:', selection);
            window.electronAPI?.selectionComplete(selection);
            isSelecting = false;
          });

          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
              console.log('ESC pressed, canceling selection');
              window.electronAPI?.selectionCancel();
            }
          });

          // Also handle click outside to cancel
          document.addEventListener('dblclick', (e) => {
            console.log('Double click detected, canceling selection');
            window.electronAPI?.selectionCancel();
          });
        </script>
      </body>
      </html>
    `;
  }

  private async waitForSelection(): Promise<SelectionArea | null> {
    return new Promise((resolve) => {
      const { ipcMain } = require('electron');
      
      // Set up timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.log('Selection timeout, canceling');
        ipcMain.removeAllListeners('selection-complete');
        ipcMain.removeAllListeners('selection-cancel');
        this.cleanup(); // Clean up immediately on timeout
        resolve(null);
      }, 30000); // 30 seconds timeout
      
      const handleSelection = (_event: any, selection: SelectionArea) => {
        clearTimeout(timeout);
        ipcMain.removeAllListeners('selection-complete');
        ipcMain.removeAllListeners('selection-cancel');
        console.log('Selection received:', selection);
        this.cleanup(); // Clean up immediately after selection
        resolve(selection);
      };

      const handleCancel = () => {
        clearTimeout(timeout);
        ipcMain.removeAllListeners('selection-complete');
        ipcMain.removeAllListeners('selection-cancel');
        console.log('Selection canceled');
        this.cleanup(); // Clean up immediately on cancel
        resolve(null);
      };

      // Set up IPC listeners for selection events
      ipcMain.once('selection-complete', handleSelection);
      ipcMain.once('selection-cancel', handleCancel);
    });
  }

  private async captureArea(selection: SelectionArea): Promise<ScreenCapture> {
    const { startX, startY, endX, endY } = selection;
    const width = endX - startX;
    const height = endY - startY;

    try {
      // Use desktopCapturer to get screen content
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 }
      });

      if (sources.length === 0) {
        throw new Error('No screen sources available');
      }

      // For now, use the first screen source
      const primarySource = sources[0];
      
      // Create temporary directory for screenshots
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `screenshot_${timestamp}.png`;
      const imagePath = path.join(tempDir, filename);

      // For a complete implementation, you would:
      // 1. Use the thumbnail or capture full screen
      // 2. Crop to the selected area
      // 3. Save to file
      
      // Simplified implementation - save thumbnail (in real app, implement proper cropping)
      const thumbnailBuffer = primarySource.thumbnail.toPNG();
      fs.writeFileSync(imagePath, thumbnailBuffer);

      return {
        imagePath,
        bounds: {
          x: startX,
          y: startY,
          width,
          height
        }
      };
    } catch (error) {
      console.error('Screen capture failed:', error);
      throw error;
    }
  }

  private cleanup(): void {
    if (this.selectionWindow) {
      // Ensure window is fully closed and destroyed
      if (!this.selectionWindow.isDestroyed()) {
        this.selectionWindow.close();
      }
      this.selectionWindow = null;
    }
  }

  // Alternative method using screenshot-desktop (for Linux compatibility)
  async captureDesktop(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const screenshot = require('screenshot-desktop');
        
        screenshot({ format: 'png' }, (err: Error, img: Buffer) => {
          if (err) {
            reject(err);
            return;
          }

          // Save screenshot to temp directory
          const tempDir = path.join(process.cwd(), 'temp');
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }

          const timestamp = Date.now();
          const filename = `desktop_${timestamp}.png`;
          const imagePath = path.join(tempDir, filename);
          
          fs.writeFileSync(imagePath, img);
          resolve(imagePath);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
