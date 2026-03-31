import React from 'react';
import { SectionHeader } from '../components/Shared';
import { DownloadCard } from '../components/Interactive';
import ScrollReveal from '../components/ScrollReveal';
import { RELEASES } from '../data/siteData';

const Download: React.FC = () => {
  return (
    <div className="download-page" style={{ padding: '80px 0' }}>
      <div className="container">
        <ScrollReveal>
          <SectionHeader 
            label="Download" 
            title="Available on all desktop platforms."
            description="Humanoid Code Lab is a standalone desktop application. Get the latest release for your operating system below."
          />
        </ScrollReveal>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginTop: '64px'
        }}>
          <ScrollReveal>
            <DownloadCard 
              os="Linux" 
              format=".AppImage" 
              recommended={true}
              url="https://github.com/KenzBilal/HumanoidCodeLab/releases/download/v1.2.2/Humanoid-Code-Lab-1.2.2.AppImage"
              icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5Z"/><path d="M12 21c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5Z"/><path d="M5 12h14"/></svg>}
            />
          </ScrollReveal>

          <ScrollReveal>
            <DownloadCard 
              os="Windows" 
              format=".exe" 
              url="https://github.com/KenzBilal/HumanoidCodeLab/releases/download/v1.2.2/Humanoid-Code-Lab-Setup-1.2.2.exe"
              icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l17-3V5Z"/><path d="M12 5v14"/><path d="M4 12h17"/></svg>}
            />
          </ScrollReveal>

          <ScrollReveal>
            <DownloadCard 
              os="macOS" 
              format=".dmg" 
              url="https://github.com/KenzBilal/HumanoidCodeLab/releases/download/v1.2.2/Humanoid-Code-Lab-1.2.2.dmg"
              icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.94c1.97 0 3.06-1.26 3.06-2.46 0-1.51-1.12-2.12-2.31-2.12-.22 0-.44.02-.65.06l-.16.03V12.1c.26.06.52.09.79.09.43 0 .84-.08 1.21-.24.37-.16.7-.39.97-.68.27-.29.48-.64.62-1.03.14-.39.21-.81.21-1.25 0-.43-.07-.85-.21-1.24a3.13 3.13 0 0 0-.62-1.02 3.1 3.1 0 0 0-.97-.68A3.3 3.3 0 0 0 13.04 6c-.27 0-.53.03-.79.09v-4.3c.21.04.43.06.65.06 1.19 0 2.31-.61 2.31-2.12C15.21-1.46 14.12-2.72 12.15-2.72c-1.97 0-3.06 1.26-3.06 2.46 0 1.51 1.12 2.12 2.31 2.12.22 0 .44-.02.65-.06l.16-.03v4.35c-.26-.06-.52-.09-.79-.09-.43 0-.84.08-1.21.24s-.7.39-.97.68-.48.64-.62 1.03c-.14.39-.21.81-.21 1.25 0 .43.07.85.21 1.24s.35.7.62 1.02.6.52.97.68c.37.16.78.24 1.21.24.27 0 .53-.03.79-.09v4.35c-.21-.04-.43-.06-.65-.06-1.19 0-2.31.61-2.31 2.12 0 1.2 1.09 2.46 3.06 2.46Z"/></svg>}
            />
          </ScrollReveal>
        </div>

        {/* Release History */}
        <section style={{ marginTop: '120px' }}>
          <ScrollReveal>
            <SectionHeader 
              align="left"
              label="Changelog" 
              title="Recent Releases"
            />
          </ScrollReveal>
          
          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {RELEASES.map((release) => (
              <ScrollReveal key={release.version}>
                <div style={{
                  padding: '24px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '24px',
                  flexWrap: 'wrap'
                }}>
                  <div>
                    <h3 style={{ fontSize: '18px', color: 'var(--text-bright)', marginBottom: '8px' }}>Version {release.version}</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>{release.notes}</p>
                  </div>
                  <div style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 600 }}>{release.date}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* System Requirements */}
        <section style={{ marginTop: '100px', padding: '48px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <ScrollReveal>
            <h3 style={{ fontSize: '24px', color: 'var(--text-bright)', marginBottom: '24px' }}>System Requirements</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
              <div>
                <h4 style={{ color: 'var(--accent)', fontSize: '14px', marginBottom: '8px' }}>OS Support</h4>
                <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Windows 10/11, Ubuntu 20.04+, macOS 12+</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--accent)', fontSize: '14px', marginBottom: '8px' }}>Hardware</h4>
                <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Any modern CPU with 4GB RAM. Discrete GPU recommended for best 3D performance.</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--accent)', fontSize: '14px', marginBottom: '8px' }}>Other</h4>
                <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>USB Port for serial communication with hardware.</p>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </div>
  );
};

export default Download;
