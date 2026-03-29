import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (content: string) => ipcRenderer.invoke('save-file', content),
  serialCommunicate: (command: string) => ipcRenderer.invoke('serial-communicate', command),
  aiGenerate: (prompt: string) => ipcRenderer.invoke('ai-generate', prompt),
  getVersion: () => ipcRenderer.invoke('get-version'),
  checkForUpdate: () => ipcRenderer.invoke('check-for-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onUpdateEvent: (callback: (event: string, data?: any) => void) => {
    ipcRenderer.on('update-event', (_event, data) => {
      callback(data.type, data);
    });
  },
});
