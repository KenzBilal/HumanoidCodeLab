import { useState, useEffect } from 'react';
import { useStore, CustomAnimation, Keyframe, EasingType } from '../store';
import { Humanoid } from '../engine/Humanoid';

const PART_GROUPS = [
  {
    label: 'Body',
    parts: [
      { name: 'root', label: 'Root (Full Body)' },
      { name: 'hips', label: 'Hips' },
      { name: 'torso', label: 'Torso' },
      { name: 'neck', label: 'Neck' },
      { name: 'head', label: 'Head' },
    ]
  },
  {
    label: 'Left Arm',
    parts: [
      { name: 'left_shoulder', label: 'Shoulder' },
      { name: 'left_upper_arm', label: 'Upper Arm' },
      { name: 'left_elbow', label: 'Elbow' },
      { name: 'left_forearm', label: 'Forearm' },
      { name: 'left_hand', label: 'Hand' },
    ]
  },
  {
    label: 'Right Arm',
    parts: [
      { name: 'right_shoulder', label: 'Shoulder' },
      { name: 'right_upper_arm', label: 'Upper Arm' },
      { name: 'right_elbow', label: 'Elbow' },
      { name: 'right_forearm', label: 'Forearm' },
      { name: 'right_hand', label: 'Hand' },
    ]
  },
  {
    label: 'Left Leg',
    parts: [
      { name: 'left_hip', label: 'Hip' },
      { name: 'left_thigh', label: 'Thigh' },
      { name: 'left_knee', label: 'Knee' },
      { name: 'left_shin', label: 'Shin' },
      { name: 'left_foot', label: 'Foot' },
    ]
  },
  {
    label: 'Right Leg',
    parts: [
      { name: 'right_hip', label: 'Hip' },
      { name: 'right_thigh', label: 'Thigh' },
      { name: 'right_knee', label: 'Knee' },
      { name: 'right_shin', label: 'Shin' },
      { name: 'right_foot', label: 'Foot' },
    ]
  }
];

const EASING_OPTIONS: { value: EasingType; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In-Out' },
  { value: 'bounce', label: 'Bounce' },
];

const AXIS_COLORS: Record<string, string> = {
  x: '#e06c75',
  y: '#98c379',
  z: '#61afef',
};

export function AnimatorRightPanel({ bot }: { bot: Humanoid | null }) {
  const { customAnimations, setCustomAnimations, activeAnimationId, activeKeyframeId, activePart, setActivePart, pushUndo, playbackTime, addLog } = useStore();
  const [clipboardRotation, setClipboardRotation] = useState<{ x: number; y: number; z: number } | null>(null);

  const activeAnim = customAnimations.find(a => a.id === activeAnimationId);
  const keyframes = activeAnim?.keyframes || [];
  const activeKf = keyframes.find(k => k.id === activeKeyframeId) || keyframes[0];

  // Reset robot to grounded default and sync pose when animation/keyframe changes
  useEffect(() => {
    if (!bot) return;

    // Always start from grounded default pose
    bot.poseState = 'standing';
    bot._locked.clear();
    bot.root.position.set(0, 0, 0);
    bot.root.rotation.set(0, 0, 0);
    Object.values(bot.parts).forEach(part => {
      const d = part.defaultRot;
      part.g.rotation.set(d.x, d.y, d.z);
      if (part.defaultPos) {
        part.g.position.set(part.defaultPos.x, part.defaultPos.y, part.defaultPos.z);
      }
    });

    // If there's an active keyframe, apply its pose on top
    if (activeKf) {
      // Apply root Y offset (0 = default standing height, negative = crouch)
      const defaultY = bot.parts.hips?.defaultPos?.y ?? 1.18;
      const yOffset = activeKf.rootOffset?.y ?? 0;
      bot.root.position.y = defaultY + yOffset;

      // Apply joint rotations
      for (const [partName, rot] of Object.entries(activeKf.rotations)) {
        if (partName === 'root') {
          bot.root.rotation.set(rot.x, rot.y, rot.z);
        } else if (bot.parts[partName]) {
          bot.parts[partName].g.rotation.set(rot.x, rot.y, rot.z);
        }
      }
    }

    // Clamp to floor so robot never goes underground
    bot.preventFloorClipping();
  }, [activeAnimationId, activeKf?.id, bot]);

  // Highlight selected part on 3D model
  useEffect(() => {
    if (bot) {
      bot.highlight(activePart);
    }
  }, [activePart, bot]);

  const updateAnim = (updates: Partial<CustomAnimation>) => {
    if (!activeAnim) return;
    pushUndo();
    setCustomAnimations(customAnimations.map(a => a.id === activeAnim.id ? { ...a, ...updates } : a));
  };

  const updateKeyframe = (updates: Partial<Keyframe>) => {
    if (!activeAnim || !activeKf) return;
    pushUndo();
    const newKeyframes = keyframes.map(k => k.id === activeKf.id ? { ...k, ...updates } : k);
    setCustomAnimations(customAnimations.map(a => a.id === activeAnim.id ? { ...a, keyframes: newKeyframes } : a));
  };

  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number) => {
    if (!activeAnim || !activeKf || !activePart) return;
    const currentRots = activeKf.rotations[activePart] || { x: 0, y: 0, z: 0 };
    const newRots = { ...activeKf.rotations, [activePart]: { ...currentRots, [axis]: value } };
    updateKeyframe({ rotations: newRots });

    if (bot) {
      if (activePart === 'root') {
        bot.root.rotation[axis] = value;
      } else if (bot.parts[activePart]) {
        bot.parts[activePart].g.rotation[axis] = value;
      }
      bot.preventFloorClipping();
    }
  };

  const handlePreview = async () => {
    if (!bot || !activeAnim) return;
    try {
      await bot.playCustom(activeAnim);
    } catch (err: any) {
      addLog('ERROR', `Preview failed: ${err.message}`);
    }
  };

  const handleResetPose = () => {
    if (!bot || !activeKf) return;
    pushUndo();
    updateKeyframe({ rotations: {}, rootOffset: { y: 0 } });
    // Immediately snap robot to grounded default
    bot.poseState = 'standing';
    bot._locked.clear();
    bot.root.position.set(0, 0, 0);
    bot.root.rotation.set(0, 0, 0);
    Object.values(bot.parts).forEach(part => {
      const d = part.defaultRot;
      part.g.rotation.set(d.x, d.y, d.z);
      if (part.defaultPos) {
        part.g.position.set(part.defaultPos.x, part.defaultPos.y, part.defaultPos.z);
      }
    });
    bot.preventFloorClipping();
  };

  const handleCopyPose = () => {
    if (!activePart || !activeKf) return;
    const rot = activeKf.rotations[activePart] || { x: 0, y: 0, z: 0 };
    setClipboardRotation({ ...rot });
  };

  const handlePastePose = () => {
    if (!activePart || !activeKf || !clipboardRotation) return;
    handleRotationChange('x', clipboardRotation.x);
    handleRotationChange('y', clipboardRotation.y);
    handleRotationChange('z', clipboardRotation.z);
  };

  const handleResetPartRotation = () => {
    if (!activePart || !activeKf) return;
    const newRots = { ...activeKf.rotations };
    delete newRots[activePart];
    updateKeyframe({ rotations: newRots });
    if (bot) {
      if (activePart === 'root') {
        bot.root.rotation.set(0, 0, 0);
      } else if (bot.parts[activePart]) {
        const d = bot.parts[activePart].defaultRot;
        bot.parts[activePart].g.rotation.set(d.x, d.y, d.z);
      }
    }
  };

  if (!activeAnim || !activeKf) {
    return (
      <div className="w-[300px] bg-[#21252b] border-l border-[#181a1f] flex flex-col shrink-0 items-center justify-center text-[#5c6370] text-[13px] p-6 text-center gap-2">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5c6370" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
        <span>Select or create an animation to edit.</span>
      </div>
    );
  }

  const currentPartRot = activePart && activeKf
    ? (activeKf.rotations[activePart] || { x: 0, y: 0, z: 0 })
    : null;

  return (
    <div className="w-[300px] bg-[#21252b] border-l border-[#181a1f] flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="h-[32px] bg-[#282c34] border-b border-[#181a1f] flex items-center px-3 text-[11px] font-bold text-[#abb2bf] tracking-wider shrink-0 justify-between">
        <span>ANIMATION</span>
        <div className="flex gap-2">
          <button onClick={handleResetPose} className="text-[#e5c07b] hover:text-white transition-colors cursor-pointer" title="Reset Pose">
            ↺
          </button>
          <button onClick={handlePreview} className="text-[#98c379] hover:text-white transition-colors cursor-pointer" title="Preview">
            ▶
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Section: Animation Properties */}
        <div className="p-3 border-b border-[#181a1f]">
          <div className="text-[10px] font-bold text-[#5c6370] tracking-wider mb-2">PROPERTIES</div>

          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#5c6370]">Name</label>
              <input
                type="text"
                value={activeAnim.name}
                onChange={e => updateAnim({ name: e.target.value })}
                className="bg-[#1e2227] border border-[#181a1f] rounded px-2 py-1 text-[12px] text-white focus:outline-none focus:border-[#4d78cc]"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[10px] text-[#5c6370]">Duration (ms)</label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateAnim({ duration: Math.max(100, activeAnim.duration - 100) })}
                    className="bg-[#1e2227] border border-[#181a1f] rounded px-1.5 py-1 text-[11px] text-[#abb2bf] hover:text-white hover:border-[#4d78cc]"
                  >-</button>
                  <input
                    type="number"
                    value={activeAnim.duration}
                    onChange={e => updateAnim({ duration: Math.max(100, parseInt(e.target.value) || 100) })}
                    className="bg-[#1e2227] border border-[#181a1f] rounded px-2 py-1 text-[12px] text-white focus:outline-none focus:border-[#4d78cc] w-full text-center"
                  />
                  <button
                    onClick={() => updateAnim({ duration: activeAnim.duration + 100 })}
                    className="bg-[#1e2227] border border-[#181a1f] rounded px-1.5 py-1 text-[11px] text-[#abb2bf] hover:text-white hover:border-[#4d78cc]"
                  >+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Keyframe Properties */}
        <div className="p-3 border-b border-[#181a1f]">
          <div className="text-[10px] font-bold text-[#5c6370] tracking-wider mb-2">KEYFRAME</div>

          <div className="flex flex-col gap-2.5">
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[10px] text-[#5c6370]">Time (%)</label>
                <input
                  type="number"
                  min={0} max={100} step={1}
                  value={(activeKf.time * 100).toFixed(0)}
                  onChange={e => {
                    const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                    updateKeyframe({ time: val / 100 });
                  }}
                  className="bg-[#1e2227] border border-[#181a1f] rounded px-2 py-1 text-[12px] text-white focus:outline-none focus:border-[#4d78cc] text-center"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[10px] text-[#5c6370]">Easing</label>
                <select
                  value={activeKf.easing || 'linear'}
                  onChange={e => updateKeyframe({ easing: e.target.value as EasingType })}
                  className="bg-[#1e2227] border border-[#181a1f] rounded px-2 py-1 text-[12px] text-[#e5c07b] focus:outline-none focus:border-[#4d78cc]"
                >
                  {EASING_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-[#5c6370]">Root Y Offset</label>
                <button onClick={() => {
                  updateKeyframe({ rootOffset: { y: 0 } });
                  if (bot) {
                    const defaultY = bot.parts.hips?.defaultPos?.y ?? 1.18;
                    bot.root.position.y = defaultY;
                    bot.preventFloorClipping();
                  }
                }} className="text-[9px] text-[#e06c75] hover:text-[#ff7b85]">
                  Ground
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="-2" max="2" step="0.01"
                  value={activeKf.rootOffset?.y ?? 0}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    updateKeyframe({ rootOffset: { y: val } });
                    if (bot) {
                      const defaultY = bot.parts.hips?.defaultPos?.y ?? 1.18;
                      bot.root.position.y = defaultY + val;
                      bot.preventFloorClipping();
                    }
                  }}
                  className="flex-1 accent-[#4d78cc]"
                />
                <input
                  type="number"
                  step="0.05"
                  value={(activeKf.rootOffset?.y ?? 0).toFixed(2)}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    updateKeyframe({ rootOffset: { y: val } });
                    if (bot) {
                      const defaultY = bot.parts.hips?.defaultPos?.y ?? 1.18;
                      bot.root.position.y = defaultY + val;
                      bot.preventFloorClipping();
                    }
                  }}
                  className="w-16 bg-[#1e2227] border border-[#181a1f] rounded px-1 py-0.5 text-[11px] text-white text-center focus:outline-none focus:border-[#4d78cc]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Pose Editor */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold text-[#5c6370] tracking-wider">POSE EDITOR</div>
            {activePart && (
              <div className="flex gap-1.5">
                <button
                  onClick={handleCopyPose}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-[#1e2227] text-[#5c6370] hover:text-[#abb2bf] border border-[#181a1f]"
                  title="Copy Pose"
                >
                  Copy
                </button>
                {clipboardRotation && (
                  <button
                    onClick={handlePastePose}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-[#1e2227] text-[#5c6370] hover:text-[#abb2bf] border border-[#181a1f]"
                    title="Paste Pose"
                  >
                    Paste
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Part Selector */}
          <select
            value={activePart || ''}
            onChange={e => setActivePart(e.target.value || null)}
            className="w-full bg-[#1e2227] border border-[#181a1f] rounded px-2 py-1.5 text-[12px] text-[#e5c07b] focus:outline-none focus:border-[#4d78cc] mb-3"
          >
            <option value="">-- Select Part --</option>
            {PART_GROUPS.map(group => (
              <optgroup key={group.label} label={group.label}>
                {group.parts.map(p => (
                  <option key={p.name} value={p.name}>{p.label}</option>
                ))}
              </optgroup>
            ))}
          </select>

          {/* Rotation Controls */}
          {activePart && currentPartRot && (
            <div className="flex flex-col gap-2.5">
              {(['x', 'y', 'z'] as const).map(axis => (
                <div key={axis} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase" style={{ color: AXIS_COLORS[axis] }}>
                      Rotation {axis.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="1"
                        value={(currentPartRot[axis] * 180 / Math.PI).toFixed(1)}
                        onChange={e => {
                          const deg = parseFloat(e.target.value) || 0;
                          handleRotationChange(axis, deg * Math.PI / 180);
                        }}
                        className="w-16 bg-[#1e2227] border border-[#181a1f] rounded px-1 py-0.5 text-[11px] text-white text-center focus:outline-none focus:border-[#4d78cc]"
                      />
                      <span className="text-[9px] text-[#5c6370]">°</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="range"
                      min={-Math.PI} max={Math.PI} step="0.01"
                      value={currentPartRot[axis]}
                      onChange={e => handleRotationChange(axis, parseFloat(e.target.value))}
                      className="flex-1"
                      style={{ accentColor: AXIS_COLORS[axis] }}
                    />
                    <button
                      onClick={() => handleRotationChange(axis, 0)}
                      className="text-[9px] text-[#5c6370] hover:text-[#e06c75] w-5 text-center"
                      title="Reset axis"
                    >
                      0
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={handleResetPartRotation}
                className="mt-1 text-[10px] text-[#e06c75] hover:text-[#ff7b85] text-left py-1"
              >
                Reset Part Rotation
              </button>
            </div>
          )}

          {!activePart && (
            <div className="text-[11px] text-[#5c6370] text-center py-4 italic">
              Select a body part to edit its rotation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
