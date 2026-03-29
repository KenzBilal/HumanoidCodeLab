import React from 'react';
import { Link } from 'react-router-dom';
import { SectionHeader, FeatureCard } from '../components/Shared';
import { CodePreview } from '../components/Interactive';
import ScrollReveal from '../components/ScrollReveal';
import { FEATURES } from '../data/siteData';

const Home: React.FC = () => {
  const exampleCode = `// AI-Generated Dance Routine
loop(4) {
  robot.left_arm(45)
  robot.right_arm(135)
  wait(400)
  robot.left_arm(135)
  robot.right_arm(45)
  wait(400)
}
robot.head(90)
wait(1000)
robot.head(0)`;

  return (
    <div className="home-page">
      {/* ─── Hero Section ─── */}
      <section className="hero" style={{ 
        padding: '120px 0 80px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div className="container">
          <ScrollReveal>
            <h1 style={{ 
              fontSize: 'clamp(40px, 6vw, 72px)', 
              fontWeight: 900, 
              color: 'var(--text-bright)',
              lineHeight: '1.05',
              letterSpacing: '-2px',
              marginBottom: '32px'
            }}>
              The IDE for the <span className="gradient">Humanoid</span> Generation
            </h1>
            <p style={{
              fontSize: 'clamp(18px, 1.5vw, 22px)',
              color: 'var(--text-dim)',
              maxWidth: '800px',
              margin: '0 auto 48px',
              lineHeight: 1.5
            }}>
              Program 3D robots with natural language. Humanoid Code Lab combines AI-powered movement generation with a pro-grade IDE for hardware control.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="hero-actions" style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <Link to="/download" className="btn btn-primary">
                Download for Linux / Windows
              </Link>
              <Link to="/docs" className="btn btn-secondary">
                Explore Documentation
              </Link>
            </div>
          </ScrollReveal>

          {/* Intro Video Placeholder */}
          <ScrollReveal>
            <div className="hero-video" style={{
              marginTop: '80px',
              borderRadius: '24px',
              border: '1px solid var(--border)',
              background: 'rgba(22, 27, 34, 0.7)',
              backdropFilter: 'blur(30px)',
              aspectRatio: '16 / 9',
              maxWidth: '1000px',
              margin: '80px auto 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 40px 100px rgba(0,0,0,0.6)'
            }}>
              <div style={{ color: 'var(--text-dim)', textAlign: 'center' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.5 }}><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>Intro Video coming soon</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" style={{ padding: '100px 0' }}>
        <div className="container">
          <ScrollReveal>
            <SectionHeader 
              label="Capabilities" 
              title="Everything you need to build advanced robotics apps."
            />
          </ScrollReveal>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px',
            marginTop: '64px'
          }}>
            {FEATURES.map((feature) => (
              <ScrollReveal key={feature.id}>
                <FeatureCard {...feature} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Code Preview Section ─── */}
      <section style={{ padding: '100px 0', background: 'rgba(0,0,0,0.2)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '64px',
            alignItems: 'center'
          }}>
            <ScrollReveal>
              <SectionHeader 
                align="left"
                label="Simple DSL"
                title="Code that talks to robots."
                description="Our Domain Specific Language simplifies complex joint movements into single lines of code. Loops, variables, and logic are fully supported."
              />
              <Link to="/docs" className="btn btn-secondary" style={{ marginTop: '32px' }}>View Full Command Set</Link>
            </ScrollReveal>

            <ScrollReveal>
              <CodePreview code={exampleCode} title="dance_routine.js" />
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{
              padding: '80px 40px',
              background: 'linear-gradient(135deg, rgba(97, 175, 239, 0.1), rgba(198, 120, 221, 0.1))',
              borderRadius: '24px',
              border: '1px solid var(--border)',
              backdropFilter: 'blur(10px)'
            }}>
              <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-bright)', marginBottom: '16px' }}>Ready to start your robot journey?</h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '16px', marginBottom: '32px' }}>Download Humanoid Code Lab today and start programming your future.</p>
              <Link to="/download" className="btn btn-primary">Get the App for Free</Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Home;
