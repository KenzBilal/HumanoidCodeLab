import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { writeFileSync } from 'fs';
import { GoogleGenAI } from '@google/genai';

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

ipcMain.handle('ai-generate', async (_event, prompt) => {
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return { error: 'No API key configured' };
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

Generate ONLY the script code. Do not include markdown formatting like \`\`\`python. Do not include explanations. Just the code.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      }
    });

    let generatedCode = response.text || '';
    generatedCode = generatedCode.replace(/^```[a-z]*\n/gm, '').replace(/```$/gm, '').trim();
    return { code: generatedCode };
  } catch (err: any) {
    return { error: err.message };
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
