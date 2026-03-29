import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { writeFileSync } from 'fs';

let mainWindow: BrowserWindow | null = null;

const DIST = path.join(__dirname, '../dist');
const ELECTRON_DIST = path.join(__dirname);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#282c34',
    title: 'Humanoid Code Lab',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(ELECTRON_DIST, 'preload.js'),
    },
  });

  // In dev, load from Vite dev server. In production, load from built files.
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(DIST, 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC: Save file to disk via native dialog
ipcMain.handle('save-file', async (_event, content: string) => {
  if (!mainWindow) return { success: false, error: 'No window available' };

  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Robot Script',
    defaultPath: 'robot_script.py',
    filters: [
      { name: 'Python Scripts', extensions: ['py'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (canceled || !filePath) {
    return { cancelled: true };
  }

  try {
    writeFileSync(filePath, content, 'utf-8');
    return { success: true, filePath };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// IPC: Serial communication placeholder for future IoT/robot bridging
ipcMain.handle('serial-communicate', async (_event, command: string) => {
  // Placeholder — will be implemented with serialport library
  console.log('[serial-communicate] Received command:', command);
  return { success: false, error: 'Serial communication not yet implemented' };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
