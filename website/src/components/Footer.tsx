import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.webp';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'Features', path: '/#features' },
    { name: 'DSL', path: '/docs' },
    { name: 'Download', path: '/download' },
    { name: 'Support', path: '/support' },
    { name: 'GitHub', path: 'https://github.com/KenzBilal/HumanoidCodeLab' },
  ];

  const socialLinks = [
    { name: 'Email', icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22,6 12,13 2,6', path: 'mailto:humanoidcodelab@gmail.com' },
    { name: 'Telegram', icon: 'M22 2 11 13 M22 2 15 22 11 13 2 9 22 2', path: 'https://t.me/HumanoidCodeLab' },
    { name: 'Instagram', icon: 'M2 2 L22 2 L22 22 L2 22 Z M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5 L17.51 6.5', path: 'https://instagram.com/hclab.ai' },
    { name: 'GitHub', icon: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22', path: 'https://github.com/KenzBilal/HumanoidCodeLab' },
  ];

  return (
    <footer className="footer" style={{
      borderTop: '1px solid var(--border)',
      padding: '64px 0 32px',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div className="footer-content" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '32px'
        }}>
          <div className="footer-logo" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 700,
            color: 'var(--text-bright)',
            fontSize: '15px'
          }}>
            <img 
              src={logo} 
              alt="Humanoid Code Lab" 
              style={{ width: '28px', height: '28px', objectFit: 'contain' }} 
            />
            Humanoid Code Lab
          </div>

          <ul className="footer-links" style={{
            display: 'flex',
            gap: '28px',
            listStyle: 'none'
          }}>
            {footerLinks.map((link) => (
              <li key={link.name}>
                {link.path.startsWith('http') ? (
                  <a href={link.path} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: 'var(--text-dim)', transition: 'color 0.2s' }}>{link.name}</a>
                ) : (
                  <Link to={link.path} style={{ fontSize: '13px', color: 'var(--text-dim)', transition: 'color 0.2s' }}>{link.name}</Link>
                )}
              </li>
            ))}
          </ul>

          <div className="footer-socials" style={{ display: 'flex', gap: '12px' }}>
            {socialLinks.map((social) => (
              <a 
                key={social.name}
                href={social.path} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-btn" 
                title={social.name}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-dim)',
                  transition: 'all 0.25s'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {social.icon.split(' ').map((p, i) => (
                    p.startsWith('M') ? <path key={i} d={p} /> : p.startsWith('L') ? <line key={i} x1={p.split(' ')[1]} y1={p.split(' ')[2]} x2={p.split(' ')[3]} y2={p.split(' ')[4]} /> : null
                  ))}
                  {/* Simplified icons using inline path data */}
                  {social.name === 'Email' && <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>}
                  {social.name === 'Telegram' && <><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" /></>}
                  {social.name === 'Instagram' && <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></>}
                  {social.name === 'GitHub' && <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />}
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="footer-bottom" style={{
          marginTop: '40px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: 'var(--text-dim)'
        }}>
          <p>&copy; {currentYear} Humanoid Code Lab. Built for the robot generation.</p>
          <p>
            Licensed under Apache 2.0. Built by <a href="https://github.com/KenzBilal" target="_blank" rel="noopener noreferrer">KenzBilal</a>
          </p>
        </div>
      </div>

      <style>{`
        .footer-links a:hover { color: var(--text-bright) !important; }
        .social-btn:hover { color: var(--accent) !important; border-color: var(--accent) !important; transform: translateY(-2px); }
        @media (max-width: 640px) {
          .footer-content { flex-direction: column; text-align: center; }
          .footer-links { flex-direction: column; gap: 16px; }
          .footer-bottom { flex-direction: column; text-align: center; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
