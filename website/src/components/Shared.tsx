import React from 'react';

interface SectionHeaderProps {
  label: string;
  title: string | React.ReactNode;
  description?: string;
  align?: 'left' | 'center';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ label, title, description, align = 'center' }) => (
  <header 
    className="section-header" 
    style={{ 
      textAlign: align,
      maxWidth: align === 'center' ? '700px' : '100%',
      margin: align === 'center' ? '0 auto 48px' : '0 0 40px'
    }}
  >
    <div className="section-label">// {label}</div>
    <h2 className="section-title">{title}</h2>
    {description && <p className="section-desc" style={{ color: 'var(--text-dim)', fontSize: '18px' }}>{description}</p>}
  </header>
);

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="feature-card" style={{
    padding: '32px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    backdropFilter: 'blur(20px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div className="feature-icon" style={{
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      background: 'rgba(97, 175, 239, 0.1)',
      border: '1px solid rgba(97, 175, 239, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--accent)',
      marginBottom: '20px'
    }}>
      {icon}
    </div>
    <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '12px' }}>{title}</h3>
    <p style={{ color: 'var(--text-dim)', fontSize: '15px' }}>{description}</p>
    
    <style>{`
      .feature-card:hover {
        transform: translateY(-8px);
        background: var(--bg-elevated);
        border-color: rgba(97, 175, 239, 0.4);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(97, 175, 239, 0.1);
      }
    `}</style>
  </div>
);
