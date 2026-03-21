// Preload script for security
// This runs before the web page loads

const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  version: process.versions.electron
});

console.log('Hostel Music Queue Admin - Electron App Loaded');
