import { useStore } from '../store';
import { X, ChevronRight, BookOpen, Terminal, Cpu, Sparkles, Keyboard } from 'lucide-react';
import { useState } from 'react';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export function HelpModal() {
  const { showHelpModal, setShowHelpModal } = useStore();
  const [activeSection, setActiveSection] = useState('getting-started');

  if (!showHelpModal) return null;

  const sections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <BookOpen size={18} />,
      content: (
        <div className="space-y-4 text-[13px] text-[#abb2bf]">
          <h3 className="text-purple-400 font-semibold text-[15px]">Welcome to Humanoid Code Lab!</h3>
          <p>This app lets you program and animate a 3D humanoid robot using simple code commands.</p>
          
          <div className="bg-[#282c34] p-3 rounded border-l-2 border-purple-500">
            <h4 className="text-white font-medium mb-2">Quick Start</h4>
            <ol className="list-decimal list-inside space-y-1 text-[#8b949e]">
              <li>Write code in the editor (left side)</li>
              <li>Press <span className="bg-[#3e4451] px-1.5 py-0.5 rounded text-purple-400">Ctrl+Enter</span> to run</li>
              <li>Watch the robot respond in the 3D viewport</li>
            </ol>
          </div>

          <div>
            <h4 className="text-white font-medium mb-2">Interface Modes</h4>
            <ul className="space-y-2 text-[#8b949e]">
              <li><span className="text-purple-400">Editor Mode</span> - Write and run robot code</li>
              <li><span className="text-purple-400">Animator Mode</span> - Create keyframe animations visually</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'commands',
      title: 'Commands Reference',
      icon: <Terminal size={18} />,
      content: (
        <div className="space-y-4 text-[13px] text-[#abb2bf] overflow-y-auto max-h-[400px]">
          <h3 className="text-purple-400 font-semibold text-[15px]">Available Commands</h3>
          
          <div className="space-y-3">
            <div>
              <h4 className="text-white font-medium mb-1">Movement</h4>
              <div className="text-[12px] text-[#8b949e] space-y-1">
                <div><code className="bg-[#282c34] px-1 rounded text-purple-400">robot.walk.forward(steps=N)</code> - Walk forward</div>
                <div><code className="bg-[#282c34] px-1 rounded text-purple-400">robot.walk.backward(steps=N)</code> - Walk backward</div>
                <div><code className="bg-[#282c34] px-1 rounded text-purple-400">robot.turn.left(angle=N)</code> - Turn left</div>
                <div><code className="bg-[#282c34] px-1 rounded text-purple-400">robot.turn.right(angle=N)</code> - Turn right</div>
                <div><code className="bg-[#282c34] px-1 rounded text-purple-400">robot.jump(height=N)</code> - Jump</div>
                <div><code className="bg-[#282c34] px-1 rounded text-purple-400">robot.crouch()</code> - Crouch</div>
                <div><code className="bg-[#282c34] px-1 rounded text-purple-400">robot.stand_up()</code> - Stand up</div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-medium mb-1">Head</h4>
              <div className="text-[12px] text-[#8b949e] space-y-1">
                <div><code className="bg-[#282c34] px-1 rounded text-purple-400">robot.head.look_left()</code></div>
                <div><code className="bg-[#282c34] px-1 rounded text-purple-400">robot.head.look_right()</code></div>
                <div><code className="bg-[#282c34] px-1 rounded text-purple-400">robot.head.nod(times=N)</code></div>
                <div><code className="bg-[#282c34] px-1 rounded text-purple-400">robot.head.tilt(angle=N)</code></div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-medium mb-1">Arms</h4>
              <div className="text-[12px] text-[#8b949e] space-y-1">
                <div><code className="bg-[#282c34] px-1 rounded text-purple-400">robot.left_hand.raise()</code></div>
                <div><code className="bg-[#282c34] px-1 rounded text-purple-400">robot.right_hand.wave(times=N)</code></div>
                <div><code className="bg-[#282c34] px-1 rounded text-purple-400">robot.right_arm.elbow.bend(angle=N)</code></div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-medium mb-1">Body</h4>
              <div className="text-[12px] text-[#8b949e] space-y-1">
                <div><code className="bg-[#282c34] px-1 rounded text-purple-400">robot.wait(seconds=N)</code> - Pause for N seconds</div>
                <div><code className="bg-[#282c34] px-1 rounded text-purple-400">robot.reset()</code> - Reset pose</div>
                <div><code className="bg-[#282c34] px-1 rounded text-purple-400">robot.play(animation='name')</code> - Play animation</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'programming',
      title: 'Programming Basics',
      icon: <Keyboard size={18} />,
      content: (
        <div className="space-y-4 text-[13px] text-[#abb2bf]">
          <h3 className="text-purple-400 font-semibold text-[15px]">Writing Robot Code</h3>
          
          <div>
            <h4 className="text-white font-medium mb-2">Variables</h4>
            <pre className="bg-[#282c34] p-3 rounded text-[12px] overflow-x-auto text-[#8b949e]">{`steps = 5
name = "robot"`}</pre>
          </div>

          <div>
            <h4 className="text-white font-medium mb-2">For Loops</h4>
            <pre className="bg-[#282c34] p-3 rounded text-[12px] overflow-x-auto text-[#8b949e]">{`for i in range(3):
    robot.walk.forward(steps=1)
    robot.wait(seconds=0.5)`}</pre>
          </div>

          <div>
            <h4 className="text-white font-medium mb-2">Conditionals</h4>
            <pre className="bg-[#282c34] p-3 rounded text-[12px] overflow-x-auto text-[#8b949e]">{`if steps > 3:
    robot.jump(height=1.0)
elif steps == 1:
    robot.crouch()
else:
    robot.stand_up()`}</pre>
          </div>
        </div>
      )
    },
    {
      id: 'ai',
      title: 'AI Features',
      icon: <Sparkles size={18} />,
      content: (
        <div className="space-y-4 text-[13px] text-[#abb2bf]">
          <h3 className="text-purple-400 font-semibold text-[15px]">Generate Code with AI</h3>
          
          <p>This app supports multiple AI providers for code generation:</p>
          
          <div className="bg-[#282c34] p-3 rounded">
            <h4 className="text-white font-medium mb-2">Supported Providers</h4>
            <ul className="space-y-1 text-[#8b949e]">
              <li><span className="text-purple-400">Google Gemini</span> - Default, free tier available</li>
              <li><span className="text-purple-400">OpenAI GPT-4o</span> - Requires API key</li>
              <li><span className="text-purple-400">Anthropic Claude</span> - Requires API key</li>
              <li><span className="text-purple-400">xAI Grok</span> - Requires API key</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-2">How to Use</h4>
            <ol className="list-decimal list-inside space-y-1 text-[#8b949e]">
              <li>Click the 🔒 icon to connect an AI provider</li>
              <li>Enter your API key</li>
              <li>Click ✨ and describe what you want</li>
              <li>AI generates code automatically</li>
            </ol>
          </div>

          <div className="bg-[#282c34] p-3 rounded border-l-2 border-green-500">
            <span className="text-green-400 font-medium">Note:</span>
            <span className="text-[#8b949e]"> The app works fully offline without AI. You can always write code manually.</span>
          </div>
        </div>
      )
    },
    {
      id: 'animator',
      title: 'Animator Guide',
      icon: <Cpu size={18} />,
      content: (
        <div className="space-y-4 text-[13px] text-[#abb2bf]">
          <h3 className="text-purple-400 font-semibold text-[15px]">Creating Animations</h3>
          
          <div>
            <h4 className="text-white font-medium mb-2">Getting Started</h4>
            <ol className="list-decimal list-inside space-y-1 text-[#8b949e]">
              <li>Click the <span className="text-purple-400">Animator</span> tab in top bar</li>
              <li>Click <span className="text-purple-400">+ NEW</span> to create an animation</li>
              <li>Add keyframes and adjust poses</li>
              <li>Click Preview to test</li>
            </ol>
          </div>

          <div>
            <h4 className="text-white font-medium mb-2">Timeline Controls</h4>
            <ul className="space-y-1 text-[#8b949e]">
              <li><span className="text-purple-400">Space</span> - Play/Pause</li>
              <li><span className="text-purple-400">Home/End</span> - Jump to start/end</li>
              <li><span className="text-purple-400">Arrow Keys</span> - Nudge keyframe</li>
              <li><span className="text-purple-400">Ctrl+D</span> - Duplicate keyframe</li>
              <li><span className="text-purple-400">Delete</span> - Remove keyframe</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-2">Easing Options</h4>
            <ul className="space-y-1 text-[#8b949e]">
              <li><span className="text-purple-400">linear</span> - Constant speed</li>
              <li><span className="text-purple-400">ease-in</span> - Slow start</li>
              <li><span className="text-purple-400">ease-out</span> - Slow end</li>
              <li><span className="text-purple-400">ease-in-out</span> - Smooth both ends</li>
              <li><span className="text-purple-400">bounce</span> - Bouncy effect</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowHelpModal(false)}>
      <div className="w-[700px] h-[500px] bg-[#21252b] rounded-lg shadow-2xl border border-[#181a1f] flex overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="w-[200px] bg-[#1e2227] border-r border-[#181a1f] p-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-[15px]">Help</h2>
            <button onClick={() => setShowHelpModal(false)} className="text-[#5c6370] hover:text-white">
              <X size={18} />
            </button>
          </div>
          
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded text-[13px] text-left ${activeSection === section.id ? 'bg-purple-600/20 text-purple-400' : 'text-[#8b949e] hover:bg-[#282c34] hover:text-[#abb2bf]'}`}
              >
                {section.icon}
                {section.title}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          {sections.find(s => s.id === activeSection)?.content}
        </div>
      </div>
    </div>
  );
}