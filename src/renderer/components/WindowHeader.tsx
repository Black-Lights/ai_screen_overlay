import React from 'react';

interface WindowHeaderProps {
  title: string;
  onMinimize: () => void;
  onClose: () => void;
  onToggleAlwaysOnTop: () => void;
  isAlwaysOnTop: boolean;
}

const WindowHeader: React.FC<WindowHeaderProps> = ({
  title,
  onMinimize,
  onClose,
  onToggleAlwaysOnTop,
  isAlwaysOnTop,
}) => {
  return (
    <div className="window-header bg-gray-900/95 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-4 py-2 select-none">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <h1 className="text-sm font-medium text-white flex items-center space-x-2">
          <span className="text-blue-400">●</span>
          <span>{title}</span>
        </h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={onToggleAlwaysOnTop}
          className={`p-1.5 rounded transition-colors ${
            isAlwaysOnTop 
              ? 'bg-blue-500/30 text-blue-400' 
              : 'hover:bg-white/10 text-white/60 hover:text-white'
          }`}
          title={isAlwaysOnTop ? "Disable Always on Top" : "Enable Always on Top"}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </button>
        
        <button
          onClick={onMinimize}
          className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title="Minimize"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-red-500/30 text-white/60 hover:text-red-400 transition-colors"
          title="Close"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default WindowHeader;
