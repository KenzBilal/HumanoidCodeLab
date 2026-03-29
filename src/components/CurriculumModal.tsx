import { useState } from 'react';
import { useStore } from '../store';
import { Play, CheckCircle, XCircle } from 'lucide-react';
import { Interpreter } from '../engine/Interpreter';

const LEVELS = [
  {
    id: 1,
    title: 'Level 1: Forward March',
    prompt: 'Make the robot walk forward exactly 3 steps.',
    solution: [{ path: 'walk.forward', params: { steps: 3 } }]
  },
  {
    id: 2,
    title: 'Level 2: Look Left',
    prompt: 'Turn your robot to the left by 90 degrees.',
    solution: [{ path: 'turn.left', params: { angle: 90 } }]
  },
  {
    id: 3,
    title: 'Level 3: Happy Jump',
    prompt: 'Wave your right hand, then jump.',
    solution: [
      { path: 'right_hand.wave', params: {} },
      { path: 'jump.up', params: {} }
    ]
  }
];

export function CurriculumModal({ onClose }: { onClose: () => void }) {
  const { code } = useStore();
  const [activeLevel, setActiveLevel] = useState(0);
  const [result, setResult] = useState<'idle'|'success'|'fail'>('idle');

  const checkSolution = () => {
    const { actions, errors } = Interpreter.compile(code);
    if (errors.length > 0) {
      setResult('fail');
      return;
    }

    const expected = LEVELS[activeLevel].solution;
    if (actions.length < expected.length) {
      setResult('fail');
      return;
    }

    let success = true;
    for (let i = 0; i < expected.length; i++) {
      if (actions[i].path !== expected[i].path) {
        success = false; break;
      }
      for (const k in expected[i].params) {
        if (actions[i].params[k] !== expected[i].params[k]) {
          success = false; break;
        }
      }
    }

    setResult(success ? 'success' : 'fail');
  };

  const nextLevel = () => {
    if (activeLevel < LEVELS.length - 1) {
      setActiveLevel(activeLevel + 1);
      setResult('idle');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#282c34] border border-[#181a1f] w-[450px] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#181a1f] bg-[#2b2f36]">
          <h2 className="text-white text-lg font-bold">Training Curriculum</h2>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-[#61afef] font-bold text-sm mb-2">{LEVELS[activeLevel].title}</h3>
            <p className="text-[#abb2bf] text-sm whitespace-pre-wrap">{LEVELS[activeLevel].prompt}</p>
          </div>

          <div className="bg-[#1e2227] min-h-[60px] p-4 rounded-lg flex items-center justify-center">
            {result === 'idle' && <span className="text-[#5c6370] text-sm italic">Click "Check Solution" to verify your code.</span>}
            {result === 'success' && (
              <div className="flex items-center gap-2 text-[#98c379] font-bold">
                <CheckCircle size={20} /> Excellent! Correct logic detected.
              </div>
            )}
            {result === 'fail' && (
              <div className="flex items-center gap-2 text-[#e06c75] font-bold">
                <XCircle size={20} /> Oops! That doesn't look quite right.
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-[#2b2f36] border-t border-[#181a1f] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#abb2bf] hover:text-white transition-colors"
          >
            Close
          </button>

          {result === 'success' ? (
            <button
              onClick={nextLevel}
              className="px-4 py-2 bg-[#98c379] text-[#282c34] rounded hover:bg-[#b5cea8] font-bold text-sm transition-colors"
            >
              {activeLevel < LEVELS.length - 1 ? 'Next Level' : 'Finish Training'}
            </button>
          ) : (
            <button
              onClick={checkSolution}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500 flex items-center gap-2 text-sm font-bold transition-colors shadow-lg shadow-purple-900/50"
            >
              <Play size={14} fill="currentColor" />
              Check Solution
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
