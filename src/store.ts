import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import { getGrokApiKey } from './utils/grokKey';

const KeyframeSchema = z.object({
  id: z.string(),
  time: z.number(),
  rootOffset: z.object({ y: z.number() }).default({ y: 0 }),
  easing: z.enum(['linear', 'ease-in', 'ease-out', 'ease-in-out', 'bounce']).default('linear'),
  rotations: z.record(z.string(), z.object({ x: z.number(), y: z.number(), z: z.number() }))
});

const CustomAnimationSchema = z.object({
  id: z.string(),
  name: z.string(),
  duration: z.number(),
  keyframes: z.array(KeyframeSchema).optional(),
  rotations: z.record(z.string(), z.object({ x: z.number(), y: z.number(), z: z.number() })).optional(),
  rootOffset: z.object({ y: z.number() }).optional(),
});

const StorageSchema = z.object({
  customAnimations: z.array(CustomAnimationSchema).optional(),
  code: z.string().optional(),
  aiProvider: z.enum(['gemini', 'openai', 'claude', 'grok']).optional()
});

export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';

export type AIProvider = 'gemini' | 'openai' | 'claude' | 'grok';

export interface LogEntry {
  id: number;
  type: 'INFO' | 'ACTION' | 'SUCCESS' | 'ERROR' | 'WARN';
  message: string;
}

export interface Keyframe {
  id: string;
  time: number; // 0 to 1
  rotations: Record<string, { x: number; y: number; z: number }>;
  rootOffset: { y: number };
  easing: EasingType;
}

export interface CustomAnimation {
  id: string;
  name: string;
  duration: number;
  keyframes: Keyframe[];
}

export interface ProjectFile {
  id: string;
  name: string;
  type: 'file';
  content: string;
  language: 'python' | 'json';
  createdAt: number;
  updatedAt: number;
}

export interface ProjectFolder {
  id: string;
  name: string;
  type: 'folder';
  children: (ProjectFile | ProjectFolder)[];
  createdAt: number;
  updatedAt: number;
}

export type ProjectItem = ProjectFile | ProjectFolder;

export interface Project {
  id: string;
  name: string;
  root: ProjectItem[];
  activeFileId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  code: string;
  animations: CustomAnimation[];
}

interface AppState {
  view: 'editor' | 'animator';
  customAnimations: CustomAnimation[];
  activeAnimationId: string | null;
  activeKeyframeId: string | null;
  isRunning: boolean;
  code: string;
  logs: LogEntry[];
  activePart: string | null;
  playbackTime: number;
  isPlaying: boolean;
  loopPlayback: boolean;
  undoStack: CustomAnimation[][];
  redoStack: CustomAnimation[][];
  geminiApiKey: string;
  aiProvider: AIProvider;
  useBuiltInKey: boolean;
  activeDebugLine: number | null;
  isDebugMode: boolean;
  debugResolver: (() => void) | null;
  project: Project | null;
  isProjectDirty: boolean;
  showCommandPalette: boolean;
  showHelpModal: boolean;
  showTemplateModal: boolean;
  setView: (view: 'editor' | 'animator') => void;
  setCustomAnimations: (anims: CustomAnimation[]) => void;
  setActiveAnimationId: (id: string | null) => void;
  setActiveKeyframeId: (id: string | null) => void;
  setRunning: (running: boolean) => void;
  setActiveDebugLine: (line: number | null) => void;
  setIsDebugMode: (mode: boolean) => void;
  setDebugResolver: (resolver: (() => void) | null) => void;
  stepNext: () => void;
  setCode: (code: string) => void;
  addLog: (type: LogEntry['type'], message: string) => void;
  clearLogs: () => void;
  setActivePart: (part: string | null) => void;
  setPlaybackTime: (t: number) => void;
  setPlaying: (p: boolean) => void;
  setLoopPlayback: (l: boolean) => void;
  pushUndo: () => void;
  undo: () => void;
  redo: () => void;
  updateCustomAnimations: (fn: (anims: CustomAnimation[]) => CustomAnimation[]) => void;
  setGeminiApiKey: (key: string) => void;
  setAiProvider: (p: AIProvider) => void;
  clearApiKey: () => void;
  setProject: (project: Project | null) => void;
  setProjectDirty: (dirty: boolean) => void;
  setShowCommandPalette: (show: boolean) => void;
  setShowHelpModal: (show: boolean) => void;
  setShowTemplateModal: (show: boolean) => void;
  createNewProject: (name: string) => void;
  createFile: (parentId: string | null, name: string, content?: string) => void;
  createFolder: (parentId: string | null, name: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  renameItem: (itemId: string, newName: string) => void;
  deleteItem: (itemId: string) => void;
  setActiveFile: (fileId: string | null) => void;
}

let logId = 0;
const MAX_UNDO = 30;
const MAX_LOGS = 500;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: 'editor',
      customAnimations: [
        {
          id: 'crouch',
          name: 'Custom Crouch',
          duration: 1000,
          keyframes: [
            {
              id: 'kf1',
              time: 1,
              rootOffset: { y: -0.4 },
              easing: 'ease-in-out',
              rotations: {
                left_thigh: { x: -1.05, y: 0, z: 0 },
                right_thigh: { x: -1.05, y: 0, z: 0 },
                left_shin: { x: 2.1, y: 0, z: 0 },
                right_shin: { x: 2.1, y: 0, z: 0 },
                left_foot: { x: -1.05, y: 0, z: 0 },
                right_foot: { x: -1.05, y: 0, z: 0 },
                left_upper_arm: { x: -0.5, y: 0, z: 0 },
                right_upper_arm: { x: -0.5, y: 0, z: 0 },
                torso: { x: 0.3, y: 0, z: 0 }
              }
            }
          ]
        },
        {
          id: 'lay_down',
          name: 'Custom Lay Down',
          duration: 1500,
          keyframes: [
            {
              id: 'kf1',
              time: 1,
              rootOffset: { y: -1.0 },
              easing: 'ease-in-out',
              rotations: {
                root: { x: -Math.PI / 2, y: 0, z: 0 },
                left_upper_arm: { x: -Math.PI / 2, y: 0, z: 0 },
                right_upper_arm: { x: -Math.PI / 2, y: 0, z: 0 }
              }
            }
          ]
        }
      ],
      activeAnimationId: null,
      activeKeyframeId: null,
      isRunning: false,
      code: `# Welcome to Humanoid Code Lab!
robot.walk.forward(steps=2)
robot.turn.left(angle=90)
robot.left_hand.wave(times=2)
robot.stand_up()
robot.idle()`,
      logs: [],
      activePart: null,
      playbackTime: 0,
      isPlaying: false,
      loopPlayback: false,
      undoStack: [],
      redoStack: [],
      geminiApiKey: '',
      aiProvider: 'grok',
      useBuiltInKey: false,
      activeDebugLine: null,
      isDebugMode: false,
      debugResolver: null,
      setView: (view) => set({ view }),
      setCustomAnimations: (customAnimations) => set({ customAnimations }),
      setActiveAnimationId: (activeAnimationId) => set({ activeAnimationId }),
      setActiveKeyframeId: (activeKeyframeId) => set({ activeKeyframeId }),
      setRunning: (isRunning) => set({ isRunning }),
      setActiveDebugLine: (activeDebugLine) => set({ activeDebugLine }),
      setIsDebugMode: (isDebugMode) => set({ isDebugMode }),
      setDebugResolver: (debugResolver) => set({ debugResolver }),
      stepNext: () => {
        const state = get();
        if (state.debugResolver) {
          state.debugResolver();
          set({ debugResolver: null });
        }
      },
      setCode: (code) => set({ code }),
      addLog: (type, message) => set((state) => { 
        const newLogs = [...state.logs, { id: logId++, type, message }];
        if (newLogs.length > MAX_LOGS) {
          newLogs.splice(0, newLogs.length - MAX_LOGS);
        }
        return { logs: newLogs };
      }),
      clearLogs: () => set({ logs: [] }),
      setActivePart: (activePart) => set({ activePart }),
      setPlaybackTime: (playbackTime) => set({ playbackTime }),
      setPlaying: (isPlaying) => set({ isPlaying }),
      setLoopPlayback: (loopPlayback) => set({ loopPlayback }),
      pushUndo: () => {
        const state = get();
        const stack = [...state.undoStack, JSON.parse(JSON.stringify(state.customAnimations))];
        set({ undoStack: stack.slice(-MAX_UNDO), redoStack: [] });
      },
      undo: () => {
        const state = get();
        if (state.undoStack.length === 0) return;
        const prev = state.undoStack[state.undoStack.length - 1];
        const newUndo = state.undoStack.slice(0, -1);
        set({
          undoStack: newUndo,
          redoStack: [...state.redoStack, JSON.parse(JSON.stringify(state.customAnimations))],
          customAnimations: prev
        });
      },
      redo: () => {
        const state = get();
        if (state.redoStack.length === 0) return;
        const next = state.redoStack[state.redoStack.length - 1];
        const newRedo = state.redoStack.slice(0, -1);
        set({
          redoStack: newRedo,
          undoStack: [...state.undoStack, JSON.parse(JSON.stringify(state.customAnimations))],
          customAnimations: next
        });
      },
      updateCustomAnimations: (fn) => {
        const state = get();
        const newAnims = fn(state.customAnimations);
        set({ customAnimations: newAnims });
      },
      setGeminiApiKey: (geminiApiKey) => {
        if (window.electronAPI) window.electronAPI.encryptApiKey(geminiApiKey);
        set({ geminiApiKey });
      },
      setAiProvider: (aiProvider: AIProvider) => {
        // When switching to grok, use the built-in key
        if (aiProvider === 'grok') {
          const builtInKey = getGrokApiKey();
          set({ aiProvider, geminiApiKey: builtInKey, useBuiltInKey: true });
        } else {
          set({ aiProvider, useBuiltInKey: false });
        }
      },
      clearApiKey: () => {
        if (window.electronAPI) window.electronAPI.encryptApiKey('');
        set({ geminiApiKey: getGrokApiKey(), aiProvider: 'grok', useBuiltInKey: true });
      },
      project: null,
      isProjectDirty: false,
      showCommandPalette: false,
      showHelpModal: false,
      showTemplateModal: false,
      setProject: (project) => set({ project }),
      setProjectDirty: (isProjectDirty) => set({ isProjectDirty }),
      setShowCommandPalette: (showCommandPalette) => set({ showCommandPalette }),
      setShowHelpModal: (showHelpModal) => set({ showHelpModal }),
      setShowTemplateModal: (showTemplateModal) => set({ showTemplateModal }),
      createNewProject: (name) => {
        const mainFile: ProjectFile = {
          id: 'main-' + Date.now(),
          name: 'main.py',
          type: 'file',
          content: `# ${name} - Humanoid Code Lab\n\nrobot.walk.forward(steps=3)\n`,
          language: 'python',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        const project: Project = {
          id: 'proj-' + Date.now(),
          name,
          root: [mainFile],
          activeFileId: mainFile.id,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        set({ 
          project, 
          code: mainFile.content, 
          isProjectDirty: false,
          customAnimations: []
        });
      },
      createFile: (parentId, name, content = '') => {
        const state = get();
        if (!state.project) return;
        const newFile: ProjectFile = {
          id: 'file-' + Date.now(),
          name,
          type: 'file',
          content,
          language: name.endsWith('.json') ? 'json' : 'python',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        const findAndAdd = (items: ProjectItem[]): ProjectItem[] => {
          if (!parentId) return [...items, newFile];
          return items.map(item => {
            if (item.id === parentId && item.type === 'folder') {
              return { ...item, children: [...item.children, newFile], updatedAt: Date.now() };
            }
            if (item.type === 'folder') {
              return { ...item, children: findAndAdd(item.children), updatedAt: Date.now() };
            }
            return item;
          });
        };
        const newRoot = findAndAdd(state.project.root);
        const updatedProject = { ...state.project, root: newRoot, updatedAt: Date.now() };
        set({ project: updatedProject, isProjectDirty: true });
      },
      createFolder: (parentId, name) => {
        const state = get();
        if (!state.project) return;
        const newFolder: ProjectFolder = {
          id: 'folder-' + Date.now(),
          name,
          type: 'folder',
          children: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        const findAndAdd = (items: ProjectItem[]): ProjectItem[] => {
          if (!parentId) return [...items, newFolder];
          return items.map(item => {
            if (item.id === parentId && item.type === 'folder') {
              return { ...item, children: [...item.children, newFolder], updatedAt: Date.now() };
            }
            if (item.type === 'folder') {
              return { ...item, children: findAndAdd(item.children), updatedAt: Date.now() };
            }
            return item;
          });
        };
        const newRoot = parentId ? findAndAdd(state.project.root) : [...state.project.root, newFolder];
        const updatedProject = { ...state.project, root: newRoot, updatedAt: Date.now() };
        set({ project: updatedProject, isProjectDirty: true });
      },
      updateFileContent: (fileId, content) => {
        const state = get();
        if (!state.project) return;
        const updateInTree = (items: ProjectItem[]): ProjectItem[] => {
          return items.map(item => {
            if (item.id === fileId && item.type === 'file') {
              return { ...item, content, updatedAt: Date.now() };
            }
            if (item.type === 'folder') {
              return { ...item, children: updateInTree(item.children), updatedAt: Date.now() };
            }
            return item;
          });
        };
        const newRoot = updateInTree(state.project.root);
        const findFileRecursive = (items: ProjectItem[]): ProjectFile | null => {
          for (const item of items) {
            if (item.id === fileId && item.type === 'file') return item;
            if (item.type === 'folder' && 'children' in item) {
              const found = findFileRecursive(item.children);
              if (found) return found;
            }
          }
          return null;
        };
        const file = findFileRecursive(state.project.root);
        if (file && file.type === 'file') {
          set({ 
            project: { ...state.project, root: newRoot, updatedAt: Date.now() },
            code: content,
            isProjectDirty: true
          });
        }
      },
      renameItem: (itemId, newName) => {
        const state = get();
        if (!state.project) return;
        const renameInTree = (items: ProjectItem[]): ProjectItem[] => {
          return items.map(item => {
            if (item.id === itemId) {
              return { ...item, name: newName, updatedAt: Date.now() };
            }
            if (item.type === 'folder') {
              return { ...item, children: renameInTree(item.children), updatedAt: Date.now() };
            }
            return item;
          });
        };
        const newRoot = renameInTree(state.project.root);
        set({ 
          project: { ...state.project, root: newRoot, updatedAt: Date.now() },
          isProjectDirty: true
        });
      },
      deleteItem: (itemId) => {
        const state = get();
        if (!state.project) return;
        const deleteInTree = (items: ProjectItem[]): ProjectItem[] => {
          return items.filter(item => item.id !== itemId).map(item => {
            if (item.type === 'folder') {
              return { ...item, children: deleteInTree(item.children), updatedAt: Date.now() };
            }
            return item;
          });
        };
        const newRoot = deleteInTree(state.project.root);
        const isDeletingActiveFile = state.project.activeFileId === itemId;
        const activeFileId = isDeletingActiveFile ? null : state.project.activeFileId;
        
        // Clear code if deleting the active file
        const newCode = isDeletingActiveFile ? '' : state.code;
        
        set({ 
          project: { ...state.project, root: newRoot, activeFileId, updatedAt: Date.now() },
          code: newCode,
          isProjectDirty: true
        });
      },
      setActiveFile: (fileId) => {
        const state = get();
        if (!state.project) return;
        const findFile = (items: ProjectItem[]): ProjectFile | null => {
          for (const item of items) {
            if (item.id === fileId && item.type === 'file') return item;
            if (item.type === 'folder') {
              const found = findFile(item.children);
              if (found) return found;
            }
          }
          return null;
        };
        const file = findFile(state.project.root);
        if (file && file.type === 'file') {
          set({ 
            project: { ...state.project, activeFileId: fileId },
            code: file.content
          });
        }
      }
    }),
    {
      name: 'humanoid-storage',
      // SEC-02: Remote API Keys should never be serialized to basic localStorage. 
      // It should be fetched synchronously from the secured main-process DB/keychain at boot.
      partialize: (state) => ({ 
        customAnimations: state.customAnimations, 
        code: state.code, 
        aiProvider: state.aiProvider,
        project: state.project,
        isProjectDirty: state.isProjectDirty
      }),
      merge: (persistedState: any, currentState) => {
        const result = StorageSchema.safeParse(persistedState);
        if (!result.success) {
          console.warn('[Zod] LocalStorage hydration failed schema validation. Falling back to defaults.', result.error);
          return currentState;
        }

        const validState = result.data;
        if (validState.customAnimations) {
          validState.customAnimations = validState.customAnimations.map((anim: any) => {
            if (!anim.keyframes && anim.rotations) {
              return {
                ...anim,
                keyframes: [
                  {
                    id: 'migrated-kf',
                    time: 1,
                    rotations: anim.rotations,
                    rootOffset: anim.rootOffset || { y: 0 },
                    easing: 'linear'
                  }
                ]
              };
            }
            return {
              ...anim,
              keyframes: (anim.keyframes || []).map((kf: any) => ({
                ...kf,
                easing: kf.easing || 'linear',
                rootOffset: kf.rootOffset || { y: 0 }
              }))
            };
          }) as unknown as CustomAnimation[];
        }
        return { ...currentState, ...validState } as AppState;
      }
    }
  )
);
