import React, { useState, useEffect, useRef } from 'react';
import { SelectionArea } from '@/shared/types';

interface ScreenSelectorProps {
  onSelection: (area: SelectionArea) => void;
  onCancel: () => void;
}

const ScreenSelector: React.FC<ScreenSelectorProps> = ({
  onSelection,
  onCancel,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsSelecting(true);
    setStartPosition({ x: e.clientX, y: e.clientY });
    setCurrentPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSelecting) {
      setCurrentPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isSelecting) {
      const selection: SelectionArea = {
        startX: Math.min(startPosition.x, e.clientX),
        startY: Math.min(startPosition.y, e.clientY),
        endX: Math.max(startPosition.x, e.clientX),
        endY: Math.max(startPosition.y, e.clientY),
      };

      // Only proceed if the selection has meaningful dimensions
      if (Math.abs(selection.endX - selection.startX) > 10 && 
          Math.abs(selection.endY - selection.startY) > 10) {
        onSelection(selection);
      } else {
        onCancel();
      }
      
      setIsSelecting(false);
    }
  };

  const getSelectionStyle = () => {
    if (!isSelecting) return { display: 'none' };

    const left = Math.min(startPosition.x, currentPosition.x);
    const top = Math.min(startPosition.y, currentPosition.y);
    const width = Math.abs(currentPosition.x - startPosition.x);
    const height = Math.abs(currentPosition.y - startPosition.y);

    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      display: 'block',
    };
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 cursor-crosshair"
      style={{ background: 'rgba(0, 0, 0, 0.3)' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Instructions */}
      <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-60">
        <div className="bg-black/80 text-white px-6 py-3 rounded-lg backdrop-blur-md">
          <p className="text-sm">
            Click and drag to select an area • Press <kbd className="px-2 py-1 bg-white/20 rounded">ESC</kbd> to cancel
          </p>
        </div>
      </div>

      {/* Selection area */}
      <div
        className="absolute border-2 border-blue-400 bg-blue-400/10 pointer-events-none"
        style={{
          ...getSelectionStyle(),
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
        }}
      />

      {/* Selection coordinates display */}
      {isSelecting && (
        <div 
          className="absolute bg-black/80 text-white px-2 py-1 rounded text-xs pointer-events-none z-60"
          style={{
            left: `${currentPosition.x + 10}px`,
            top: `${currentPosition.y - 30}px`,
          }}
        >
          {Math.abs(currentPosition.x - startPosition.x)} × {Math.abs(currentPosition.y - startPosition.y)}
        </div>
      )}
    </div>
  );
};

export default ScreenSelector;
