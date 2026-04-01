import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Humanoid } from '../engine/Humanoid';
import { AIGenerateModal } from './AIGenerateModal';
import { Interpreter, CompileError } from '../engine/Interpreter';
import Editor, { useMonaco, OnMount } from '@monaco-editor/react';
import * as monacoEditor from 'monaco-editor';
import { AlertCircle, Check } from 'lucide-react';

export function RightPanel({ bot, onRun }: { bot: Humanoid | null, onRun: () => void }) {
  const { code, setCode, activeDebugLine, addLog } = useStore();
  const [showAIModal, setShowAIModal] = useState(false);
  const [errors, setErrors] = useState<CompileError[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const monaco = useMonaco();
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!code || !monaco) return;
    const { errors: compileErrors } = Interpreter.compile(code);
    setErrors(compileErrors);
    
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        const markers: monacoEditor.editor.IMarkerData[] = compileErrors.map(err => ({
          severity: monaco.MarkerSeverity.Error,
          message: err.msg,
          startLineNumber: err.line,
          startColumn: 1,
          endLineNumber: err.line,
          endColumn: 1000,
        }));
        monaco.editor.setModelMarkers(model, 'humanoid', markers);
      }
    }
  }, [code, monaco]);

  useEffect(() => {
    if (monaco && editorRef.current) {
      if (activeDebugLine !== null) {
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, [
          {
            range: new monaco.Range(activeDebugLine, 1, activeDebugLine, 1),
            options: {
              isWholeLine: true,
              className: 'bg-yellow-500/30 border-l-4 border-yellow-500',
            }
          }
        ]);
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
          { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
          { token: 'keyword', foreground: 'a78bfa' },
          { token: 'number', foreground: 'f472b6' },
          { token: 'identifier', foreground: 'e5e7eb' },
          { token: 'string', foreground: '34d399' },
        ],
        colors: {
          'editor.background': '#15171c',
          'editor.foreground': '#e5e7eb',
          'editor.lineHighlightBackground': '#1f2329',
          'editor.selectionBackground': '#8b5cf640',
          'editor.inactiveSelectionBackground': '#8b5cf620',
          'editorLineNumber.foreground': '#4b5563',
          'editorLineNumber.activeForeground': '#a78bfa',
          'editorCursor.foreground': '#a78bfa',
          'editor.selectionHighlightBackground': '#8b5cf630',
          'editorBracketMatch.background': '#8b5cf630',
          'editorBracketMatch.border': '#a78bfa',
        }
      });
    }
  }, [monaco]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code]);

  const handleEditorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor) => {
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
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'robot_script.py';
      a.click();
      URL.revokeObjectURL(url);
      addLog('SUCCESS', 'Saved as robot_script.py');
    }
  };

  return (
    <div className="flex-1 min-w-0 md:flex bg-[#15171c] border-l border-[#3a3f4a] flex-col h-full overflow-hidden w-full">
      <div className="px-4 py-3 border-b border-[#3a3f4a] flex items-center gap-2 bg-[#0d0f12]">
        <button 
          onClick={handleSave}
          className="px-4 py-1.5 rounded text-[13px] font-semibold transition-all duration-200 bg-[#8b5cf6] text-white hover:bg-[#a78bfa] hover:shadow-lg hover:shadow-purple-500/30 cursor-pointer"
        >
          Save
        </button>
        <button
          onClick={() => setShowAIModal(true)}
          className="px-4 py-1.5 rounded text-[13px] font-semibold transition-all duration-200 bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-500 hover:to-violet-500 hover:shadow-lg hover:shadow-purple-500/30 cursor-pointer flex items-center gap-1.5 ml-auto"
        >
          AI Generate
        </button>
        <div className="ml-2 flex items-center gap-2">
          {errors.length === 0 ? (
            <span className="flex items-center gap-1.5 text-[12px] text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
              <Check size={12} /> No errors
            </span>
          ) : (
            <button 
              onClick={() => setShowErrors(!showErrors)}
              className="flex items-center gap-1.5 text-[12px] text-red-400 bg-red-400/10 px-2 py-1 rounded-full hover:bg-red-400/20 transition-colors"
            >
              <AlertCircle size={12} /> {errors.length} error{errors.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>

      {showErrors && errors.length > 0 && (
        <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2 max-h-[120px] overflow-y-auto">
          {errors.map((err, i) => (
            <div key={i} className="text-[12px] text-red-400 py-0.5 flex items-start gap-2">
              <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
              <span className="text-red-300">Line {err.line}:</span>
              <span>{err.msg}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="humanoid-python"
          theme="humanoid-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Consolas, monospace',
            minimap: { enabled: false },
            wordWrap: 'on',
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            tabSize: 2,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
          }}
        />
      </div>

      
    </div>
  );
}