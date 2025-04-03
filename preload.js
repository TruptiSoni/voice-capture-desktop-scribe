
const { contextBridge, ipcRenderer } = require('electron');

// Expose selected Electron APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  saveRecording: async (blobBase64) => {
    return ipcRenderer.invoke('save-recording', blobBase64);
  },
  isElectron: true
});
