import { useEffect, useRef } from 'react';
import { useStore } from '../store';

export function OutputPanel() {
  const { logs, clearLogs } = useStore();
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogStyle = (type: string) => {
    switch (type) {
      case 'INFO': return { cls: 'text-[#58a6ff]', lbl: '[INFO]' };
      case 'ACTION': return { cls: 'text-[#3fb950]', lbl: '[ACTION]' };
      case 'SUCCESS': return { cls: 'text-[#39d353]', lbl: '[SUCCESS]' };
      case 'ERROR': return { cls: 'text-[#f85149]', lbl: '[ERROR]' };
      case 'WARN': return { cls: 'text-[#e3b341]', lbl: '[WARN]' };
      default: return { cls: 'text-[#58a6ff]', lbl: '[LOG]' };
    }
  };

  return (
    <div className="h-[200px] bg-[#282c34] border-t border-[#181a1f] flex flex-col shrink-0">
      <div className="px-4 py-2 border-b border-[#181a1f] flex items-center justify-between shrink-0 bg-[#21252b]">
        <span className="text-[13px] font-semibold text-[#abb2bf] uppercase tracking-wider">Output</span>
        <button 
          onClick={clearLogs}
          className="bg-transparent border-none text-[#5c6370] cursor-pointer text-[12px] px-2 py-0.5 rounded font-sans hover:text-[#abb2bf] hover:bg-[#2c313a] transition-colors"
        >
          Clear
        </button>
      </div>
      <div ref={logRef} className="flex-1 overflow-y-auto px-4 py-2 font-mono text-[13px] leading-[1.6]">
        {logs.map((log) => {
          const { cls, lbl } = getLogStyle(log.type);
          return (
            <div key={log.id} className="flex gap-2 mb-1">
              <span className={`font-bold shrink-0 ${cls}`}>{lbl}</span>
              <span className="text-[#abb2bf]">{log.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
