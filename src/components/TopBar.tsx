import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { Queue } from '../engine/Queue';
import { Humanoid } from '../engine/Humanoid';
import { Play, Square, Bug, StepForward, GraduationCap } from 'lucide-react';
import { AIConnectModal } from './AIConnectModal';
import { AIGenerateModal } from './AIGenerateModal';
import { SettingsModal } from './SettingsModal';
import { CurriculumModal } from './CurriculumModal';

type UpdateState = 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error' | 'not-available';

export function TopBar({ bot, onRun }: { bot: Humanoid | null, onRun: () => void }) {
  const { addLog, setRunning, isRunning, view, setView, geminiApiKey, isDebugMode, setIsDebugMode, stepNext, debugResolver } = useStore();
  const [version, setVersion] = useState('');
  const [updateState, setUpdateState] = useState<UpdateState>('idle');
  const [newVersion, setNewVersion] = useState('');
  const [downloadPercent, setDownloadPercent] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);

  const aiConnected = !!geminiApiKey;

  // Get version and listen for update events
  useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.getVersion().then(v => setVersion(v));
    window.electronAPI.onUpdateEvent((type, data) => {
      switch (type) {
        case 'checking':
          setUpdateState('checking');
          break;
        case 'available':
          setUpdateState('available');
          setNewVersion(data?.version || '');
          addLog('INFO', `Update available: v${data?.version}`);
          break;
        case 'not-available':
          setUpdateState('not-available');
          setTimeout(() => setUpdateState('idle'), 3000);
          break;
        case 'progress':
          setUpdateState('downloading');
          setDownloadPercent(data?.percent || 0);
          break;
        case 'downloaded':
          setUpdateState('downloaded');
          setNewVersion(data?.version || '');
          addLog('SUCCESS', `Update v${data?.version} downloaded. Restart to install.`);
          break;
        case 'error':
          setUpdateState('error');
          setErrorMsg(data?.message || 'Unknown error');
          addLog('ERROR', `Update error: ${data?.message}`);
          setTimeout(() => setUpdateState('idle'), 5000);
          break;
      }
    });
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCheckUpdate = () => {
    if (!window.electronAPI) return;
    setShowMenu(false);
    setUpdateState('checking');
    window.electronAPI.checkForUpdate();
  };

  const handleInstallUpdate = () => {
    if (!window.electronAPI) return;
    window.electronAPI.installUpdate();
  };

  const handleRunNormal = () => {
    setIsDebugMode(false);
    onRun();
  };

  const handleRunDebug = () => {
    setIsDebugMode(true);
    onRun();
  };

  const handleReset = async () => {
    if (!bot) return;
    Queue.stop();
    if (debugResolver) stepNext(); // force resolve to finish
    await new Promise(r => setTimeout(r, 80));
    addLog('INFO', 'Resetting humanoid\u2026');
    await bot.resetPose(true);
    addLog('SUCCESS', 'Reset complete.');
    setRunning(false);
    setIsDebugMode(false);
  };

  const handleStop = () => {
    Queue.stop();
    if (debugResolver) stepNext();
    setRunning(false);
    setIsDebugMode(false);
  }

  const handleAIClick = () => {
    if (aiConnected) {
      setShowAIModal(true);
    } else {
      setShowConnectModal(true);
    }
  };

  const renderUpdateBadge = () => {
    if (!window.electronAPI) return null;
    switch (updateState) {
      case 'checking':
        return (
          <span className="flex items-center gap-1 text-[10px] text-[#5c6370]">
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Checking...
          </span>
        );
      case 'available':
        return <span className="flex items-center gap-1 text-[10px] text-[#98c379] font-medium">⬇ Update available</span>;
      case 'downloading':
        return (
          <span className="flex items-center gap-1.5 text-[10px] text-[#e5c07b]">
            <span className="w-16 h-1.5 bg-[#333842] rounded-full overflow-hidden">
              <span className="block h-full bg-[#e5c07b] rounded-full transition-all duration-300" style={{ width: `${downloadPercent}%` }} />
            </span>
            {downloadPercent}%
          </span>
        );
      case 'downloaded':
        return (
          <button onClick={handleInstallUpdate} className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-[#98c379]/20 text-[#98c379] hover:bg-[#98c379]/30 rounded transition-colors animate-pulse">
            ⟳ Restart to Update
          </button>
        );
      case 'not-available':
        return <span className="text-[10px] text-[#5c6370]">Up to date</span>;
      case 'error':
        return <span className="text-[10px] text-[#e06c75]" title={errorMsg}>Update error</span>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="h-[42px] bg-[#2b2f36] border-b border-[#181a1f] flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4 text-[13px] text-[#abb2bf] font-medium h-full">
          <span
            onClick={() => setView('editor')}
            className={`cursor-pointer hover:text-white border-b-2 h-full flex items-center ${view === 'editor' ? 'border-white text-white' : 'border-transparent hover:border-white'}`}
          >
            Editor
          </span>
          <span
            onClick={() => setView('animator')}
            className={`cursor-pointer hover:text-white border-b-2 h-full flex items-center ${view === 'animator' ? 'border-white text-white' : 'border-transparent hover:border-white'}`}
          >
            Animator
          </span>
        </div>

        <div className="flex items-center gap-1.5 opacity-90">
          <span className="text-white font-bold text-[14px] flex items-center gap-2">
            Humanoid Code Lab
            {isRunning && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" title="Running script..." />}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {view === 'editor' && (
            <div className="flex items-center gap-2 mr-2">
              {isRunning ? (
                <>
                  <button onClick={handleStop} className="flex items-center gap-1.5 px-3 py-1 bg-[#e06c75]/20 text-[#e06c75] hover:bg-[#e06c75]/30 rounded text-xs font-semibold transition-colors">
                    <Square size={12} fill="currentColor" /> Stop
                  </button>
                  {isDebugMode && (
                    <button 
                      onClick={stepNext} 
                      disabled={!debugResolver}
                      className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs font-semibold transition-colors"
                    >
                      <StepForward size={12} fill="currentColor" /> Step
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button onClick={handleRunNormal} className="flex items-center gap-1.5 px-3 py-1 bg-[#98c379]/20 text-[#98c379] hover:bg-[#98c379]/30 rounded text-xs font-semibold transition-colors">
                    <Play size={12} fill="currentColor" /> Run
                  </button>
                  <button onClick={handleRunDebug} className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 rounded text-xs font-semibold transition-colors">
                    <Bug size={12} /> Debug
                  </button>
                </>
              )}
              <div className="w-px h-4 bg-[#3E4451] ml-2" />
            </div>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-[12px] font-semibold transition-colors duration-120 border bg-[#2b2f36] border-[#181a1f] text-white hover:bg-[#333842] cursor-pointer"
          >
            ↺ Reset
          </button>

          <button
            onClick={() => setShowCurriculumModal(true)}
            className="flex items-center justify-center w-8 h-8 rounded text-[14px] bg-[#333842] text-[#5c6370] hover:text-[#abb2bf] hover:bg-green-600/20 hover:text-green-400 transition-colors cursor-pointer"
            title="Curriculum"
          >
            <GraduationCap size={16} />
          </button>

          {/* AI Button — locked or unlocked */}
          <button
            onClick={handleAIClick}
            title={aiConnected ? 'AI Generate' : 'Connect AI Provider'}
            className={`flex items-center justify-center w-8 h-8 rounded text-[14px] transition-all cursor-pointer ${
              aiConnected
                ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'
                : 'bg-[#333842] text-[#5c6370] hover:text-[#abb2bf] hover:bg-[#3e4451]'
            }`}
          >
            {aiConnected ? '✨' : '🔒'}
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center justify-center w-8 h-8 rounded text-[14px] bg-[#333842] text-[#5c6370] hover:text-[#abb2bf] hover:bg-[#3e4451] transition-colors cursor-pointer"
            title="Settings"
          >
            ⚙
          </button>

          {/* Update section */}
          <div className="relative flex items-center gap-2" ref={menuRef}>
            {renderUpdateBadge()}
            {version && (
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-[10px] text-[#5c6370] hover:text-[#abb2bf] transition-colors cursor-pointer px-1"
              >
                v{version}
              </button>
            )}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[#282c34] border border-[#181a1f] rounded shadow-xl py-1 z-50">
                <button
                  onClick={handleCheckUpdate}
                  className="w-full text-left px-3 py-2 text-[12px] text-[#abb2bf] hover:bg-[#2c313a] hover:text-white transition-colors"
                >
                  Check for Updates
                </button>
                <div className="px-3 py-1 text-[10px] text-[#5c6370] border-t border-[#181a1f]">
                  Version {version}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showConnectModal && (
        <AIConnectModal
          onClose={() => setShowConnectModal(false)}
          onSuccess={() => setShowAIModal(true)}
        />
      )}
      {showAIModal && (
        <AIGenerateModal onClose={() => setShowAIModal(false)} />
      )}
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          onKeyChange={() => {}}
        />
      )}
      {showCurriculumModal && (
        <CurriculumModal onClose={() => setShowCurriculumModal(false)} />
      )}
    </>
  );
}
