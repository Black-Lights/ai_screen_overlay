// Global polyfills for Electron renderer process
declare global {
  var global: typeof globalThis;
}

// Ensure global is available before any other modules load
if (typeof global === 'undefined') {
  (globalThis as any).global = globalThis;
}

export {};
