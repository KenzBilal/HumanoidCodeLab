import { useStore } from '../store';
import { CommandRegistry } from '../engine/CommandRegistry';
import { Humanoid } from '../engine/Humanoid';

const nodes = [
  { lbl: 'Humanoid', ico: '📁', d: 0, root: true },
  { lbl: 'Hips', ico: '📄', d: 1, part: 'hips' },
  { lbl: 'Head', ico: '📁', d: 1, part: 'head', api: 'head', grp: true },
  { lbl: 'Neck', ico: '📄', d: 2, part: 'neck' },
  { lbl: 'Torso', ico: '📄', d: 1, part: 'torso', api: 'torso' },
  { lbl: 'Left Arm', ico: '📁', d: 1, grp: true },
  { lbl: 'Shoulder', ico: '📄', d: 2, part: 'left_shoulder' },
  { lbl: 'Upper Arm', ico: '📄', d: 2, part: 'left_upper_arm', api: 'left_arm' },
  { lbl: 'Elbow', ico: '📄', d: 2, part: 'left_elbow' },
  { lbl: 'Forearm', ico: '📄', d: 2, part: 'left_forearm' },
  { lbl: 'Hand', ico: '📄', d: 2, part: 'left_hand' },
  { lbl: 'Right Arm', ico: '📁', d: 1, grp: true },
  { lbl: 'Shoulder', ico: '📄', d: 2, part: 'right_shoulder' },
  { lbl: 'Upper Arm', ico: '📄', d: 2, part: 'right_upper_arm', api: 'right_arm' },
  { lbl: 'Elbow', ico: '📄', d: 2, part: 'right_elbow' },
  { lbl: 'Forearm', ico: '📄', d: 2, part: 'right_forearm' },
  { lbl: 'Hand', ico: '📄', d: 2, part: 'right_hand' },
  { lbl: 'Left Leg', ico: '📁', d: 1, grp: true },
  { lbl: 'Hip', ico: '📄', d: 2, part: 'left_hip' },
  { lbl: 'Thigh', ico: '📄', d: 2, part: 'left_thigh' },
  { lbl: 'Knee', ico: '📄', d: 2, part: 'left_knee' },
  { lbl: 'Shin', ico: '📄', d: 2, part: 'left_shin' },
  { lbl: 'Foot', ico: '📄', d: 2, part: 'left_foot' },
  { lbl: 'Right Leg', ico: '📁', d: 1, grp: true },
  { lbl: 'Hip', ico: '📄', d: 2, part: 'right_hip' },
  { lbl: 'Thigh', ico: '📄', d: 2, part: 'right_thigh' },
  { lbl: 'Knee', ico: '📄', d: 2, part: 'right_knee' },
  { lbl: 'Shin', ico: '📄', d: 2, part: 'right_shin' },
  { lbl: 'Foot', ico: '📄', d: 2, part: 'right_foot' },
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

  return (
    <div className="w-[200px] bg-[#333842] border-r border-[#181a1f] flex flex-col shrink-0">
      <h3 className="text-[14px] font-semibold text-[#abb2bf] px-4 py-3 border-b border-[#181a1f] bg-[#2b2f36]">
        Body Parts
      </h3>
      <div className="flex-1 overflow-y-auto py-2">
        {nodes.map((n, i) => {
          const indent = n.d * 12;
          const arrow = n.grp || n.root ? '▾' : '';
          const isActive = activePart === n.part;
          
          return (
            <div
              key={i}
              onClick={() => handleNodeClick(n)}
              className={`flex items-center py-1 px-2 text-[13px] cursor-pointer transition-colors duration-100 whitespace-nowrap gap-1.5 ${isActive ? 'bg-[#2c313a] text-white' : 'text-[#abb2bf] hover:bg-[#2c313a] hover:text-white'}`}
              style={{ paddingLeft: `${indent + 8}px` }}
            >
              <span className="w-3 text-[10px] shrink-0 flex justify-center">
                {arrow}
              </span>
              <span className="text-[14px] flex items-center justify-center opacity-80">
                {n.ico === '📁' ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.543l-1.6-1.6A1.75 1.75 0 0 0 4.707 1H1.75Z"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-2.938-2.938Z"/></svg>
                )}
              </span>
              <span className="font-medium">{n.lbl}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
