import { useState } from 'react';
import { useStore } from '../store';

export function AnimatorLeftPanel() {
  const { customAnimations, setCustomAnimations, activeAnimationId, setActiveAnimationId, pushUndo, setActiveKeyframeId, addLog } = useStore();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleCreate = () => {
    pushUndo();
    const newAnim = {
      id: Math.random().toString(36).substring(2, 9),
      name: `Animation ${customAnimations.length + 1}`,
      duration: 1000,
      keyframes: [{
        id: Math.random().toString(36).substring(2, 9),
        time: 1,
        rotations: {},
        rootOffset: { y: 0 },
        easing: 'linear' as const
      }]
    };
    setCustomAnimations([...customAnimations, newAnim]);
    setActiveAnimationId(newAnim.id);
    setActiveKeyframeId(newAnim.keyframes[0].id);
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const anim = customAnimations.find(a => a.id === id);
    if (!anim) return;
    pushUndo();
    const newAnim = {
      ...JSON.parse(JSON.stringify(anim)),
      id: Math.random().toString(36).substring(2, 9),
      name: `${anim.name} (copy)`,
      keyframes: anim.keyframes.map((kf: any) => ({
        ...kf,
        id: Math.random().toString(36).substring(2, 9)
      }))
    };
    setCustomAnimations([...customAnimations, newAnim]);
    setActiveAnimationId(newAnim.id);
    if (newAnim.keyframes.length > 0) {
      setActiveKeyframeId(newAnim.keyframes[0].id);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 2000);
      return;
    }
    pushUndo();
    setCustomAnimations(customAnimations.filter(a => a.id !== id));
    if (activeAnimationId === id) {
      setActiveAnimationId(null);
      setActiveKeyframeId(null);
    }
    setConfirmDeleteId(null);
  };

  const handleExport = () => {
    const data = JSON.stringify(customAnimations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animations.json';
    a.click();
    URL.revokeObjectURL(url);
    addLog('SUCCESS', `Exported ${customAnimations.length} animation(s).`);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        addLog('ERROR', 'Import file is too large. Max size is 5MB.');
        (e.target as HTMLInputElement).value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target?.result as string);
          
          const isValidAnimation = (a: any): boolean =>
            typeof a.id === 'string' &&
            typeof a.name === 'string' &&
            typeof a.duration === 'number' &&
            Array.isArray(a.keyframes) &&
            a.keyframes.every((kf: any) =>
              typeof kf.id === 'string' &&
              typeof kf.time === 'number' &&
              kf.time >= 0 && kf.time <= 1 &&
              typeof kf.rotations === 'object'
            );

          if (!Array.isArray(imported) || !imported.every(isValidAnimation)) {
            throw new Error('Invalid animation schema');
          }
          
          pushUndo();
          setCustomAnimations([...customAnimations, ...imported]);
          addLog('SUCCESS', `Imported ${imported.length} animation(s).`);
        } catch {
          addLog('ERROR', 'Failed to import: invalid JSON file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="bg-[#21252b] border-r border-[#181a1f] flex flex-col w-full h-full">
      <div className="bg-[#282c34] border-b border-[#181a1f] flex items-center px-3 text-[11px] font-bold text-[#abb2bf] tracking-wider justify-between h-8">
        <span>ANIMATIONS</span>
        <button
          onClick={handleCreate}
          className="text-[#98c379] hover:text-white transition-colors cursor-pointer text-[11px]"
        >
          + NEW
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {customAnimations.length === 0 ? (
          <div className="text-[#5c6370] text-[11px] px-4 py-4 italic text-center">
            No animations yet. Click + NEW to create one.
          </div>
        ) : (
          customAnimations.map(anim => (
            <div
              key={anim.id}
              onClick={() => {
                setActiveAnimationId(anim.id);
                setActiveKeyframeId(anim.keyframes[0]?.id || null);
              }}
              className={`group flex items-center justify-between py-2 px-3 text-[12px] cursor-pointer transition-colors duration-100 ${
                activeAnimationId === anim.id
                  ? 'bg-[#2c313a] text-white'
                  : 'text-[#abb2bf] hover:bg-[#2c313a] hover:text-white'
              }`}
            >
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate font-medium">{anim.name}</span>
                <span className="text-[9px] text-[#5c6370] mt-0.5">
                  {anim.duration}ms · {anim.keyframes.length} kf
                </span>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                <button
                  onClick={(e) => handleDuplicate(anim.id, e)}
                  className="text-[#61afef] hover:text-white w-5 h-5 flex items-center justify-center rounded hover:bg-[#333842]"
                  title="Duplicate"
                >
                  📋
                </button>
                <button
                  onClick={(e) => handleDelete(anim.id, e)}
                  className={`w-5 h-5 flex items-center justify-center rounded ${
                    confirmDeleteId === anim.id
                      ? 'text-[#ff7b85] bg-[#e06c75]/20'
                      : 'text-[#e06c75] hover:text-[#ff7b85] hover:bg-[#333842]'
                  }`}
                  title={confirmDeleteId === anim.id ? 'Click again to confirm' : 'Delete'}
                >
                  {confirmDeleteId === anim.id ? '!' : '✕'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer actions */}
      <div className="border-t border-[#181a1f] flex">
        <button
          onClick={handleImport}
          className="flex-1 py-2 text-[10px] text-[#5c6370] hover:text-[#abb2bf] hover:bg-[#282c34] transition-colors"
          title="Import Animations"
        >
          Import
        </button>
        <div className="w-px bg-[#181a1f]" />
        <button
          onClick={handleExport}
          className="flex-1 py-2 text-[10px] text-[#5c6370] hover:text-[#abb2bf] hover:bg-[#282c34] transition-colors"
          title="Export Animations"
        >
          Export
        </button>
      </div>
    </div>
  );
}
