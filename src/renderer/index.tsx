// Global polyfills must be first
if (typeof global === 'undefined') {
  (window as any).global = globalThis;
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

console.log('🎬 React index.tsx starting...');
console.log('🔍 Looking for root element...');

const rootElement = document.getElementById('root');
console.log('📍 Root element:', rootElement);

if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found, creating React root...');
  const root = ReactDOM.createRoot(rootElement as HTMLElement);
  
  console.log('🚀 Rendering App component...');
  root.render(<App />);
  console.log('✅ App rendered successfully');
}
