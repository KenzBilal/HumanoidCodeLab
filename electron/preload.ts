import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (content: string) => ipcRenderer.invoke('save-file', content),
  serialCommunicate: (command: string) => ipcRenderer.invoke('serial-communicate', command),
});
