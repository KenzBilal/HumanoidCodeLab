import { useStore } from '../store';
import { CommandRegistry } from '../engine/CommandRegistry';
import { Humanoid } from '../engine/Humanoid';
import { Activity, Circle, Hexagon, Box } from 'lucide-react';

const nodes = [
  { lbl: 'Humanoid', type: 'root', d: 0, root: true },
  { lbl: 'Hips', type: 'joint', d: 1, part: 'hips' },
  { lbl: 'Head', type: 'folder', d: 1, part: 'head', api: 'head', grp: true },
  { lbl: 'Neck', type: 'joint', d: 2, part: 'neck' },
  { lbl: 'Torso', type: 'joint', d: 1, part: 'torso', api: 'torso' },
  { lbl: 'Left Arm', type: 'folder', d: 1, grp: true },
  { lbl: 'Shoulder', type: 'joint', d: 2, part: 'left_shoulder' },
  { lbl: 'Upper Arm', type: 'joint', d: 2, part: 'left_upper_arm', api: 'left_arm' },
  { lbl: 'Elbow', type: 'joint', d: 2, part: 'left_elbow' },
  { lbl: 'Forearm', type: 'joint', d: 2, part: 'left_forearm' },
  { lbl: 'Hand', type: 'joint', d: 2, part: 'left_hand' },
  { lbl: 'Right Arm', type: 'folder', d: 1, grp: true },
  { lbl: 'Shoulder', type: 'joint', d: 2, part: 'right_shoulder' },
  { lbl: 'Upper Arm', type: 'joint', d: 2, part: 'right_upper_arm', api: 'right_arm' },
  { lbl: 'Elbow', type: 'joint', d: 2, part: 'right_elbow' },
  { lbl: 'Forearm', type: 'joint', d: 2, part: 'right_forearm' },
  { lbl: 'Hand', type: 'joint', d: 2, part: 'right_hand' },
  { lbl: 'Left Leg', type: 'folder', d: 1, grp: true },
  { lbl: 'Hip', type: 'joint', d: 2, part: 'left_hip' },
  { lbl: 'Thigh', type: 'joint', d: 2, part: 'left_thigh' },
  { lbl: 'Knee', type: 'joint', d: 2, part: 'left_knee' },
  { lbl: 'Shin', type: 'joint', d: 2, part: 'left_shin' },
  { lbl: 'Foot', type: 'joint', d: 2, part: 'left_foot' },
  { lbl: 'Right Leg', type: 'folder', d: 1, grp: true },
  { lbl: 'Hip', type: 'joint', d: 2, part: 'right_hip' },
  { lbl: 'Thigh', type: 'joint', d: 2, part: 'right_thigh' },
  { lbl: 'Knee', type: 'joint', d: 2, part: 'right_knee' },
  { lbl: 'Shin', type: 'joint', d: 2, part: 'right_shin' },
  { lbl: 'Foot', type: 'joint', d: 2, part: 'right_foot' },
];

export function LeftPanel({ bot }: { bot: Humanoid | null }) {
  const { activePart, setActivePart, addLog } = useStore();

  const handleNodeClick = (node: any) => {
    if (!node.part) return;
    setActivePart(node.part);
    if (bot) bot.highlight(node.part);
    
    if (node.api) {
      const cmds = CommandRegistry.byCategory(node.api);
      if (cmds.length) {
        addLog('INFO', `${node.lbl} commands: ${cmds.map(c => 'robot.' + c.path + '()').join(' | ')}`);
      }
    }
  };

  const getIcon = (type: string) => {
    if (type === 'root') return <Activity size={14} className="text-[#e5c07b]" />;
    if (type === 'folder') return <Hexagon size={14} className="text-[#61afef]" />;
    return <Circle size={12} className="text-[#abb2bf]" />;
  };

  return (
    <div className="w-[200px] bg-[#333842] border-r border-[#181a1f] flex flex-col shrink-0 overflow-hidden text-ellipsis">
      <h3 className="text-[14px] font-semibold text-[#abb2bf] px-4 py-3 border-b border-[#181a1f] bg-[#2b2f36]">
        Body Parts
      </h3>
      <div className="flex-1 overflow-y-auto py-2">
        {nodes.map((n, i) => {
          const indent = n.d * 12;
          const isActive = activePart === n.part;
          const arrow = n.grp || n.root ? '▾' : '';
          
          return (
            <div
              key={n.part}
              onClick={() => handleNodeClick(n)}
              className={`flex items-center py-1.5 px-2 text-[13px] cursor-pointer transition-colors duration-100 whitespace-nowrap gap-1.5 ${isActive ? 'bg-[#4d78cc] text-white' : 'text-[#abb2bf] hover:bg-[#2c313a] hover:text-white'}`}
              style={{ paddingLeft: `${indent + 8}px` }}
            >
              <span className="w-3 text-[10px] shrink-0 flex justify-center text-[#5c6370]">
                {arrow}
              </span>
              <span className="flex items-center justify-center opacity-90 pr-1">
                {getIcon(n.type)}
              </span>
              <span className="font-medium tracking-wide">{n.lbl}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

