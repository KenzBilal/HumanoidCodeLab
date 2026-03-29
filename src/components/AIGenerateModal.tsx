import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useStore } from '../store';

export function AIGenerateModal({ onClose }: { onClose: () => void }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { setCode, addLog } = useStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    addLog('INFO', 'Generating script with Gemini...');
    
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '' });
      
      const systemInstruction = `You are an AI assistant that generates Python-like scripts for a 3D robot.
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

Generate ONLY the script code. Do not include markdown formatting like \`\`\`python. Do not include explanations. Just the code.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        }
      });

      let generatedCode = response.text || '';
      // Clean up markdown if the model ignored instructions
      generatedCode = generatedCode.replace(/^```[a-z]*\n/gm, '').replace(/```$/gm, '').trim();
      
      setCode(generatedCode);
      addLog('SUCCESS', 'Script generated successfully.');
      onClose();
    } catch (error: any) {
      console.error(error);
      addLog('ERROR', 'Failed to generate script: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#282c34] border border-[#181a1f] rounded-lg shadow-xl w-[400px] flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-[#181a1f] bg-[#21252b] flex justify-between items-center">
          <h3 className="text-white font-semibold text-[14px] flex items-center gap-2">
            <span>✨</span> AI Generate Script
          </h3>
          <button onClick={onClose} className="text-[#abb2bf] hover:text-white transition-colors">
            ✕
          </button>
        </div>
        
        <div className="p-4 flex flex-col gap-3">
          <p className="text-[#abb2bf] text-[13px]">
            Describe what you want the robot to do, and Gemini will generate the code.
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Make the robot walk forward 5 steps, wave its right hand, and then turn left."
            className="w-full h-[100px] bg-[#1e2227] border border-[#181a1f] rounded p-2 text-[13px] text-white placeholder-[#5c6370] outline-none focus:border-[#4d78cc] resize-none"
            autoFocus
          />
        </div>
        
        <div className="px-4 py-3 border-t border-[#181a1f] bg-[#21252b] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-[13px] font-semibold transition-colors duration-120 bg-[#3e4451] text-white hover:bg-[#4c5363]"
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="px-4 py-1.5 rounded text-[13px] font-semibold transition-colors duration-120 bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-1.5"
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
}
