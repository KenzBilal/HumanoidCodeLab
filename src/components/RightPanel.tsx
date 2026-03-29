import React, { useState } from 'react';
import { useStore } from '../store';
import { Humanoid } from '../engine/Humanoid';
import { AIGenerateModal } from './AIGenerateModal';

export function RightPanel({ bot, onRun }: { bot: Humanoid | null, onRun: () => void }) {
  const { code, setCode, isRunning, addLog } = useStore();
  const [showAIModal, setShowAIModal] = useState(false);


  const handleSave = async () => {
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.saveFile(code);
        if (result.cancelled) {
          addLog('INFO', 'Save cancelled.');
        } else if (result.success) {
          addLog('SUCCESS', `Saved to ${result.filePath}`);
        } else {
          addLog('ERROR', `Save failed: ${result.error}`);
        }
      } catch (err: any) {
        addLog('ERROR', `Save failed: ${err.message}`);
      }
    } else {
      const blob = new Blob([code], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'robot_script.py';
      a.click();
      addLog('SUCCESS', 'Saved as robot_script.py');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const s = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, s) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = s + 4;
      }, 0);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun();
    }
  };

  const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const colorize = (c: string) => {
    return c.split('\n').map(line => {
      // SEC-01: Ensure esc() is called FIRST before any regex substitution
      let s = esc(line);
      if (s.trim().startsWith('#')) return `<span class="text-[#636e7b] italic">${s}</span>`;
      s = s.replace(/\brobot\b/g, '<span class="text-[#58a6ff] font-semibold">robot</span>');
      s = s.replace(/\b(for|in|range|if|else|elif|and|or|not|True|False)\b/g, '<span class="text-[#c792ea]">$1</span>');
      // $1 captures \w+ (word chars only, alphanumeric/underscores) avoiding unescaped HTML injection
      s = s.replace(/\.([a-zA-Z_]\w*)(?=\()/g, '.<span class="text-[#ffb86c]">$1</span>');
      s = s.replace(/\.([a-zA-Z_]\w*)(?!\()/g, '.<span class="text-[#ffb86c]">$1</span>');
      s = s.replace(/([a-z_]+)(?==[\d\-])/g, '<span class="text-[#7dc8e8]">$1</span>');
      s = s.replace(/\b([\d]+\.?[\d]*)\b/g, '<span class="text-[#bd93f9]">$1</span>');
      s = s.replace(/([()])/g, '<span class="text-[#4a5568]">$1</span>');
      return s;
    }).join('\n');
  };

  const rows = code.split('\n').length;
  const lineNumbers = Array.from({ length: rows }, (_, i) => i + 1).join('\n');

  return (
    <div className="w-[400px] min-w-[280px] max-w-[500px] hidden md:flex bg-[#282c34] border-l border-[#181a1f] flex-col shrink-0">
      <div className="px-4 py-3 border-b border-[#181a1f] flex justify-end items-center gap-2 shrink-0 bg-[#21252b]">
        <button 
          onClick={handleSave}
          className="px-4 py-1.5 rounded text-[13px] font-semibold transition-colors duration-120 bg-[#3e4451] text-white hover:bg-[#4c5363] cursor-pointer"
        >
          Save
        </button>
        <button
          onClick={() => setShowAIModal(true)}
          className="px-4 py-1.5 rounded text-[13px] font-semibold transition-colors duration-120 bg-purple-600 text-white hover:bg-purple-700 cursor-pointer flex items-center gap-1.5 ml-auto"
        >
          ✨ AI Generate
        </button>
      </div>
      
      <div className="flex-1 relative overflow-hidden bg-[#282c34]">
        <div className="absolute left-0 top-0 w-[40px] h-full py-4 pr-3 text-right font-mono text-[13px] leading-[1.6] text-[#4b5263] select-none pointer-events-none whitespace-pre">
          {lineNumbers}
        </div>
        
        <div 
          className="absolute left-[40px] top-0 right-0 bottom-0 px-2 py-4 font-mono text-[13px] leading-[1.6] pointer-events-none whitespace-pre overflow-hidden tab-size-4"
          dangerouslySetInnerHTML={{ __html: colorize(code) + '\n' }}
        />
        
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck="false"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className="absolute left-[40px] top-0 right-0 bottom-0 px-2 py-4 font-mono text-[13px] leading-[1.6] bg-transparent border-none outline-none text-transparent caret-[#528bff] resize-none whitespace-pre overflow-auto tab-size-4 selection:bg-[#3e4451]"
        />
      </div>
      {showAIModal && <AIGenerateModal onClose={() => setShowAIModal(false)} />}
    </div>
  );
}
