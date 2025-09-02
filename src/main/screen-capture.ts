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
      // Use full display bounds to match what desktop capture sees
      const { x, y, width, height } = display.bounds;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });

    const totalBounds = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };

    console.log('🗺️ Total screen bounds calculation:', {
      displays: displays.map(d => ({ 
        bounds: d.bounds, 
        workArea: d.workArea,
        workAreaOffset: { x: d.workArea.x - d.bounds.x, y: d.workArea.y - d.bounds.y }
      })),
      calculatedTotalBounds: totalBounds
    });

    return totalBounds;
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
            border: 2px dashed #ffffff;
            background: transparent;
            pointer-events: none;
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

    console.log('🎯 Original selection from overlay window:', { startX, startY, endX, endY, width, height });

    // Wait a moment for the overlay window to be completely removed
    console.log('⏳ Waiting for overlay window cleanup to complete...');
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('✅ Overlay cleanup wait completed');

    try {
      // Get all displays and find which one we're actually capturing
      const displays = screen.getAllDisplays();
      const totalBounds = this.getTotalScreenBounds(displays);
      
      console.log('📺 Display information:', {
        displays: displays.map(d => ({ 
          id: d.id, 
          bounds: d.bounds, 
          scaleFactor: d.scaleFactor,
          workArea: d.workArea,
          workAreaOffset: {
            x: d.workArea.x - d.bounds.x,
            y: d.workArea.y - d.bounds.y
          }
        })),
        totalBounds
      });

      // Get primary display to check work area offset
      const primaryDisplay = screen.getPrimaryDisplay();
      const workAreaOffset = {
        x: primaryDisplay.workArea.x - primaryDisplay.bounds.x,
        y: primaryDisplay.workArea.y - primaryDisplay.bounds.y
      };

      console.log('🏢 Work area analysis:', {
        bounds: primaryDisplay.bounds,
        workArea: primaryDisplay.workArea,
        workAreaOffset: workAreaOffset,
        platform: process.platform,
        note: `Work area starts ${workAreaOffset.y}px from top, ${workAreaOffset.x}px from left due to taskbar/panels (Platform: ${process.platform})`
      });

      // The selection coordinates are relative to the overlay window positioned at totalBounds,
      // but we need to account for the work area offset since desktop capture includes areas behind taskbar
      const absoluteStartX = startX + totalBounds.x;
      const absoluteStartY = startY + totalBounds.y;
      const absoluteEndX = endX + totalBounds.x; 
      const absoluteEndY = endY + totalBounds.y;

      console.log('🌍 Translated to absolute screen coordinates (before work area adjustment):', {
        absoluteStartX, absoluteStartY, absoluteEndX, absoluteEndY,
        totalBoundsOffset: { x: totalBounds.x, y: totalBounds.y }
      });

      // Adjust for work area offset - this varies by platform:
      // - Linux: Usually top panels/taskbars, so Y offset is positive
      // - Windows: Usually bottom taskbar, so Y offset is 0 but we may need to account for title bars
      // - macOS: Usually menu bar at top, so Y offset is positive
      let adjustedStartX = absoluteStartX;
      let adjustedStartY = absoluteStartY;
      let adjustedEndX = absoluteEndX;
      let adjustedEndY = absoluteEndY;

      // Only apply work area offset if there's actually an offset (meaning there are panels/taskbars)
      if (workAreaOffset.y !== 0 || workAreaOffset.x !== 0) {
        adjustedStartX = absoluteStartX + workAreaOffset.x;
        adjustedStartY = absoluteStartY + workAreaOffset.y;
        adjustedEndX = absoluteEndX + workAreaOffset.x;
        adjustedEndY = absoluteEndY + workAreaOffset.y;
        
        console.log('🎯 Work area adjusted coordinates:', {
          adjustedStartX, adjustedStartY, adjustedEndX, adjustedEndY,
          appliedOffset: workAreaOffset,
          note: `Applied ${workAreaOffset.x}px horizontal, ${workAreaOffset.y}px vertical offset for ${process.platform}`
        });
      } else {
        console.log('🎯 No work area adjustment needed - work area matches screen bounds');
      }
      // Use desktopCapturer to get screen content
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 4096, height: 4096 } // Get higher resolution
      });

      if (sources.length === 0) {
        throw new Error('No screen sources available');
      }

      console.log('🖥️ Available screen sources:', sources.map(s => ({ 
        id: s.id, 
        name: s.name,
        thumbnailSize: s.thumbnail.getSize()
      })));

      // For now, use the first screen source
      const primarySource = sources[0];
      console.log('📺 Selected screen source:', { 
        id: primarySource.id, 
        name: primarySource.name,
        thumbnailSize: primarySource.thumbnail.getSize()
      });
      
      // Create temporary directory for screenshots
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `screenshot_${timestamp}.png`;
      const imagePath = path.join(tempDir, filename);

      // Get the full screen image
      const fullImage = primarySource.thumbnail;
      const imageSize = fullImage.getSize();
      
      // Use the previously declared primaryDisplay and get screen dimensions
      const screenBounds = primaryDisplay.bounds;
      const scaleFactor = primaryDisplay.scaleFactor;
      
      console.log('🖼️ Primary display info:', {
        id: primaryDisplay.id,
        bounds: screenBounds,
        scaleFactor: scaleFactor,
        workArea: primaryDisplay.workArea
      });
      
      // For high-DPI displays, the image might be larger than the screen bounds
      // Calculate the actual scale factors without double-scaling
      const scaleX = imageSize.width / screenBounds.width;
      const scaleY = imageSize.height / screenBounds.height;
      
      console.log('Debug info:', {
        imageSize,
        screenBounds,
        scaleFactor,
        scaleX,
        scaleY,
        originalSelection: { startX, startY, width, height },
        absoluteSelection: { 
          absoluteStartX: adjustedStartX, 
          absoluteStartY: adjustedStartY, 
          absoluteEndX: adjustedEndX, 
          absoluteEndY: adjustedEndY 
        }
      });
      
      // Use absolute coordinates for scaling (relative to screen origin)
      // But since the captured image is of the entire screen starting at (0,0),
      // we need to adjust the absolute coordinates to be relative to the screen bounds origin
      const relativeStartX = adjustedStartX - screenBounds.x;
      const relativeStartY = adjustedStartY - screenBounds.y;
      const relativeWidth = adjustedEndX - adjustedStartX;
      const relativeHeight = adjustedEndY - adjustedStartY;

      console.log('📐 Coordinates relative to screen bounds:', {
        relativeStartX, relativeStartY, relativeWidth, relativeHeight,
        screenBoundsOrigin: { x: screenBounds.x, y: screenBounds.y }
      });
      
      // Scale the relative coordinates
      const scaledX = Math.round(relativeStartX * scaleX);
      const scaledY = Math.round(relativeStartY * scaleY);
      const scaledWidth = Math.round(relativeWidth * scaleX);
      const scaledHeight = Math.round(relativeHeight * scaleY);
      
      console.log('Scaled coordinates:', { scaledX, scaledY, scaledWidth, scaledHeight });
      
      // Validate and clamp coordinates to ensure they're within image bounds
      const clampedX = Math.max(0, Math.min(scaledX, imageSize.width - 1));
      const clampedY = Math.max(0, Math.min(scaledY, imageSize.height - 1));
      const maxWidth = imageSize.width - clampedX;
      const maxHeight = imageSize.height - clampedY;
      const clampedWidth = Math.max(1, Math.min(scaledWidth, maxWidth));
      const clampedHeight = Math.max(1, Math.min(scaledHeight, maxHeight));
      
      console.log('Clamped coordinates:', { clampedX, clampedY, clampedWidth, clampedHeight });
      
      // Debug: Check what's at the center of our selection before cropping
      const centerX = Math.round(clampedX + clampedWidth / 2);
      const centerY = Math.round(clampedY + clampedHeight / 2);
      console.log('🎯 Center of selection in image coordinates:', { 
        centerX, 
        centerY,
        imageSize: { width: imageSize.width, height: imageSize.height }
      });
      
      // Debug: Show what the center coordinates would be in screen coordinates
      const screenCenterX = Math.round(centerX / scaleX);
      const screenCenterY = Math.round(centerY / scaleY);
      console.log('🎯 Center of selection in screen coordinates:', {
        screenCenterX,
        screenCenterY,
        screenSize: { width: screenBounds.width, height: screenBounds.height },
        note: `Center point on screen is at pixel (${screenCenterX}, ${screenCenterY}). In a 1920x1080 screen, this is ${((screenCenterX/screenBounds.width)*100).toFixed(1)}% from left, ${((screenCenterY/screenBounds.height)*100).toFixed(1)}% from top.`
      });
      
      // Debug: Save the full screenshot with selection area info in filename  
      const fullImagePath = imagePath.replace('.png', '_full_debug.png');
      const fullImageBuffer = fullImage.toPNG();
      fs.writeFileSync(fullImagePath, fullImageBuffer);
      console.log('🐛 Full screenshot saved for debugging:', fullImagePath);
      console.log('🐛 Selection area in full image: x=' + clampedX + ', y=' + clampedY + ', w=' + clampedWidth + ', h=' + clampedHeight);
      console.log('🎯 VERIFICATION: The selected area center is at screen coordinates (' + screenCenterX + ', ' + screenCenterY + ')');
      console.log('🎯 VERIFICATION: This is ' + ((screenCenterX/screenBounds.width)*100).toFixed(1) + '% from left edge, ' + ((screenCenterY/screenBounds.height)*100).toFixed(1) + '% from top edge of your ' + screenBounds.width + 'x' + screenBounds.height + ' screen');
      console.log('🎯 VERIFICATION: Work area offset of ' + workAreaOffset.y + 'px was added to account for taskbar/panels');
      
      // Also save a preview crop showing just the selected area for verification
      const previewCrop = fullImage.crop({
        x: Math.max(0, clampedX - 50),
        y: Math.max(0, clampedY - 50), 
        width: Math.min(clampedWidth + 100, imageSize.width - Math.max(0, clampedX - 50)),
        height: Math.min(clampedHeight + 100, imageSize.height - Math.max(0, clampedY - 50))
      });
      const previewPath = imagePath.replace('.png', '_preview.png');
      fs.writeFileSync(previewPath, previewCrop.toPNG());
      console.log('🔍 Preview of captured area (with 50px border) saved:', previewPath);
      
      // Crop the image to the selected area
      const croppedImage = fullImage.crop({
        x: clampedX,
        y: clampedY,
        width: clampedWidth,
        height: clampedHeight
      });
      
      // Save the cropped image
      const croppedBuffer = croppedImage.toPNG();
      fs.writeFileSync(imagePath, croppedBuffer);

      return {
        imagePath,
        bounds: {
          x: adjustedStartX,
          y: adjustedStartY,
          width: adjustedEndX - adjustedStartX,
          height: adjustedEndY - adjustedStartY
        }
      };
    } catch (error) {
      console.error('Screen capture failed:', error);
      throw error;
    }
  }

  private cleanup(): void {
    console.log('🧹 Starting cleanup process...');
    if (this.selectionWindow) {
      // Ensure window is fully closed and destroyed
      if (!this.selectionWindow.isDestroyed()) {
        console.log('🗑️ Closing selection window...');
        this.selectionWindow.close();
        // Wait a bit for the window to actually close
        setTimeout(() => {
          if (this.selectionWindow && !this.selectionWindow.isDestroyed()) {
            console.log('🔨 Force destroying selection window...');
            this.selectionWindow.destroy();
          }
          this.selectionWindow = null;
          console.log('✅ Selection window cleanup complete');
        }, 100);
      } else {
        console.log('✅ Selection window already destroyed');
        this.selectionWindow = null;
      }
    } else {
      console.log('ℹ️ No selection window to clean up');
    }
  }

  // Public cleanup method for external calls
  public forceCleanup(): void {
    this.cleanup();
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
