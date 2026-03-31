import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { Search, FileCode, Play, Square, Bug, Settings, HelpCircle, FilePlus, FolderPlus, Download, Upload, Undo, Redo, Trash2 } from 'lucide-react';

interface Command {
  id: string;
  name: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export function CommandPalette() {
  const { showCommandPalette, setShowCommandPalette, setShowHelpModal, setShowTemplateModal, setRunning, clearLogs, isRunning, undo, redo, customAnimations, setActiveAnimationId, setPlaying, isPlaying } = useStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { id: 'run', name: 'Run Code', shortcut: 'Ctrl+Enter', icon: <Play size={16} />, action: () => {}, category: 'Run' },
    { id: 'stop', name: 'Stop Execution', shortcut: 'Ctrl+C', icon: <Square size={16} />, action: () => {}, category: 'Run' },
    { id: 'debug', name: 'Start Debug', shortcut: 'Ctrl+Shift+D', icon: <Bug size={16} />, action: () => {}, category: 'Run' },
    { id: 'undo', name: 'Undo', shortcut: 'Ctrl+Z', icon: <Undo size={16} />, action: undo, category: 'Edit' },
    { id: 'redo', name: 'Redo', shortcut: 'Ctrl+Shift+Z', icon: <Redo size={16} />, action: redo, category: 'Edit' },
    { id: 'clear-logs', name: 'Clear Output', icon: <Trash2 size={16} />, action: clearLogs, category: 'Edit' },
    { id: 'new-file', name: 'New File', shortcut: 'Ctrl+N', icon: <FilePlus size={16} />, action: () => {}, category: 'Project' },
    { id: 'new-folder', name: 'New Folder', shortcut: 'Ctrl+Shift+N', icon: <FolderPlus size={16} />, action: () => {}, category: 'Project' },
    { id: 'save', name: 'Save', shortcut: 'Ctrl+S', icon: <Download size={16} />, action: () => {}, category: 'Project' },
    { id: 'export-anim', name: 'Export Animation', icon: <Download size={16} />, action: () => {}, category: 'Project' },
    { id: 'import-anim', name: 'Import Animation', icon: <Upload size={16} />, action: () => {}, category: 'Project' },
    { id: 'settings', name: 'Open Settings', icon: <Settings size={16} />, action: () => {}, category: 'App' },
    { id: 'help', name: 'Help & Tutorial', icon: <HelpCircle size={16} />, action: () => { setShowHelpModal(true); setShowCommandPalette(false); }, category: 'App' },
    { id: 'templates', name: 'Templates', icon: <FileCode size={16} />, action: () => { setShowTemplateModal(true); setShowCommandPalette(false); }, category: 'App' },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (showCommandPalette) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [showCommandPalette]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showCommandPalette) return;
      
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
        setShowCommandPalette(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette, filteredCommands, selectedIndex]);

  if (!showCommandPalette) return null;

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  let currentIndex = 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-[100px] z-50" onClick={() => setShowCommandPalette(false)}>
      <div className="w-[500px] bg-[#21252b] rounded-lg shadow-2xl border border-[#181a1f] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#181a1f]">
          <Search size={16} className="text-[#5c6370]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            className="flex-1 bg-transparent outline-none text-[14px] text-[#abb2bf] placeholder-[#5c6370]"
          />
          <span className="text-[#5c6370] text-[12px]">ESC</span>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {Object.entries(groupedCommands).map(([category, cmds]) => (
            <div key={category}>
              <div className="px-4 py-2 text-[11px] font-semibold text-[#5c6370] uppercase bg-[#1e2227]">
                {category}
              </div>
              {cmds.map((cmd) => {
                const index = currentIndex++;
                return (
                  <div
                    key={cmd.id}
                    className={`flex items-center gap-3 px-4 py-2 cursor-pointer text-[13px] ${index === selectedIndex ? 'bg-purple-600/20 text-purple-400' : 'text-[#abb2bf] hover:bg-[#2c313a]'}`}
                    onClick={() => { cmd.action(); setShowCommandPalette(false); }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <span className="text-[#5c6370]">{cmd.icon}</span>
                    <span className="flex-1">{cmd.name}</span>
                    {cmd.shortcut && (
                      <span className="text-[#5c6370] text-[11px] bg-[#282c34] px-2 py-0.5 rounded">{cmd.shortcut}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {filteredCommands.length === 0 && (
            <div className="px-4 py-8 text-center text-[#5c6370] text-[13px]">No commands found</div>
          )}
        </div>
      </div>
    </div>
  );
}