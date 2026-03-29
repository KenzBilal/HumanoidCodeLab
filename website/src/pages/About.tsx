import React from 'react';
import { SectionHeader } from '../components/Shared';
import ScrollReveal from '../components/ScrollReveal';

const About: React.FC = () => {
  return (
    <div className="about-page" style={{ padding: '80px 0' }}>
      <div className="container">
        
        {/* Mission */}
        <ScrollReveal>
          <SectionHeader 
            label="About" 
            title="Democratizing Robotics."
            description="Humanoid Code Lab started with a simple belief: programming a robot should be as easy as writing a spreadsheet. We bridge the gap between high-level AI and low-level hardware control."
          />
        </ScrollReveal>

        {/* Story Section */}
        <section style={{ marginTop: '80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <ScrollReveal>
            <h3 style={{ fontSize: '24px', color: 'var(--text-bright)', marginBottom: '20px' }}>Our Mission</h3>
            <p style={{ color: 'var(--text-dim)', marginBottom: '24px' }}>
              The current landscape of robotics requires deep knowledge of inverse kinematics, motor PID tuning, and complex C++ architectures. While powerful, these barriers prevent educators, hobbyists, and artists from exploring the potential of humanoid robots.
            </p>
            <p style={{ color: 'var(--text-dim)' }}>
              We built Humanoid Code Lab to provide a high-level abstraction layer. Our Custom DSL and AI-generation tools allow anyone to prototype complex humanoid motions in minutes, not weeks.
            </p>
          </ScrollReveal>
          
          <ScrollReveal>
            <div style={{
              padding: '40px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              position: 'relative'
            }}>
              <div style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: 600, marginBottom: '16px' }}>// TECH STACK</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px' }}>
                <li style={{ color: 'var(--text-bright)' }}>• Electron & React (Core App)</li>
                <li style={{ color: 'var(--text-bright)' }}>• Three.js (Physics & Simulation)</li>
                <li style={{ color: 'var(--text-bright)' }}>• Monaco Editor (Code Engine)</li>
                <li style={{ color: 'var(--text-bright)' }}>• SerialPort (Hardware Bridge)</li>
                <li style={{ color: 'var(--text-bright)' }}>• Lucide Icons (Visual System)</li>
              </ul>
            </div>
          </ScrollReveal>
        </section>

        {/* Vision Section */}
        <section style={{ marginTop: '120px' }}>
          <ScrollReveal>
            <SectionHeader 
              label="Roadmap" 
              title="The Future of HCL"
              description="We're just getting started. Here is what we're building for the next generation of humanoid control."
            />
          </ScrollReveal>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '64px'
          }}>
            <ScrollReveal>
              <div style={{ padding: '32px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                <h4 style={{ color: 'var(--purple)', marginBottom: '12px' }}>Cloud Sync</h4>
                <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Sync your motion libraries across devices and share routines with the global community.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div style={{ padding: '32px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                <h4 style={{ color: 'var(--green)', marginBottom: '12px' }}>Mobile Viewport</h4>
                <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Control your physical robot and monitor execution status directly from your smartphone.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div style={{ padding: '32px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                <h4 style={{ color: 'var(--accent)', marginBottom: '12px' }}>Open Vision</h4>
                <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Integrated OpenCV nodes allowing the robot to react to its environment in real-time.</p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Contributing */}
        <section style={{ marginTop: '120px', textAlign: 'center' }}>
          <ScrollReveal>
            <h3 style={{ fontSize: '28px', color: 'var(--text-bright)', marginBottom: '24px' }}>Built by Developers, for Developers</h3>
            <p style={{ color: 'var(--text-dim)', maxWidth: '600px', margin: '0 auto 32px' }}>
              Humanoid Code Lab is an open-source project. We welcome contributions, feature requests, and community plugins.
            </p>
            <a href="https://github.com/KenzBilal/HumanoidCodeLab" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              Contribute on GitHub
            </a>
          </ScrollReveal>
        </section>

      </div>

      <style>{`
        @media (max-width: 900px) {
          section { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </div>
  );
};

export default About;
