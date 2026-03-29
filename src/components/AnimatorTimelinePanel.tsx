import { useRef, useEffect, useState, useCallback } from 'react';
import { useStore, Keyframe } from '../store';
import { Humanoid } from '../engine/Humanoid';

export function AnimatorTimelinePanel({ bot }: { bot: Humanoid | null }) {
  const store = useStore();

  const trackRef = useRef<HTMLDivElement>(null);
  const [draggingKfId, setDraggingKfId] = useState<string | null>(null);
  const [draggingPlayhead, setDraggingPlayhead] = useState(false);
  const playRafRef = useRef<number | null>(null);
  const animRef = useRef<any>(null);
  const botRef = useRef(bot);
  const loopRef = useRef(false);

  botRef.current = bot;
  loopRef.current = store.loopPlayback;

  const activeAnim = store.customAnimations.find(a => a.id === store.activeAnimationId);
  const keyframes = activeAnim?.keyframes || [];

  // Keep anim ref in sync
  useEffect(() => {
    animRef.current = activeAnim;
  }, [activeAnim]);

  // Stop playback
  const stopPlayback = useCallback(() => {
    if (playRafRef.current) {
      cancelAnimationFrame(playRafRef.current);
      playRafRef.current = null;
    }
    if (botRef.current) botRef.current.stopPlayback();
    store.setPlaying(false);
  }, [store.setPlaying]);

  // Start playback
  const startPlayback = useCallback(() => {
    const anim = animRef.current;
    const b = botRef.current;
    if (!anim || !b) return;
    store.setPlaying(true);
    const t0 = performance.now();
    const startOffset = store.playbackTime;

    const tick = (now: number) => {
      const a = animRef.current;
      if (!a) { store.setPlaying(false); return; }
      const elapsed = now - t0;
      const dur = a.duration * (1 - startOffset);
      const t = Math.min(elapsed / dur, 1);
      const currentTime = startOffset + t * (1 - startOffset);
      store.setPlaybackTime(currentTime);
      if (botRef.current) botRef.current.scrubTo(a, currentTime);

      if (t < 1) {
        playRafRef.current = requestAnimationFrame(tick);
      } else if (loopRef.current) {
        // Loop: restart from 0
        const loopStart = performance.now();
        const loopTick = (now2: number) => {
          const a2 = animRef.current;
          if (!a2) { store.setPlaying(false); return; }
          const lt = Math.min((now2 - loopStart) / a2.duration, 1);
          store.setPlaybackTime(lt);
          if (botRef.current) botRef.current.scrubTo(a2, lt);
          if (lt >= 1) {
            if (loopRef.current) {
              const restart = performance.now();
              const innerTick = (now3: number) => {
                const a3 = animRef.current;
                if (!a3) { store.setPlaying(false); return; }
                const ilt = Math.min((now3 - restart) / a3.duration, 1);
                store.setPlaybackTime(ilt);
                if (botRef.current) botRef.current.scrubTo(a3, ilt);
                if (ilt >= 1) {
                  if (loopRef.current) {
                    playRafRef.current = requestAnimationFrame(innerTick);
                  } else {
                    store.setPlaying(false);
                    playRafRef.current = null;
                  }
                } else {
                  playRafRef.current = requestAnimationFrame(innerTick);
                }
              };
              playRafRef.current = requestAnimationFrame(innerTick);
            } else {
              store.setPlaying(false);
              playRafRef.current = null;
            }
          } else {
            playRafRef.current = requestAnimationFrame(loopTick);
          }
        };
        playRafRef.current = requestAnimationFrame(loopTick);
      } else {
        store.setPlaying(false);
        playRafRef.current = null;
      }
    };
    playRafRef.current = requestAnimationFrame(tick);
  }, [store.setPlaying, store.setPlaybackTime, store.playbackTime]);

  const togglePlayPause = useCallback(() => {
    if (store.isPlaying) {
      stopPlayback();
    } else {
      if (store.playbackTime >= 0.99) {
        store.setPlaybackTime(0);
        setTimeout(() => startPlayback(), 0);
      } else {
        startPlayback();
      }
    }
  }, [store.isPlaying, store.playbackTime, store.setPlaybackTime, startPlayback, stopPlayback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playRafRef.current) cancelAnimationFrame(playRafRef.current);
    };
  }, []);

  // Reset playhead when switching animations
  useEffect(() => {
    stopPlayback();
    store.setPlaybackTime(0);
  }, [store.activeAnimationId, stopPlayback, store.setPlaybackTime]);

  // Convert mouse X to time (0-1)
  const xToTime = (clientX: number): number => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    return Math.max(0, Math.min(1, x / rect.width));
  };

  // Keyframe drag
  const handleKfMouseDown = (e: React.MouseEvent, kfId: string) => {
    e.stopPropagation();
    store.pushUndo();
    setDraggingKfId(kfId);
    store.setActiveKeyframeId(kfId);
  };

  const handleTrackMouseDown = (e: React.MouseEvent) => {
    if (e.target === trackRef.current || (e.target as HTMLElement).classList.contains('track-bg')) {
      store.pushUndo();
      setDraggingPlayhead(true);
      const t = xToTime(e.clientX);
      store.setPlaybackTime(t);
      if (bot && activeAnim) bot.scrubTo(activeAnim, t);
    }
  };

  // Global mouse events for dragging
  useEffect(() => {
    if (!draggingKfId && !draggingPlayhead) return;

    const handleMove = (e: MouseEvent) => {
      if (draggingKfId && activeAnim) {
        let t = xToTime(e.clientX);
        if (e.shiftKey) t = Math.round(t * 10) / 10;
        const newKfs = keyframes.map(k =>
          k.id === draggingKfId ? { ...k, time: t } : k
        ).sort((a, b) => a.time - b.time);
        store.setCustomAnimations(store.customAnimations.map(a =>
          a.id === activeAnim.id ? { ...a, keyframes: newKfs } : a
        ));
      }
      if (draggingPlayhead) {
        const t = xToTime(e.clientX);
        store.setPlaybackTime(t);
        if (bot && activeAnim) bot.scrubTo(activeAnim, t);
      }
    };

    const handleUp = () => {
      setDraggingKfId(null);
      setDraggingPlayhead(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [draggingKfId, draggingPlayhead, activeAnim, keyframes, bot, store]);

  const handleAddKeyframe = () => {
    store.pushUndo();
    const newKf: Keyframe = {
      id: Math.random().toString(36).substr(2, 9),
      time: store.playbackTime > 0 ? Math.min(1, store.playbackTime) : 1,
      rotations: {},
      rootOffset: { y: 0 },
      easing: 'linear'
    };

    const currentKf = keyframes.find(k => k.id === store.activeKeyframeId);
    if (currentKf) {
      newKf.rotations = JSON.parse(JSON.stringify(currentKf.rotations));
      newKf.rootOffset = { ...currentKf.rootOffset };
      newKf.easing = currentKf.easing;
      if (newKf.time === currentKf.time) {
        newKf.time = Math.min(1, currentKf.time + 0.1);
      }
    } else if (keyframes.length > 0) {
      const lastKf = keyframes[keyframes.length - 1];
      newKf.rotations = JSON.parse(JSON.stringify(lastKf.rotations));
      newKf.rootOffset = { ...lastKf.rootOffset };
      newKf.easing = lastKf.easing;
      if (newKf.time === lastKf.time) {
        newKf.time = Math.min(1, lastKf.time + 0.1);
      }
    }

    const newKeyframes = [...keyframes, newKf].sort((a, b) => a.time - b.time);
    store.setCustomAnimations(store.customAnimations.map(a =>
      a.id === activeAnim!.id ? { ...a, keyframes: newKeyframes } : a
    ));
    store.setActiveKeyframeId(newKf.id);
  };

  const handleDeleteKeyframe = (id: string) => {
    if (keyframes.length <= 1) return;
    store.pushUndo();
    const newKeyframes = keyframes.filter(k => k.id !== id);
    store.setCustomAnimations(store.customAnimations.map(a =>
      a.id === activeAnim!.id ? { ...a, keyframes: newKeyframes } : a
    ));
    if (store.activeKeyframeId === id) {
      store.setActiveKeyframeId(newKeyframes[0].id);
    }
  };

  const handleDuplicateKeyframe = () => {
    const kf = keyframes.find(k => k.id === store.activeKeyframeId);
    if (!kf) return;
    store.pushUndo();
    const newKf: Keyframe = {
      ...JSON.parse(JSON.stringify(kf)),
      id: Math.random().toString(36).substr(2, 9),
      time: Math.min(1, kf.time + 0.05)
    };
    const newKeyframes = [...keyframes, newKf].sort((a, b) => a.time - b.time);
    store.setCustomAnimations(store.customAnimations.map(a =>
      a.id === activeAnim!.id ? { ...a, keyframes: newKeyframes } : a
    ));
    store.setActiveKeyframeId(newKf.id);
  };

  // Ruler ticks
  const ticks = [0, 0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9, 1.0];

  if (!activeAnim) {
    return (
      <div className="h-[220px] bg-[#21252b] border-t border-[#181a1f] flex items-center justify-center text-[#5c6370] text-[12px]">
        Select an animation to view timeline
      </div>
    );
  }

  const duration = activeAnim.duration;

  return (
    <div className="h-[220px] bg-[#21252b] border-t border-[#181a1f] flex flex-col shrink-0 select-none">
      {/* Header */}
      <div className="h-[32px] bg-[#282c34] border-b border-[#181a1f] flex items-center px-3 justify-between shrink-0">
        <span className="text-[11px] font-bold text-[#5c6370] tracking-wider">TIMELINE</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDuplicateKeyframe}
            className="text-[11px] text-[#5c6370] hover:text-white px-1.5 py-0.5 rounded transition-colors"
            title="Duplicate Keyframe (Ctrl+D)"
          >
            📋
          </button>
          <button
            onClick={handleAddKeyframe}
            className="text-[11px] bg-[#4d78cc] hover:bg-[#4065b4] text-white px-2 py-0.5 rounded transition-colors"
          >
            + Keyframe
          </button>
        </div>
      </div>

      {/* Ruler */}
      <div className="h-[20px] bg-[#1e2227] flex items-end relative shrink-0 px-0">
        {ticks.map(t => (
          <div
            key={t}
            className="absolute bottom-0 flex flex-col items-center"
            style={{ left: `${t * 100}%` }}
          >
            <span className="text-[8px] text-[#5c6370] leading-none mb-0.5">
              {t === 0 || t === 0.5 || t === 1 ? `${(t * duration).toFixed(0)}ms` : ''}
            </span>
            <div className={`w-px ${t % 0.25 === 0 ? 'h-2 bg-[#4b5263]' : 'h-1 bg-[#333842]'}`} />
          </div>
        ))}
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="flex-1 relative px-0 cursor-pointer"
        onMouseDown={handleTrackMouseDown}
      >
        {/* Track background */}
        <div className="track-bg absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[2px] bg-[#333842]" />

        {/* Grid lines */}
        {ticks.filter(t => t > 0 && t < 1).map(t => (
          <div
            key={t}
            className="absolute top-0 bottom-0 w-px bg-[#282c34]"
            style={{ left: `${t * 100}%` }}
          />
        ))}

        {/* Keyframes */}
        {keyframes.map((kf) => (
          <div
            key={kf.id}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 cursor-grab active:cursor-grabbing group"
            style={{ left: `${kf.time * 100}%` }}
            onMouseDown={(e) => handleKfMouseDown(e, kf.id)}
          >
            <div className={`w-3.5 h-3.5 rotate-45 border-2 transition-all ${
              store.activeKeyframeId === kf.id
                ? 'bg-[#4d78cc] border-[#61afef] shadow-[0_0_6px_rgba(77,120,204,0.5)] scale-110'
                : 'bg-[#333842] border-[#5c6370] hover:border-[#abb2bf] hover:scale-105'
            }`} />
            <div className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono whitespace-nowrap transition-opacity ${
              store.activeKeyframeId === kf.id ? 'text-[#abb2bf] opacity-100' : 'text-[#5c6370] opacity-0 group-hover:opacity-100'
            }`}>
              {(kf.time * duration).toFixed(0)}ms
            </div>
          </div>
        ))}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-none"
          style={{ left: `${store.playbackTime * 100}%` }}
        >
          <div className="w-px h-full bg-[#e5c07b]" />
          <div className="absolute -top-0.5 -left-[5px] w-[11px] h-[11px] bg-[#e5c07b] rounded-sm rotate-45 pointer-events-auto cursor-ew-resize" />
        </div>
      </div>

      {/* Playback Controls */}
      <div className="h-[36px] bg-[#1e2227] border-t border-[#181a1f] flex items-center px-3 gap-2 shrink-0">
        <button
          onClick={() => { stopPlayback(); store.setPlaybackTime(0); if (bot && activeAnim) bot.scrubTo(activeAnim, 0); }}
          className="text-[#abb2bf] hover:text-white text-[14px] cursor-pointer px-1"
          title="Jump to Start"
        >
          ⏮
        </button>
        <button
          onClick={togglePlayPause}
          className={`text-[14px] cursor-pointer px-1 ${store.isPlaying ? 'text-[#e5c07b]' : 'text-[#98c379]'} hover:text-white`}
          title={store.isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {store.isPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={() => { stopPlayback(); store.setPlaybackTime(1); if (bot && activeAnim) bot.scrubTo(activeAnim, 1); }}
          className="text-[#abb2bf] hover:text-white text-[14px] cursor-pointer px-1"
          title="Jump to End"
        >
          ⏭
        </button>

        <div className="w-px h-4 bg-[#333842] mx-1" />

        <button
          onClick={() => store.setLoopPlayback(!store.loopPlayback)}
          className={`text-[12px] cursor-pointer px-1.5 py-0.5 rounded ${store.loopPlayback ? 'text-[#e5c07b] bg-[#e5c07b]/10' : 'text-[#5c6370] hover:text-[#abb2bf]'}`}
          title="Loop"
        >
          🔁
        </button>

        <div className="w-px h-4 bg-[#333842] mx-1" />

        <span className="text-[10px] font-mono text-[#5c6370]">
          {(store.playbackTime * duration).toFixed(0)}ms
        </span>
        <span className="text-[10px] text-[#333842]">/</span>
        <span className="text-[10px] font-mono text-[#5c6370]">
          {duration}ms
        </span>

        <div className="flex-1" />

        {/* Keyframe info */}
        {store.activeKeyframeId && (() => {
          const kf = keyframes.find(k => k.id === store.activeKeyframeId);
          if (!kf) return null;
          return (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#5c6370]">
                KF @ {(kf.time * 100).toFixed(0)}%
              </span>
              {keyframes.length > 1 && (
                <button
                  onClick={() => handleDeleteKeyframe(kf.id)}
                  className="text-[10px] text-[#e06c75] hover:text-[#ff7b85] cursor-pointer"
                  title="Delete Keyframe"
                >
                  ✕ Delete
                </button>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
