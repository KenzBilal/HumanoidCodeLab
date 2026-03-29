import { useStore } from '../store';
import { Queue } from '../engine/Queue';
import { Humanoid } from '../engine/Humanoid';
import { Play, Square } from 'lucide-react';

export function TopBar({ bot, onRun }: { bot: Humanoid | null, onRun: () => void }) {
  const { addLog, setRunning, isRunning, view, setView } = useStore();

  const handleReset = async () => {
    if (!bot) return;
    Queue.stop();
    await new Promise(r => setTimeout(r, 80));
    addLog('INFO', 'Resetting humanoid\u2026');
    await bot.resetPose(true);
    addLog('SUCCESS', 'Reset complete.');
    setRunning(false);
  };

  return (
    <div className="h-[42px] bg-[#2b2f36] border-b border-[#181a1f] flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-4 text-[13px] text-[#abb2bf] font-medium h-full">
        <span
          onClick={() => setView('editor')}
          className={`cursor-pointer hover:text-white border-b-2 h-full flex items-center ${view === 'editor' ? 'border-white text-white' : 'border-transparent hover:border-white'}`}
        >
          Editor
        </span>
        <span
          onClick={() => setView('animator')}
          className={`cursor-pointer hover:text-white border-b-2 h-full flex items-center ${view === 'animator' ? 'border-white text-white' : 'border-transparent hover:border-white'}`}
        >
          Animator
        </span>
      </div>

      <div className="flex items-center gap-1.5 opacity-90">
        <span className="text-white font-bold text-[14px] flex items-center gap-2">
          Humanoid Code Lab
          {isRunning && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" title="Running script..." />}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        {view === 'editor' && (
          <div className="flex items-center gap-2 mr-2">
            {isRunning ? (
              <button onClick={() => Queue.stop()} className="flex items-center gap-1.5 px-3 py-1 bg-[#e06c75]/20 text-[#e06c75] hover:bg-[#e06c75]/30 rounded text-xs font-semibold transition-colors">
                <Square size={12} fill="currentColor" /> Stop
              </button>
            ) : (
              <button onClick={onRun} className="flex items-center gap-1.5 px-3 py-1 bg-[#98c379]/20 text-[#98c379] hover:bg-[#98c379]/30 rounded text-xs font-semibold transition-colors">
                <Play size={12} fill="currentColor" /> Run
              </button>
            )}
            <div className="w-px h-4 bg-[#3E4451] ml-2" />
          </div>
        )}
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1 rounded text-[12px] font-semibold transition-colors duration-120 border bg-[#2b2f36] border-[#181a1f] text-white hover:bg-[#333842] cursor-pointer"
        >
          ↺ Reset
        </button>
      </div>
    </div>
  );
}
