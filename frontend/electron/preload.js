const { contextBridge, ipcRenderer } = require('electron')

// Expose safe IPC API to renderer (React app)
contextBridge.exposeInMainWorld('neo', {
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  },
  backend: {
    isRunning: () => ipcRenderer.invoke('backend:is-running'),
    port: () => ipcRenderer.invoke('backend:port'),
  },
  app: {
    version: () => ipcRenderer.invoke('app:version'),
    path: () => ipcRenderer.invoke('app:path'),
    platform: () => ipcRenderer.invoke('app:platform'),
  },
})
