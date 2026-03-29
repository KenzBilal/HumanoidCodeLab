import React from 'react';
import { SectionHeader } from '../components/Shared';
import { CodePreview } from '../components/Interactive';
import ScrollReveal from '../components/ScrollReveal';
import { COMMANDS } from '../data/siteData';

const Documentation: React.FC = () => {
  return (
    <div className="docs-page" style={{ padding: '80px 0' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '80px' }}>
        
        {/* Main Content */}
        <div className="docs-content">
          <ScrollReveal>
            <SectionHeader 
              align="left"
              label="Documentation" 
              title="DSL Command Reference"
              description="Master the Humanoid Code Lab Domain Specific Language. Learn how to control joints, manage timing, and build complex logic routines."
            />
          </ScrollReveal>

          {/* Syntax Intro */}
          <section id="syntax" style={{ marginTop: '64px' }}>
            <ScrollReveal>
              <h3 style={{ fontSize: '24px', color: 'var(--text-bright)', marginBottom: '24px' }}>Core Syntax</h3>
              <p style={{ color: 'var(--text-dim)', marginBottom: '32px' }}>
                All commands follow a simple functional pattern. Angles are defined in degrees (0-180), and timing is defined in milliseconds.
              </p>
              <CodePreview code={`// General Pattern\nrobot.part(angle)\nwait(ms)`} />
            </ScrollReveal>
          </section>

          {/* Command Table */}
          <section id="commands" style={{ marginTop: '80px' }}>
            <ScrollReveal>
              <h3 style={{ fontSize: '24px', color: 'var(--text-bright)', marginBottom: '32px' }}>Full API Reference</h3>
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '16px 24px', color: 'var(--text-bright)' }}>Category</th>
                      <th style={{ padding: '16px 24px', color: 'var(--text-bright)' }}>Command</th>
                      <th style={{ padding: '16px 24px', color: 'var(--text-bright)' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMMANDS.map((cmd, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px 24px', color: 'var(--accent)', fontWeight: 600 }}>{cmd.category}</td>
                        <td style={{ padding: '16px 24px', color: 'var(--purple)', fontFamily: 'var(--mono)' }}>{cmd.command}</td>
                        <td style={{ padding: '16px 24px', color: 'var(--text-dim)' }}>{cmd.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollReveal>
          </section>

          {/* AI Usage */}
          <section id="ai" style={{ marginTop: '80px' }}>
            <ScrollReveal>
              <SectionHeader 
                align="left"
                label="AI Integration"
                title="Natural Language to DSL"
                description="Use our AI generation tools to skip the manual coding. Enter any prompt and the IDE will generate the corresponding DSL code for you."
              />
              <div style={{
                padding: '32px',
                background: 'rgba(97, 175, 239, 0.05)',
                border: '1px solid var(--accent)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-dim)',
                fontSize: '15px'
              }}>
                <strong style={{ color: 'var(--accent)', display: 'block', marginBottom: '8px' }}>Pro Tip:</strong>
                Be specific with your prompts. Instead of "make the robot move", try "move the right arm slowly up and down three times".
              </div>
            </ScrollReveal>
          </section>
        </div>

        {/* Sidebar Nav (Desktop only) */}
        <aside className="docs-sidebar" style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
          <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-dim)', marginBottom: '24px' }}>On this page</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <li><a href="#syntax" style={{ fontSize: '14px', color: 'var(--accent)' }}>Core Syntax</a></li>
            <li><a href="#commands" style={{ fontSize: '14px', color: 'var(--text-dim)' }}>API Reference</a></li>
            <li><a href="#ai" style={{ fontSize: '14px', color: 'var(--text-dim)' }}>AI Logic</a></li>
            <li><a href="#examples" style={{ fontSize: '14px', color: 'var(--text-dim)' }}>Examples</a></li>
          </ul>
        </aside>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .container { grid-template-columns: 1fr !important; }
          .docs-sidebar { display: none !important; }
        }
        table tr:last-child { border-bottom: none; }
      `}</style>
    </div>
  );
};

export default Documentation;
