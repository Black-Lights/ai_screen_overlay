import React, { useRef, useEffect, useState } from 'react';
import { Pencil, Eraser, Download, Undo, Redo, Palette } from 'lucide-react';

interface ImageCanvasProps {
  imagePath: string;
  onSave: (editedImagePath: string) => void;
  onClose: () => void;
}

interface DrawingState {
  isDrawing: boolean;
  tool: 'pen' | 'eraser';
  color: string;
  size: number;
  opacity: number;
}

interface DrawingAction {
  type: 'stroke' | 'erase';
  imageData: ImageData;
}

export const ImageCanvas: React.FC<ImageCanvasProps> = ({ imagePath, onSave, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    tool: 'pen',
    color: '#ff0000',
    size: 3,
    opacity: 1
  });
  const [history, setHistory] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{x: number, y: number}[]>([]);

  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000', '#ffffff'];
  const sizes = [1, 2, 3, 5, 8, 12, 16, 20];

  useEffect(() => {
    loadImageToCanvas();
  }, [imagePath]);

  const loadImageToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to match image but limit max size for UI
      const maxWidth = 1200;
      const maxHeight = 800;
      
      let { width, height } = img;
      
      // Scale down if too large
      if (width > maxWidth || height > maxHeight) {
        const scale = Math.min(maxWidth / width, maxHeight / height);
        width = width * scale;
        height = height * scale;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw the image
      ctx.drawImage(img, 0, 0, width, height);
      setImageLoaded(true);
      
      // Save initial state to history
      const initialImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialImageData]);
      setRedoStack([]);
    };
    
    img.onerror = () => {
      console.error('Failed to load image:', imagePath);
    };
    
    // Use file:// protocol for local files in Electron
    img.src = imagePath.startsWith('file://') ? imagePath : `file://${imagePath}`;
  };

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev, imageData]);
    setRedoStack([]); // Clear redo stack when new action is performed
    
    // Limit history to last 20 states to prevent memory issues
    if (history.length > 20) {
      setHistory(prev => prev.slice(-20));
    }
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (!imageLoaded) return;
    
    // Save canvas state before starting to draw
    saveCanvasState();
    
    setDrawingState(prev => ({ ...prev, isDrawing: true }));
    setCurrentStroke([]);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    setCurrentStroke([{x, y}]);
  };

  const draw = (e: React.MouseEvent) => {
    if (!drawingState.isDrawing || !imageLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Set drawing properties
    if (drawingState.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1; // Full opacity for erasing
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = drawingState.color;
      ctx.globalAlpha = drawingState.opacity;
    }
    ctx.lineWidth = drawingState.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Add point to current stroke
    setCurrentStroke(prev => [...prev, {x, y}]);
  };

  const stopDrawing = () => {
    if (!drawingState.isDrawing) return;
    
    setDrawingState(prev => ({ ...prev, isDrawing: false }));
    setCurrentStroke([]);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    // Reset composite operation to default
    ctx.globalCompositeOperation = 'source-over';
  };

  const undo = () => {
    if (history.length <= 1) return; // Keep at least the initial state
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Save current state to redo stack
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setRedoStack(prev => [...prev, currentState]);
    
    // Remove current state from history and go back one step
    const newHistory = [...history];
    const currentToRedo = newHistory.pop();
    const previousState = newHistory[newHistory.length - 1];
    
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      setHistory(newHistory);
    }
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get state from redo stack
    const newRedoStack = [...redoStack];
    const stateToRestore = newRedoStack.pop();
    
    if (stateToRestore) {
      // Save current state to history
      const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory(prev => [...prev, currentState]);
      
      // Restore the redo state
      ctx.putImageData(stateToRestore, 0, 0);
      setRedoStack(newRedoStack);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save current state for undo
    saveCanvasState();
    
    // Clear and reload original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    loadImageToCanvas(); // Reload original image
  };

  const saveImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        // Convert blob to array buffer
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Generate new filename with timestamp
        const timestamp = Date.now();
        const editedPath = imagePath.replace('.png', `_edited_${timestamp}.png`);

        // Save via IPC with proper buffer handling
        await window.electronAPI.saveEditedImage(editedPath, uint8Array);
        onSave(editedPath);
      }, 'image/png');
    } catch (error) {
      console.error('Failed to save edited image:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2">
      <div className="bg-gray-800 rounded-lg p-2 sm:p-4 w-full h-full max-w-7xl max-h-full flex flex-col">
        {/* Toolbar - Make it responsive */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2 sm:mb-4 p-2 sm:p-3 bg-gray-700 rounded-lg">
          {/* Drawing Tools */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setDrawingState(prev => ({ ...prev, tool: 'pen' }))}
              className={`p-1 sm:p-2 rounded text-xs sm:text-sm ${drawingState.tool === 'pen' ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-500`}
              title="Pen Tool"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => setDrawingState(prev => ({ ...prev, tool: 'eraser' }))}
              className={`p-1 sm:p-2 rounded text-xs sm:text-sm ${drawingState.tool === 'eraser' ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-500`}
              title="Eraser Tool"
            >
              <Eraser size={16} />
            </button>
          </div>

          {/* Color Palette - Responsive */}
          <div className="flex items-center gap-1">
            <Palette size={14} className="text-gray-300 mr-1" />
            <div className="flex flex-wrap gap-1">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setDrawingState(prev => ({ ...prev, color }))}
                  className={`w-4 h-4 sm:w-6 sm:h-6 rounded border-2 ${drawingState.color === color ? 'border-white' : 'border-gray-500'}`}
                  style={{ backgroundColor: color }}
                  title={`Color: ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Brush Size - Compact on mobile */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-gray-300 text-xs sm:text-sm">Size:</span>
            <select
              value={drawingState.size}
              onChange={(e) => setDrawingState(prev => ({ ...prev, size: parseInt(e.target.value) }))}
              className="bg-gray-600 text-white px-1 sm:px-2 py-1 rounded text-xs sm:text-sm w-12 sm:w-auto"
            >
              {sizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          {/* Opacity - Compact on mobile */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-gray-300 text-xs sm:text-sm">Op:</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={drawingState.opacity}
              onChange={(e) => setDrawingState(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
              className="w-12 sm:w-20"
            />
            <span className="text-gray-300 text-xs sm:text-sm w-6 sm:w-8">{Math.round(drawingState.opacity * 100)}%</span>
          </div>

          {/* Actions - Responsive layout */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            <button
              onClick={undo}
              disabled={history.length === 0}
              className="p-1 sm:p-2 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo size={14} />
            </button>
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className="p-1 sm:p-2 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo size={14} />
            </button>
            <button
              onClick={clearCanvas}
              className="p-1 sm:p-2 rounded bg-red-600 hover:bg-red-500 text-xs sm:text-sm"
              title="Clear All"
            >
              Clear
            </button>
            <button
              onClick={saveImage}
              className="p-1 sm:p-2 rounded bg-green-600 hover:bg-green-500"
              title="Save Edited Image"
            >
              <Download size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-1 sm:p-2 rounded bg-gray-600 hover:bg-gray-500"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Canvas Container - Responsive */}
        <div className="flex-1 flex justify-center items-center overflow-auto">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="border border-gray-600 cursor-crosshair max-w-full max-h-full"
            style={{ 
              cursor: drawingState.tool === 'eraser' ? 'alias' : 'crosshair',
              touchAction: 'none' // Prevent scrolling on touch devices
            }}
          />
        </div>

        {/* Tool Info - Compact on mobile */}
        <div className="mt-1 sm:mt-2 text-center text-gray-400 text-xs sm:text-sm">
          {drawingState.tool === 'pen' ? '✏️ Pen' : '🧹 Eraser'} | 
          <span style={{ color: drawingState.color }}> ⬤ </span>{drawingState.color} | 
          📏 {drawingState.size}px | 
          ⚫ {Math.round(drawingState.opacity * 100)}%
        </div>
      </div>
    </div>
  );
};
