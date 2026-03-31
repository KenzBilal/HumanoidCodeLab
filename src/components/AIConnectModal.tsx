import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useStore } from '../store';

const PROVIDERS = [
  { id: 'gemini', name: 'Google Gemini', getUrl: 'https://aistudio.google.com/apikey', color: '#4285f4', model: 'gemini-2.0-flash-exp' },
  { id: 'openai', name: 'OpenAI GPT-4o', getUrl: 'https://platform.openai.com/api-keys', color: '#10a37f', model: 'gpt-4o' },
  { id: 'claude', name: 'Anthropic Claude', getUrl: 'https://console.anthropic.com/keys', color: '#d97757', model: 'claude-3-7-sonnet-20250219' },
  { id: 'grok', name: 'xAI Grok', getUrl: 'https://console.x.ai', color: '#000000', model: 'grok-beta' },
] as const;

export function AIConnectModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { setGeminiApiKey, setAiProvider, addLog } = useStore();
  const [selectedProvider, setSelectedProvider] = useState<string>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const provider = PROVIDERS.find(p => p.id === selectedProvider) || PROVIDERS[0];

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key.');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      await ai.models.list();
      setGeminiApiKey(apiKey.trim());
      setAiProvider(selectedProvider as any);
      addLog('SUCCESS', `AI connected: ${provider.name}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid API key. Please check and try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isConnecting) handleConnect();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#282c34] border border-[#181a1f] rounded-lg shadow-2xl w-[420px] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#181a1f] bg-[#21252b] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#4d78cc]/15 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4d78cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-[14px]">Connect AI Provider</h3>
            <p className="text-[11px] text-[#5c6370]">Add your API key to unlock AI features</p>
          </div>
          <button onClick={onClose} className="text-[#5c6370] hover:text-white transition-colors text-[18px] leading-none">✕</button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          {/* Provider selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-[#5c6370] uppercase tracking-wider">Provider</label>
            <select
              value={selectedProvider}
              onChange={e => setSelectedProvider(e.target.value)}
              className="w-full bg-[#1e2227] border border-[#181a1f] rounded px-3 py-2.5 text-[13px] text-[#abb2bf] focus:outline-none focus:border-[#4d78cc] cursor-pointer"
            >
              {PROVIDERS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-[#5c6370] uppercase tracking-wider">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
                placeholder="Paste your API key here..."
                className="w-full bg-[#1e2227] border border-[#181a1f] rounded px-3 py-2.5 pr-10 text-[13px] text-white placeholder-[#5c6370] focus:outline-none focus:border-[#4d78cc]"
                autoFocus
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5c6370] hover:text-[#abb2bf] transition-colors"
              >
                {showKey ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            <a
              href={provider.getUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#4d78cc] hover:text-[#61afef] flex items-center gap-1 mt-0.5"
            >
              Get your key from {provider.name} →
            </a>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[#e06c75]/10 border border-[#e06c75]/20 rounded px-3 py-2 text-[12px] text-[#e06c75]">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#181a1f] bg-[#21252b] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-[13px] font-medium bg-[#3e4451] text-[#abb2bf] hover:text-white hover:bg-[#4c5363] transition-colors"
            disabled={isConnecting}
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={isConnecting || !apiKey.trim()}
            className="px-5 py-2 rounded text-[13px] font-semibold bg-[#4d78cc] text-white hover:bg-[#4065b4] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Connecting...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Connect
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
