/// <reference types="vite/client" />

interface ElectronAPI {
  saveFile(content: string): Promise<{ success: boolean; filePath?: string; cancelled?: boolean; error?: string }>;
  serialCommunicate(command: string): Promise<{ success: boolean; data?: string; error?: string }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
