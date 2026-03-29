import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ThreeScene from './components/ThreeScene';

// Pages
import Home from './pages/Home';
import Download from './pages/Download';
import Documentation from './pages/Documentation';
import Support from './pages/Support';
import About from './pages/About';

const App: React.FC = () => {
  const { pathname, hash } = useLocation();

  // Handle scroll to hash anchors (e.g., /#features)
  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return (
    <div className="app-layout" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative'
    }}>
      <ThreeScene />
      <Navbar />
      
      <main style={{ flex: 1, paddingTop: 'var(--nav-height)', position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/download" element={<Download />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/support" element={<Support />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
