/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { OutputPanel } from './components/OutputPanel';
import { Viewport } from './components/Viewport';
import { AnimatorLeftPanel } from './components/AnimatorLeftPanel';
import { AnimatorRightPanel } from './components/AnimatorRightPanel';
import { AnimatorTimelinePanel } from './components/AnimatorTimelinePanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Humanoid } from './engine/Humanoid';
import { useStore } from './store';
import { CommandRegistry } from './engine/CommandRegistry';

export default function App() {
  const [bot, setBot] = useState<Humanoid | null>(null);
  const { addLog, view, undo, redo, customAnimations, activeAnimationId, activeKeyframeId,
    setCustomAnimations, setActiveKeyframeId, pushUndo } = useStore();

  useEffect(() => {
    addLog('INFO', 'Humanoid Code Lab initialized. Ready to run.');
    addLog('INFO', `${CommandRegistry.all().length} commands loaded. Click ▶ Run to start.`);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      // Undo/Redo — works everywhere
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Z') {
        e.preventDefault();
        redo();
        return;
      }

      // Skip other shortcuts when in input fields
      if (isInput) return;

      // Animator shortcuts
      if (view === 'animator') {
        // Ctrl+D — Duplicate keyframe
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
          e.preventDefault();
          const anim = customAnimations.find(a => a.id === activeAnimationId);
          const kf = anim?.keyframes.find(k => k.id === activeKeyframeId);
          if (anim && kf) {
            pushUndo();
            const newKf = {
              ...JSON.parse(JSON.stringify(kf)),
              id: Math.random().toString(36).substr(2, 9),
              time: Math.min(1, kf.time + 0.05)
            };
            const newKeyframes = [...anim.keyframes, newKf].sort((a: any, b: any) => a.time - b.time);
            setCustomAnimations(customAnimations.map(a =>
              a.id === anim.id ? { ...a, keyframes: newKeyframes } : a
            ));
            setActiveKeyframeId(newKf.id);
          }
          return;
        }

        // Delete — Delete keyframe
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const anim = customAnimations.find(a => a.id === activeAnimationId);
          if (anim && anim.keyframes.length > 1 && activeKeyframeId) {
            e.preventDefault();
            pushUndo();
            const newKeyframes = anim.keyframes.filter(k => k.id !== activeKeyframeId);
            setCustomAnimations(customAnimations.map(a =>
              a.id === anim.id ? { ...a, keyframes: newKeyframes } : a
            ));
            setActiveKeyframeId(newKeyframes[0].id);
          }
          return;
        }

        // Arrow keys — Nudge keyframe
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          const anim = customAnimations.find(a => a.id === activeAnimationId);
          const kf = anim?.keyframes.find(k => k.id === activeKeyframeId);
          if (anim && kf) {
            e.preventDefault();
            pushUndo();
            const delta = e.shiftKey ? 0.1 : 0.01;
            const newTime = Math.max(0, Math.min(1, kf.time + (e.key === 'ArrowRight' ? delta : -delta)));
            const newKeyframes = anim.keyframes.map(k =>
              k.id === kf.id ? { ...k, time: newTime } : k
            ).sort((a: any, b: any) => a.time - b.time);
            setCustomAnimations(customAnimations.map(a =>
              a.id === anim.id ? { ...a, keyframes: newKeyframes } : a
            ));
          }
          return;
        }

        // Home/End — Jump to start/end
        if (e.key === 'Home') {
          e.preventDefault();
          const homeAnim = customAnimations.find(a => a.id === activeAnimationId);
          useStore.getState().setPlaybackTime(0);
          if (bot && homeAnim) bot.scrubTo(homeAnim, 0);
          return;
        }
        if (e.key === 'End') {
          e.preventDefault();
          const endAnim = customAnimations.find(a => a.id === activeAnimationId);
          useStore.getState().setPlaybackTime(1);
          if (bot && endAnim) bot.scrubTo(endAnim, 1);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, undo, redo, customAnimations, activeAnimationId, activeKeyframeId, bot,
      setCustomAnimations, setActiveKeyframeId, pushUndo, addLog]);

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-[#282c34] text-[#abb2bf] font-sans overflow-hidden select-none">
        <TopBar bot={bot} />
        <div className="flex-1 flex overflow-hidden">
          {view === 'editor' && <LeftPanel bot={bot} />}
          {view === 'animator' && <AnimatorLeftPanel />}
          <div className="flex-1 flex flex-col relative">
            <Viewport onBotReady={setBot} />
            {view === 'editor' && <OutputPanel />}
            {view === 'animator' && <AnimatorTimelinePanel bot={bot} />}
          </div>
          {view === 'editor' && <RightPanel bot={bot} />}
          {view === 'animator' && <AnimatorRightPanel bot={bot} />}
        </div>
      </div>
    </ErrorBoundary>
  );
}

