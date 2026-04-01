import { useEffect, useRef } from 'react';
import { useStore } from '../store';

export function OutputPanel() {
  const { logs, clearLogs } = useStore();
  const logsEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    if (isAtBottom) {
      logsEndRef.current?.scrollIntoView({ behavior: 'auto' });
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
    <div className="bg-[#282c34] border-t border-[#181a1f] flex flex-col h-full w-full">
      <div className="px-4 py-2 border-b border-[#181a1f] flex items-center justify-between bg-[#21252b]">
        <span className="text-[13px] font-semibold text-[#abb2bf] uppercase tracking-wider">Output</span>
        <button 
          onClick={clearLogs}
          className="bg-transparent border-none text-[#5c6370] cursor-pointer text-[12px] px-2 py-0.5 rounded font-sans hover:text-[#abb2bf] hover:bg-[#2c313a] transition-colors"
        >
          Clear
        </button>
      </div>
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#1e2227]">
        {logs.length === 0 ? (
          <div className="text-[#5c6370] italic text-[13px]">No logs yet. Run the script to see output.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="mb-1.5 font-mono text-[12px] whitespace-pre-wrap leading-relaxed">
              <span className={`inline-block w-[70px] ${getLogStyle(log.type).cls}`}>[{log.type}]</span>
              <span className="text-[#abb2bf]">{log.message}</span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
