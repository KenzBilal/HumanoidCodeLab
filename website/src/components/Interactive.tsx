import React, { useState } from 'react';

interface DownloadCardProps {
  os: string;
  icon: React.ReactNode;
  format: string;
  url: string;
  recommended?: boolean;
}

export const DownloadCard: React.FC<DownloadCardProps> = ({ os, icon, format, url, recommended }) => (
  <div className={`download-card ${recommended ? 'recommended' : ''}`} style={{
    padding: '32px',
    background: 'var(--bg-card)',
    border: recommended ? '2px solid var(--accent)' : '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '16px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative'
  }}>
    {recommended && <span style={{
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '4px 12px',
      background: 'var(--accent)',
      color: 'var(--bg)',
      fontSize: '11px',
      fontWeight: 800,
      borderRadius: '20px',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    }}>Most Popular</span>}
    
    <div className="os-icon" style={{
      width: '64px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-bright)'
    }}>{icon}</div>
    
    <div className="os-info">
      <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-bright)' }}>{os}</h3>
      <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>File format: {format}</p>
    </div>

    <a href={url} className={recommended ? 'btn btn-primary' : 'btn btn-secondary'} style={{ width: '100%' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Download for {os}
    </a>
  </div>
);

interface FaqItemProps {
  question: string;
  answer: string | React.ReactNode;
}

export const FaqAccordion: React.FC<FaqItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`} style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      marginBottom: '16px',
      overflow: 'hidden'
    }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-bright)' }}>{question}</span>
        <svg 
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', color: 'var(--accent)' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div style={{
        maxHeight: isOpen ? '300px' : '0',
        transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '0 24px 24px', color: 'var(--text-dim)', fontSize: '14px', lineHeight: 1.6 }}>{answer}</div>
      </div>
    </div>
  );
};

interface CodePreviewProps {
  code: string;
  title?: string;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ code, title = "robot.js" }) => (
  <div className="code-preview" style={{
    background: '#161b22',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
  }}>
    <div className="code-header" style={{
      padding: '12px 20px',
      background: 'rgba(255,255,255,0.03)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
      </div>
      <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>{title}</span>
    </div>
    <div className="code-body" style={{ padding: '24px', overflowX: 'auto' }}>
      <pre style={{ margin: 0 }}>
        <code style={{ background: 'none', border: 'none', padding: 0 }}>{code}</code>
      </pre>
    </div>
  </div>
);

interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  link: string;
}

export const ContactCard: React.FC<ContactCardProps> = ({ icon, title, value, link }) => (
  <a href={link} className="contact-card" style={{
    padding: '24px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transition: 'all 0.25s'
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '10px',
      background: 'rgba(97, 175, 239, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--accent)'
    }}>{icon}</div>
    <div>
      <h4 style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '4px' }}>{title}</h4>
      <p style={{ fontSize: '15px', color: 'var(--text-bright)', fontWeight: 600 }}>{value}</p>
    </div>
  </a>
);
