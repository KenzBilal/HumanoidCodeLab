import { useStore } from '../store';
import { Queue } from '../engine/Queue';
import { Humanoid } from '../engine/Humanoid';

export function TopBar({ bot }: { bot: Humanoid | null }) {
  const { addLog, setRunning, view, setView } = useStore();

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

      <div className="absolute left-1/2 -translate-x-1/2 font-bold text-white tracking-wider text-[14px]">
        HUMANOID CODE LAB
      </div>

      <div className="flex items-center gap-2">
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
