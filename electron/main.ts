import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { writeFileSync } from 'fs';
import { GoogleGenAI } from '@google/genai';

let mainWindow: BrowserWindow | null = null;

const isPackaged = app.isPackaged;
const DIST = isPackaged
  ? path.join(process.resourcesPath, 'app.asar', 'dist')
  : path.join(__dirname, '../dist');
const ELECTRON_DIST = isPackaged
  ? path.join(process.resourcesPath, 'app.asar', 'dist-electron')
  : __dirname;

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
      sandbox: true,
      preload: path.join(ELECTRON_DIST, 'preload.js'),
    },
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
          ]
        }
      });
    }
  );

  if (isPackaged) {
    mainWindow.loadFile(path.join(DIST, 'index.html'));
  } else {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || `http://localhost:5173`);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ── IPC: Save file ──────────────────────────────────────────
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

  if (canceled || !filePath) return { cancelled: true };

  try {
    writeFileSync(filePath, content, 'utf-8');
    return { success: true, filePath };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// ── IPC: AI Generate ────────────────────────────────────────
ipcMain.handle('ai-generate', async (_event, prompt, apiKey) => {
  if (!apiKey) return { error: 'No API key provided. Please connect your AI provider.' };
  try {
    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `You are an AI assistant that generates Python-like scripts for a 3D robot.
The robot supports the following commands:
- robot.walk.forward(steps=N)
- robot.walk.backward(steps=N)
- robot.jump(height=N)
- robot.turn.left(angle=N)
- robot.turn.right(angle=N)
- robot.head.look_left()
- robot.head.look_right()
- robot.head.center()
- robot.head.nod(times=N)
- robot.head.tilt(angle=N)
- robot.left_hand.raise()
- robot.left_hand.lower()
- robot.left_hand.wave(times=N)
- robot.right_hand.raise()
- robot.right_hand.lower()
- robot.right_hand.wave(times=N)
- robot.right_arm.elbow.bend(angle=N)
- robot.left_arm.elbow.bend(angle=N)
- robot.right_arm.shoulder.raise(angle=N)
- robot.left_arm.shoulder.raise(angle=N)
- robot.torso.chest.rotate(angle=N)
- robot.crouch()
- robot.lay_down()
- robot.stand_on_one_leg(leg='left'|'right')
- robot.stand_up()
- robot.reset()
- robot.idle()
- robot.wait(seconds=N)
- robot.play(animation='name')

Generate ONLY the script code. Do not include markdown formatting. Just the code.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: { systemInstruction, temperature: 0.2 }
    });

    let generatedCode = response.text || '';
    generatedCode = generatedCode.replace(/^```[a-z]*\n/gm, '').replace(/```$/gm, '').trim();
    return { code: generatedCode };
  } catch (err: any) {
    return { error: err.message };
  }
});

// ── IPC: Serial placeholder ─────────────────────────────────
ipcMain.handle('serial-communicate', async (_event, command: string) => {
  console.log('[serial-communicate] Received command:', command);
  return { success: false, error: 'Serial communication not yet implemented' };
});

// ── IPC: Version ────────────────────────────────────────────
ipcMain.handle('get-version', () => app.getVersion());

// ── IPC: Auto-Update ────────────────────────────────────────
ipcMain.handle('check-for-update', async () => {
  if (!isPackaged) return { checking: false, message: 'Updates only available in packaged app' };

  try {
    const { autoUpdater } = await import('electron-updater');
    const updater = autoUpdater;

    updater.on('checking-for-update', () => {
      mainWindow?.webContents.send('update-event', { type: 'checking' });
    });

    updater.on('update-available', (info) => {
      mainWindow?.webContents.send('update-event', { type: 'available', version: info.version });
    });

    updater.on('update-not-available', () => {
      mainWindow?.webContents.send('update-event', { type: 'not-available' });
    });

    updater.on('download-progress', (progress) => {
      mainWindow?.webContents.send('update-event', {
        type: 'progress',
        percent: Math.round(progress.percent),
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total
      });
    });

    updater.on('update-downloaded', (info) => {
      mainWindow?.webContents.send('update-event', { type: 'downloaded', version: info.version });
    });

    updater.on('error', (err) => {
      mainWindow?.webContents.send('update-event', { type: 'error', message: err.message });
    });

    updater.autoDownload = true;
    updater.autoInstallOnAppQuit = false;
    await updater.checkForUpdates();
    return { checking: true };
  } catch (err: any) {
    return { checking: false, message: err.message };
  }
});

ipcMain.handle('install-update', async () => {
  try {
    const { autoUpdater } = await import('electron-updater');
    autoUpdater.quitAndInstall(false, true);
  } catch (err: any) {
    return { error: err.message };
  }
});

// ── App Lifecycle ───────────────────────────────────────────
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
