import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useStore } from '../store';

const SYSTEM_INSTRUCTION = `You are an AI assistant that generates Python-like scripts for a 3D robot.
The robot supports the following commands:
- robot.walk.forward(steps=N)
- robot.walk.backward(steps=N)
- robot.jump(height=N)
- robot.turn.left(angle=N)
- robot.turn.right(angle=N)
- robot.head.look_left()
- robot.head.look_right()
- robot.head.center()
- robot.head.nod(times=N)
- robot.head.tilt(angle=N)
- robot.left_hand.raise()
- robot.left_hand.lower()
- robot.left_hand.wave(times=N)
- robot.right_hand.raise()
- robot.right_hand.lower()
- robot.right_hand.wave(times=N)
- robot.right_arm.elbow.bend(angle=N)
- robot.left_arm.elbow.bend(angle=N)
- robot.right_arm.shoulder.raise(angle=N)
- robot.left_arm.shoulder.raise(angle=N)
- robot.torso.chest.rotate(angle=N)
- robot.crouch()
- robot.lay_down()
- robot.stand_on_one_leg(leg='left'|'right')
- robot.stand_up()
- robot.reset()
- robot.idle()
- robot.wait(seconds=N)
- robot.play(animation='name')

Generate ONLY the script code. Do not include markdown formatting. Just the code.`;

export function AIGenerateModal({ onClose }: { onClose: () => void }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { setCode, addLog, geminiApiKey, aiProvider } = useStore();

  const handleGenerate = async () => {
    if (!prompt.trim() || !geminiApiKey) return;

    setIsGenerating(true);
    addLog('INFO', `Generating script with ${aiProvider}...`);

    try {
      let generatedCode = '';

      if (window.electronAPI?.aiGenerate) {
        const result = await window.electronAPI.aiGenerate(prompt, geminiApiKey, aiProvider);
        if (result.error) throw new Error(result.error);
        generatedCode = result.code || '';
      } else {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash-exp',
          contents: prompt,
          config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.2 }
        });
        generatedCode = response.text || '';
        generatedCode = generatedCode.replace(/^```[a-z]*\n/gm, '').replace(/```$/gm, '').trim();
      }

      setCode(generatedCode);
      addLog('SUCCESS', 'Script generated successfully.');
      onClose();
    } catch (error: any) {
      addLog('ERROR', 'Failed to generate script: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#282c34] border border-[#181a1f] rounded-lg shadow-2xl w-[420px] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#181a1f] bg-[#21252b] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-600/15 flex items-center justify-center text-[18px]">
            ✨
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-[14px]">AI Generate Script</h3>
            <p className="text-[11px] text-[#5c6370]">Describe what the robot should do</p>
          </div>
          <button onClick={onClose} className="text-[#5c6370] hover:text-white transition-colors text-[18px] leading-none">✕</button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-3">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Make the robot walk forward 5 steps, wave its right hand, and then turn left."
            className="w-full h-[120px] bg-[#1e2227] border border-[#181a1f] rounded p-3 text-[13px] text-white placeholder-[#5c6370] outline-none focus:border-[#4d78cc] resize-none leading-relaxed"
            autoFocus
          />
          <p className="text-[10px] text-[#4b5263]">Ctrl+Enter to generate</p>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#181a1f] bg-[#21252b] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-[13px] font-medium bg-[#3e4451] text-[#abb2bf] hover:text-white hover:bg-[#4c5363] transition-colors"
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="px-5 py-2 rounded text-[13px] font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Generating...
              </>
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
