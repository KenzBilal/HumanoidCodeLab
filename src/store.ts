import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';

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
  aiProvider: z.enum(['gemini', 'openai', 'claude']).optional()
});

export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';

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
  aiProvider: 'gemini' | 'openai' | 'claude';
  activeDebugLine: number | null;
  isDebugMode: boolean;
  debugResolver: (() => void) | null;
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
  setAiProvider: (p: 'gemini' | 'openai' | 'claude') => void;
  clearApiKey: () => void;
}

let logId = 0;
const MAX_UNDO = 30;

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
      aiProvider: 'gemini',
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
      addLog: (type, message) => set((state) => ({ logs: [...state.logs, { id: logId++, type, message }] })),
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
      setAiProvider: (aiProvider) => set({ aiProvider }),
      clearApiKey: () => {
        if (window.electronAPI) window.electronAPI.encryptApiKey('');
        set({ geminiApiKey: '', aiProvider: 'gemini' });
      }
    }),
    {
      name: 'humanoid-storage',
      // SEC-02: Remote API Keys should never be serialized to basic localStorage. 
      // It should be fetched synchronously from the secured main-process DB/keychain at boot.
      partialize: (state) => ({ customAnimations: state.customAnimations, code: state.code, aiProvider: state.aiProvider }),
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
