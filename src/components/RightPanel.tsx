import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Humanoid } from '../engine/Humanoid';
import { AIGenerateModal } from './AIGenerateModal';
import Editor, { useMonaco } from '@monaco-editor/react';

export function RightPanel({ bot, onRun }: { bot: Humanoid | null, onRun: () => void }) {
  const { code, setCode, activeDebugLine, addLog } = useStore();
  const [showAIModal, setShowAIModal] = useState(false);
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  useEffect(() => {
    if (monaco && editorRef.current) {
      if (activeDebugLine !== null) {
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, [
          {
            range: new monaco.Range(activeDebugLine, 1, activeDebugLine, 1),
            options: {
              isWholeLine: true,
              className: 'bg-yellow-500/20 border-l-4 border-yellow-500',
            }
          }
        ]);
        // Reveal the line in the center
        editorRef.current.revealLineInCenter(activeDebugLine);
      } else {
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
      }
    }
  }, [activeDebugLine, monaco]);

  useEffect(() => {
    if (monaco) {
      monaco.languages.register({ id: 'humanoid-python' });
      monaco.languages.setMonarchTokensProvider('humanoid-python', {
        tokenizer: {
          root: [
            [/^#.*/, 'comment'],
            [/\brobot\b/, 'keyword'],
            [/\b(for|in|range|if|else|elif|and|or|not|True|False)\b/, 'keyword'],
            [/\b\d+\.?\d*\b/, 'number'],
            [/[{}()\[\]]/, '@brackets'],
            [/[a-zA-Z_]\w*/, 'identifier'],
          ]
        }
      });
      monaco.editor.defineTheme('humanoid-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '636e7b', fontStyle: 'italic' },
          { token: 'keyword', foreground: 'c792ea' },
          { token: 'number', foreground: 'bd93f9' },
          { token: 'identifier', foreground: 'abb2bf' }
        ],
        colors: {
          'editor.background': '#282c34',
        }
      });
    }
  }, [monaco]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

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

  return (
    <div className="flex-1 min-w-0 md:flex bg-[#282c34] border-l border-[#181a1f] flex-col shrink-0 h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-[#181a1f] flex items-center gap-2 shrink-0 bg-[#21252b]">
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
      
      <div className="flex-1 relative bg-[#282c34]">
        <Editor
          height="100%"
          language="humanoid-python"
          theme="humanoid-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineHeight: 1.6,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            padding: { top: 16 }
          }}
        />
      </div>
      {showAIModal && <AIGenerateModal onClose={() => setShowAIModal(false)} />}
    </div>
  );
}
