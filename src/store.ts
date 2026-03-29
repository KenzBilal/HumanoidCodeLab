import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  setView: (view: 'editor' | 'animator') => void;
  setCustomAnimations: (anims: CustomAnimation[]) => void;
  setActiveAnimationId: (id: string | null) => void;
  setActiveKeyframeId: (id: string | null) => void;
  setRunning: (running: boolean) => void;
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
      code: `# Default Script

robot.play(animation='Custom Crouch')
robot.wait(seconds=1)
robot.play(animation='Custom Lay Down')
robot.wait(seconds=1)
robot.stand_up()
robot.wait(seconds=1)
robot.stand_on_one_leg(leg='left')
robot.wait(seconds=1)
robot.stand_up()
robot.wait(seconds=1)
robot.stand_on_one_leg(leg='right')
robot.wait(seconds=1)
robot.stand_up()
robot.wait(seconds=1)
robot.walk.forward(steps=3)`,
      logs: [],
      activePart: null,
      playbackTime: 0,
      isPlaying: false,
      loopPlayback: false,
      undoStack: [],
      redoStack: [],
      setView: (view) => set({ view }),
      setCustomAnimations: (customAnimations) => set({ customAnimations }),
      setActiveAnimationId: (activeAnimationId) => set({ activeAnimationId }),
      setActiveKeyframeId: (activeKeyframeId) => set({ activeKeyframeId }),
      setRunning: (isRunning) => set({ isRunning }),
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
      }
    }),
    {
      name: 'humanoid-storage',
      partialize: (state) => ({ customAnimations: state.customAnimations, code: state.code }),
      merge: (persistedState: any, currentState) => {
        if (persistedState?.customAnimations) {
          persistedState.customAnimations = persistedState.customAnimations.map((anim: any) => {
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
                easing: kf.easing || 'linear'
              }))
            };
          });
        }
        return { ...currentState, ...persistedState };
      }
    }
  )
);
