import { contextBridge, ipcRenderer } from 'electron';

// Expose selection API for screen capture overlay
contextBridge.exposeInMainWorld('electronAPI', {
  selectionComplete: (selection: any) => {
    ipcRenderer.send('selection-complete', selection);
  },

  selectionCancel: () => {
    ipcRenderer.send('selection-cancel');
  }
});
