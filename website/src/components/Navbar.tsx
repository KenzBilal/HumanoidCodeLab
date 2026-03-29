import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.webp';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Features', path: '/#features' },
    { name: 'DSL', path: '/docs' },
    { name: 'Download', path: '/download' },
    { name: 'Support', path: '/support' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path.startsWith('/#')) return location.pathname === '/' && location.hash === path.substring(1);
    return location.pathname === path;
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: '14px 0',
      background: isScrolled ? 'rgba(14, 17, 23, 0.85)' : 'rgba(14, 17, 23, 0.4)',
      backdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: isScrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link to="/" className="nav-logo" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 800,
          fontSize: '18px',
          color: 'var(--text-bright)',
          letterSpacing: '-0.5px'
        }}>
          <img 
            src={logo} 
            alt="Humanoid Code Lab" 
            style={{ width: '32px', height: '32px', objectFit: 'contain' }} 
          />
          Humanoid Code Lab
        </Link>

        {/* Desktop Links */}
        <ul className="nav-links" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          listStyle: 'none'
        }}>
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link 
                to={link.path} 
                className={isActive(link.path) ? 'active' : ''}
                style={{
                  color: isActive(link.path) ? 'var(--accent)' : 'var(--text-dim)',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'color 0.25s',
                  position: 'relative'
                }}
              >
                {link.name}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/download" className="nav-cta" style={{
              padding: '8px 20px',
              background: 'var(--accent)',
              color: 'var(--bg)',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              transition: 'all 0.2s'
            }}>
              Get the App
            </Link>
          </li>
        </ul>

        {/* Mobile Toggle (CSS handles visibility) */}
        <button 
          className="nav-toggle" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {/* Burger lines */}
        </button>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .nav-links {
            display: ${isOpen ? 'flex' : 'none'} !important;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(14, 17, 23, 0.95);
            backdrop-filter: blur(20px);
            padding: 24px;
            gap: 20px;
            border-bottom: 1px solid var(--border);
          }
          .nav-toggle { display: block !important; }
        }
        .nav-links a:hover { color: var(--text-bright) !important; }
        .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 4px 20px var(--accent-glow); }
      `}</style>
    </nav>
  );
};

export default Navbar;
