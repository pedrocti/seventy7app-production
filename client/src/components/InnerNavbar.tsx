// client/src/components/InnerNavbar.tsx
// Lightweight navbar for public inner pages (blog, etc.)
// Uses wouter navigation — no hash scroll anchors
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import logoImage from '../assets/logo.jpeg';

export default function InnerNavbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const fn = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.nav-header')) setMenuOpen(false);
    };
    document.addEventListener('click', fn);
    return () => document.removeEventListener('click', fn);
  }, [menuOpen]);

  const navLinks = [
    { name: 'Home',     href: '/'          },
    { name: 'Staking',  href: '/invest'    },
    { name: 'Blog',     href: '/blog'      },
    { name: 'Academy',  href: '/mentorship'},
  ];

  return (
    <header className={`nav-header ${scrolled ? 'nav-header--scrolled' : ''}`}>
      <nav className="nav-bar">

        <motion.a href="/" className="nav-logo"
          onClick={e => { e.preventDefault(); setLocation('/'); }}
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <img src={logoImage} alt="Seventy7Hub" style={{ height: 42, width: 'auto', objectFit: 'contain', display: 'block' }} />
        </motion.a>

        <div className="nav-links">
          {navLinks.map((link, i) => (
            <motion.a key={link.name} href={link.href}
              className="nav-link"
              onClick={e => { e.preventDefault(); setLocation(link.href); }}
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.5 }}>
              {link.name}
              <motion.span className="nav-link-underline" initial={{ width: 0 }} whileHover={{ width: '100%' }} transition={{ duration: 0.22 }} />
            </motion.a>
          ))}
        </div>

        <motion.div className="nav-actions" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          {!isLoggedIn && <a href="/login" className="nav-signin">Sign In</a>}
          <motion.a
            href={isLoggedIn ? '/dashboard' : '/register'}
            className="nav-cta"
            whileHover={{ opacity: 0.85 }}
            whileTap={{ scale: 0.97 }}
            onClick={(e) => {
              e.preventDefault();
              setLocation(isLoggedIn ? '/dashboard' : '/register');
            }}
          >
            {isLoggedIn ? 'Dashboard' : 'Get Access'}
          </motion.a>
        </motion.div>

        <button className="nav-burger" onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
          <span className={`nav-burger-bar nav-burger-bar--top    ${menuOpen ? 'nav-burger-bar--open-top'    : ''}`} />
          <span className={`nav-burger-bar nav-burger-bar--mid    ${menuOpen ? 'nav-burger-bar--open-mid'    : ''}`} />
          <span className={`nav-burger-bar nav-burger-bar--bottom ${menuOpen ? 'nav-burger-bar--open-bottom' : ''}`} />
        </button>

      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className="nav-mobile-menu"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <div className="nav-mobile-inner">
              <div className="nav-mobile-links">
                {navLinks.map((link, i) => (
                  <motion.a key={link.name} href={link.href} className="nav-mobile-link"
                    onClick={e => { e.preventDefault(); setMenuOpen(false); setLocation(link.href); }}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.25 }}>
                    <span className="nav-mobile-link-num">0{i + 1}</span>
                    {link.name}
                  </motion.a>
                ))}
              </div>
              <div className="nav-mobile-ctas">

                {!isLoggedIn && (
                  <a
                    href="/login"
                    className="nav-mobile-signin"
                    onClick={(e) => {
                      e.preventDefault();
                      setMenuOpen(false);
                      setLocation('/login');
                    }}
                  >
                    Sign In
                  </a>
                )}

                <a
                  href={isLoggedIn ? '/dashboard' : '/register'}
                  className="nav-mobile-cta"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    setLocation(isLoggedIn ? '/dashboard' : '/register');
                  }}
                >
                  {isLoggedIn ? 'Dashboard' : 'Get Access'}
                </a>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
