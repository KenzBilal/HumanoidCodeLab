import { useStore, Template } from '../store';
import { X, FileCode, Play, Sparkles } from 'lucide-react';

const defaultTemplates: Template[] = [
  {
    id: 'basic-movement',
    name: 'Basic Movement',
    description: 'Learn fundamental robot movements',
    code: `# Basic Movement Template
# Walk forward and back

robot.walk.forward(steps=3)
robot.wait(seconds=0.5)
robot.walk.backward(steps=2)
robot.turn.left(angle=90)
robot.stand_up()
robot.idle()`,
    animations: []
  },
  {
    id: 'dance-routine',
    name: 'Dance Routine',
    description: 'Create a simple dance with arm movements',
    code: `# Dance Routine Template
# Make the robot dance!

for i in range(4):
    robot.right_hand.wave(times=2)
    robot.left_hand.wave(times=2)
    robot.jump(height=0.5)
    robot.wait(seconds=0.3)

robot.stand_up()
robot.idle()`,
    animations: []
  },
  {
    id: 'exercise-session',
    name: 'Exercise Session',
    description: 'Morning exercise routine for the robot',
    code: `# Exercise Session Template
# Warm up workout

robot.crouch()
robot.stand_up()

for i in range(3):
    robot.jump(height=1.0)
    robot.wait(seconds=0.2)

robot.walk.forward(steps=5)
robot.turn.left(angle=180)
robot.walk.forward(steps=5)

robot.stand_up()
robot.idle()`,
    animations: []
  },
  {
    id: 'greeting',
    name: 'Greeting',
    description: 'Wave hello and introduce itself',
    code: `# Greeting Template
# A friendly greeting

robot.right_hand.raise()
robot.right_hand.wave(times=3)
robot.right_hand.lower()

robot.left_hand.raise()
robot.left_hand.wave(times=2)
robot.left_hand.lower()

robot.jump(height=0.5)
robot.stand_up()
robot.idle()`,
    animations: []
  },
  {
    id: 'navigation',
    name: 'Navigation',
    description: 'Move around and explore',
    code: `# Navigation Template
# Explore the environment

robot.turn.right(angle=45)
robot.walk.forward(steps=3)

robot.turn.left(angle=90)
robot.walk.forward(steps=2)

robot.turn.left(angle=90)
robot.walk.forward(steps=3)

robot.turn.left(angle=45)
robot.stand_up()
robot.idle()`,
    animations: []
  },
  {
    id: 'custom-routine',
    name: 'Custom Routine',
    description: 'Blank template for your own code',
    code: `# Custom Routine
# Write your own robot commands here!

# Example:
# robot.walk.forward(steps=5)
# robot.turn.left(angle=90)
# robot.right_hand.wave(times=3)

robot.stand_up()
robot.idle()`,
    animations: []
  }
];

export function TemplateModal() {
  const { showTemplateModal, setShowTemplateModal, setCode, setCustomAnimations, addLog } = useStore();

  if (!showTemplateModal) return null;

  const handleSelectTemplate = (template: Template) => {
    setCode(template.code);
    if (template.animations && template.animations.length > 0) {
      setCustomAnimations(template.animations);
    }
    addLog('INFO', `Loaded template: ${template.name}`);
    setShowTemplateModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowTemplateModal(false)}>
      <div className="w-[600px] bg-[#21252b] rounded-lg shadow-2xl border border-[#181a1f]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#181a1f]">
          <h2 className="text-white font-semibold text-[15px] flex items-center gap-2">
            <Sparkles size={18} className="text-purple-400" />
            Start from Template
          </h2>
          <button onClick={() => setShowTemplateModal(false)} className="text-[#5c6370] hover:text-white">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-[#8b949e] text-[13px] mb-4">Choose a template to get started quickly</p>
          
          <div className="grid grid-cols-2 gap-3">
            {defaultTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="bg-[#282c34] hover:bg-[#2c313a] border border-[#181a1f] hover:border-purple-500/50 rounded-lg p-3 text-left transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileCode size={16} className="text-purple-400" />
                  <span className="text-white font-medium text-[13px]">{template.name}</span>
                </div>
                <p className="text-[#8b949e] text-[12px]">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}