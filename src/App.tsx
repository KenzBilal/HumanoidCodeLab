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
import { FileTreePanel } from './components/FileTreePanel';
import { CommandPalette } from './components/CommandPalette';
import { HelpModal } from './components/HelpModal';
import { TemplateModal } from './components/TemplateModal';
import { Humanoid } from './engine/Humanoid';
import { useStore } from './store';
import { CommandRegistry } from './engine/CommandRegistry';
import { Queue } from './engine/Queue';
import { Interpreter } from './engine/Interpreter';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';

export default function App() {
  const [bot, setBot] = useState<Humanoid | null>(null);
  const { addLog, view, undo, redo, customAnimations, activeAnimationId, activeKeyframeId,
    setCustomAnimations, setActiveKeyframeId, pushUndo, setRunning, code, setShowCommandPalette, setShowHelpModal, setShowTemplateModal, project } = useStore();

  const handleRun = useCallback(() => {
    if (Queue.running) return;
    if (!bot) {
      addLog('WARN', 'Engine is not ready yet. Please wait...');
      return;
    }
    const { actions, errors } = Interpreter.compile(code);
    if (errors.length) {
      errors.forEach(e => addLog('ERROR', `Line ${e.line}: ${e.msg}`));
      return;
    }
    if (!actions.length) {
      addLog('WARN', 'No commands found. Write some robot.command() calls.');
      return;
    }
    Queue.run(actions, bot, {
      onLog: addLog,
      onRunning: setRunning,
      onStop: () => false,
      context: { customAnimations },
      isDebug: useStore.getState().isDebugMode,
      onDebugLine: (line) => {
        useStore.getState().setActiveDebugLine(line ?? null);
      },
      waitStep: () => {
        return new Promise<void>((resolve) => {
          useStore.getState().setDebugResolver(resolve);
        });
      }
    });
  }, [bot, code, addLog, setRunning, customAnimations]);

  useEffect(() => {
    addLog('INFO', 'Humanoid Code Lab initialized. Ready to run.');
    addLog('INFO', `${CommandRegistry.all().length} commands loaded. Click ▶ Run to start.`);

    if (window.electronAPI?.getEncryptedApiKey) {
      window.electronAPI.getEncryptedApiKey().then(key => {
        if (key && !useStore.getState().geminiApiKey) {
          useStore.getState().setGeminiApiKey(key);
        }
      });
    }
  }, [addLog]);

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
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (view === 'editor') handleRun();
        return;
      }
      // Command Palette
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setShowCommandPalette(true);
        return;
      }
      // Help
      if ((e.ctrlKey || e.metaKey) && e.key === 'F1') {
        e.preventDefault();
        setShowHelpModal(true);
        return;
      }
      // Templates
      if ((e.ctrlKey || e.metaKey) && e.key === 'T') {
        e.preventDefault();
        setShowTemplateModal(true);
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
              id: Math.random().toString(36).substring(2, 9),
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
        <TopBar bot={bot} onRun={handleRun} />
        <div className="flex-1 flex overflow-hidden">
          {view === 'editor' ? (
            <PanelGroup orientation="horizontal">
              <Panel defaultSize={20} minSize={15} maxSize={30}>
                <LeftPanel bot={bot} />
              </Panel>
              
              <PanelResizeHandle className="w-1 bg-[#181a1f] hover:bg-purple-600/50 active:bg-purple-600 transition-colors cursor-col-resize z-10" />
              
              <Panel defaultSize={50} minSize={30}>
                <div className="flex-1 flex flex-col relative h-full">
                  <Viewport onBotReady={setBot} />
                  <OutputPanel />
                </div>
              </Panel>
              
              <PanelResizeHandle className="w-1 bg-[#181a1f] hover:bg-purple-600/50 active:bg-purple-600 transition-colors cursor-col-resize z-10" />
              
              <Panel defaultSize={30} minSize={20} maxSize={50}>
                <RightPanel bot={bot} onRun={handleRun} />
              </Panel>
            </PanelGroup>
          ) : (
            <PanelGroup orientation="horizontal">
              <Panel defaultSize={20} minSize={15} maxSize={30}>
                <AnimatorLeftPanel />
              </Panel>
              
              <PanelResizeHandle className="w-1 bg-[#181a1f] hover:bg-purple-600/50 active:bg-purple-600 transition-colors cursor-col-resize z-10" />
              
              <Panel defaultSize={50} minSize={30}>
                <div className="flex-1 flex flex-col relative h-full">
                  <Viewport onBotReady={setBot} />
                  <AnimatorTimelinePanel bot={bot} />
                </div>
              </Panel>

              <PanelResizeHandle className="w-1 bg-[#181a1f] hover:bg-purple-600/50 active:bg-purple-600 transition-colors cursor-col-resize z-10" />
              
              <Panel defaultSize={30} minSize={20} maxSize={50}>
                <AnimatorRightPanel bot={bot} />
              </Panel>
            </PanelGroup>
          )}
        </div>
        <CommandPalette />
        <HelpModal />
        <TemplateModal />
      </div>
    </ErrorBoundary>
  );
}

