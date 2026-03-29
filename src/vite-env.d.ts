/// <reference types="vite/client" />

interface UpdateEvent {
  type: 'checking' | 'available' | 'not-available' | 'progress' | 'downloaded' | 'error';
  version?: string;
  percent?: number;
  bytesPerSecond?: number;
  transferred?: number;
  total?: number;
  message?: string;
}

interface ElectronAPI {
  saveFile(content: string): Promise<{ success: boolean; filePath?: string; cancelled?: boolean; error?: string }>;
  serialCommunicate(command: string): Promise<{ success: boolean; data?: string; error?: string }>;
  aiGenerate(prompt: string, apiKey: string, provider: string): Promise<{ code?: string; error?: string }>;
  getVersion(): Promise<string>;
  checkForUpdate(): Promise<{ checking: boolean; message?: string }>;
  installUpdate(): Promise<void>;
  onUpdateEvent(callback: (type: string, data?: UpdateEvent) => void): void;
  encryptApiKey(key: string): Promise<void>;
  getEncryptedApiKey(): Promise<string>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
