import React from 'react';
import { SectionHeader } from '../components/Shared';
import { FaqAccordion, ContactCard } from '../components/Interactive';
import ScrollReveal from '../components/ScrollReveal';
import { FAQ } from '../data/siteData';

const Support: React.FC = () => {
  return (
    <div className="support-page" style={{ padding: '80px 0' }}>
      <div className="container">
        
        {/* Support Hero */}
        <ScrollReveal>
          <SectionHeader 
            label="Support" 
            title="We're here to help you build."
            description="Find answers to common questions or reach out to our team directly via our community channels."
          />
        </ScrollReveal>

        {/* FAQ Grid */}
        <section style={{ marginTop: '80px', maxWidth: '800px', margin: '80px auto 0' }}>
          <ScrollReveal>
            <h3 style={{ fontSize: '24px', color: 'var(--text-bright)', marginBottom: '32px', textAlign: 'center' }}>Frequently Asked Questions</h3>
            <div className="faq-list">
              {FAQ.map((item, idx) => (
                <FaqAccordion key={idx} question={item.q} answer={item.a} />
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* Contact Grid */}
        <section style={{ marginTop: '120px' }}>
          <ScrollReveal>
            <SectionHeader 
              label="Contact" 
              title="Official Channels"
              description="Connect with our developer community and support team across our social and email platforms."
            />
          </ScrollReveal>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginTop: '64px'
          }}>
            <ScrollReveal>
              <ContactCard 
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
                title="Email Support"
                value="humanoidcodelab@gmail.com"
                link="mailto:humanoidcodelab@gmail.com"
              />
            </ScrollReveal>

            <ScrollReveal>
              <ContactCard 
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></svg>}
                title="Telegram Community"
                value="t.me/HumanoidCodeLab"
                link="https://t.me/HumanoidCodeLab"
              />
            </ScrollReveal>

            <ScrollReveal>
              <ContactCard 
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>}
                title="Instagram Updates"
                value="@hclab.ai"
                link="https://instagram.com/hclab.ai"
              />
            </ScrollReveal>

            <ScrollReveal>
              <ContactCard 
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>}
                title="Issue Tracker"
                value="GitHub Discussions"
                link="https://github.com/KenzBilal/HumanoidCodeLab/discussions"
              />
            </ScrollReveal>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Support;
