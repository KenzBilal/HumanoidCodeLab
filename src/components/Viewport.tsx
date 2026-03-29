import { useEffect, useRef, useState } from 'react';
import { SceneManager } from '../engine/Scene';
import { Humanoid } from '../engine/Humanoid';

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function Viewport({ onBotReady }: { onBotReady: (bot: Humanoid) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneManager | null>(null);
  const [noWebGL, setNoWebGL] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    if (!hasWebGL()) {
      setNoWebGL(true);
      return;
    }

    const manager = new SceneManager(canvasRef.current);
    sceneRef.current = manager;
    onBotReady(manager.bot);

    const handleResize = () => {
      if (containerRef.current) {
        manager.resize(containerRef.current);
      }
    };

    window.addEventListener('resize', handleResize);

    // Initial resize
    setTimeout(handleResize, 0);

    return () => {
      window.removeEventListener('resize', handleResize);
      manager.dispose();
    };
  }, [onBotReady]);

  if (noWebGL) {
    return (
      <div ref={containerRef} className="flex-1 flex flex-col bg-[#21252b] relative items-center justify-center p-8">
        <div className="max-w-md text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#e3b341]/10 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e3b341" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white mb-2">WebGL Not Available</h2>
            <p className="text-[13px] text-[#5c6370]">
              This browser does not support WebGL, which is required for the 3D viewport. Please use a modern browser like Chrome, Firefox, or Edge with hardware acceleration enabled.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 flex flex-col bg-[#21252b] relative">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 min-w-[300px] max-w-[500px] hidden md:flex flex-col gap-2 p-3 bg-[#282c34]/90 backdrop-blur-md rounded border border-[#181a1f] shadow-lg pointer-events-none z-10 transition-opacity duration-300">
        Drag to orbit · Scroll to zoom · Ctrl+Enter to run
      </div>
    </div>
  );
}
