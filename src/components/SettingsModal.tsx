import { useState } from 'react';
import { useStore } from '../store';

const PROVIDER_NAMES: Record<string, string> = {
  gemini: 'Google Gemini',
  openai: 'OpenAI',
  claude: 'Anthropic Claude',
};

export function SettingsModal({ onClose, onKeyChange }: { onClose: () => void; onKeyChange: () => void }) {
  const { geminiApiKey, aiProvider, setGeminiApiKey, clearApiKey, addLog } = useStore();
  const [showChangeKey, setShowChangeKey] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [showNewKey, setShowNewKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const maskedKey = geminiApiKey
    ? geminiApiKey.slice(0, 4) + '••••••••••••••••' + geminiApiKey.slice(-4)
    : '';

  const handleSaveKey = () => {
    if (!newKey.trim()) return;
    setIsSaving(true);
    setGeminiApiKey(newKey.trim());
    addLog('SUCCESS', 'API key updated.');
    setIsSaving(false);
    setShowChangeKey(false);
    setNewKey('');
  };

  const handleRemoveKey = () => {
    clearApiKey();
    addLog('INFO', 'AI provider disconnected.');
    onKeyChange();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#282c34] border border-[#181a1f] rounded-lg shadow-2xl w-[460px] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#181a1f] bg-[#21252b] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#5c6370]/15 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#abb2bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-[14px]">Settings</h3>
            <p className="text-[11px] text-[#5c6370]">Configure your AI provider and preferences</p>
          </div>
          <button onClick={onClose} className="text-[#5c6370] hover:text-white transition-colors text-[18px] leading-none">✕</button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-5">
          {/* AI Provider Section */}
          <div>
            <div className="text-[11px] font-bold text-[#5c6370] uppercase tracking-wider mb-3">AI Provider</div>

            {geminiApiKey ? (
              <div className="bg-[#1e2227] border border-[#181a1f] rounded-lg p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#98c379]" />
                    <span className="text-[12px] text-[#abb2bf] font-medium">{PROVIDER_NAMES[aiProvider] || aiProvider}</span>
                  </div>
                  <span className="text-[10px] text-[#5c6370]">Connected</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#5c6370] font-mono">{maskedKey}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setShowChangeKey(!showChangeKey)}
                      className="text-[11px] px-2.5 py-1 rounded bg-[#282c34] text-[#abb2bf] hover:text-white border border-[#181a1f] transition-colors"
                    >
                      Change
                    </button>
                    <button
                      onClick={handleRemoveKey}
                      className="text-[11px] px-2.5 py-1 rounded bg-[#e06c75]/10 text-[#e06c75] hover:bg-[#e06c75]/20 border border-[#e06c75]/20 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {showChangeKey && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-[#181a1f]">
                    <div className="relative">
                      <input
                        type={showNewKey ? 'text' : 'password'}
                        value={newKey}
                        onChange={e => setNewKey(e.target.value)}
                        placeholder="Paste new API key..."
                        className="w-full bg-[#282c34] border border-[#181a1f] rounded px-3 py-2 pr-10 text-[12px] text-white placeholder-[#5c6370] focus:outline-none focus:border-[#4d78cc]"
                        autoFocus
                      />
                      <button
                        onClick={() => setShowNewKey(!showNewKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5c6370] hover:text-[#abb2bf]"
                      >
                        {showNewKey ? '🙈' : '👁'}
                      </button>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setShowChangeKey(false); setNewKey(''); }}
                        className="text-[11px] px-3 py-1 rounded text-[#5c6370] hover:text-[#abb2bf]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveKey}
                        disabled={isSaving || !newKey.trim()}
                        className="text-[11px] px-3 py-1 rounded bg-[#4d78cc] text-white hover:bg-[#4065b4] disabled:opacity-50 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#1e2227] border border-[#181a1f] rounded-lg p-4 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#e06c75]" />
                <div className="flex-1">
                  <span className="text-[12px] text-[#5c6370]">No AI provider connected</span>
                  <p className="text-[10px] text-[#4b5263] mt-0.5">Click the lock icon in the top bar to connect.</p>
                </div>
              </div>
            )}
          </div>

          {/* App Info Section */}
          <div>
            <div className="text-[11px] font-bold text-[#5c6370] uppercase tracking-wider mb-3">About</div>
            <div className="bg-[#1e2227] border border-[#181a1f] rounded-lg p-4 flex flex-col gap-1.5 text-[12px] text-[#5c6370]">
              <div className="flex justify-between"><span>App</span><span className="text-[#abb2bf]">Humanoid Code Lab</span></div>
              <div className="flex justify-between"><span>Engine</span><span className="text-[#abb2bf]">Three.js + React 19</span></div>
              <div className="flex justify-between"><span>Storage</span><span className="text-[#abb2bf]">localStorage (offline)</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
